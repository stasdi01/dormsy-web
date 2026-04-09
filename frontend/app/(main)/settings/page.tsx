"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type CheckState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // UI state
  const [usernameCheck, setUsernameCheck] = useState<CheckState>("idle");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const data = await apiRequest<{ user: User }>("/auth/me", { token });
        const u = data.user;
        setUser(u);
        setFirstName(u.first_name ?? "");
        setLastName(u.last_name ?? "");
        setUsername(u.username ?? "");
        setPhone(u.phone ?? "");
        setInstagram(u.instagram ?? "");
        setAvatarPreview(u.avatar_url ?? null);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  // Debounced username check
  useEffect(() => {
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    const val = username.trim();
    if (!val || val === user?.username) { setUsernameCheck("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) { setUsernameCheck("invalid"); return; }

    setUsernameCheck("checking");
    checkTimeout.current = setTimeout(async () => {
      const token = await getAuthToken();
      try {
        const data = await apiRequest<{ available: boolean }>(
          `/auth/check-username?username=${encodeURIComponent(val)}&userId=${user?.id}`,
          { token }
        );
        setUsernameCheck(data.available ? "available" : "taken");
      } catch {}
    }, 400);

    return () => { if (checkTimeout.current) clearTimeout(checkTimeout.current); };
  }, [username, user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile(e: React.SyntheticEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "Required";
    if (!lastName.trim()) errors.lastName = "Required";
    if (!username.trim()) errors.username = "Required";
    else if (usernameCheck === "invalid") errors.username = "3–20 chars, letters/numbers/underscores only";
    else if (usernameCheck === "taken") errors.username = "Username is already taken";

    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return; }

    setProfileSaving(true);
    setProfileErrors({});

    try {
      const token = await getAuthToken();

      // Upload new avatar if changed
      let avatarUrl = user?.avatar_url ?? null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("photo", avatarFile);
        const res = await fetch(`${API_URL}/uploads/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.url;
        }
      }

      const updated = await apiRequest<{ user: User }>("/users/me", {
        method: "PATCH",
        token,
        body: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim() || null,
          instagram: instagram.trim().replace(/^@/, "") || null,
          avatar_url: avatarUrl,
        },
      });

      setUser(updated.user);
      setAvatarFile(null);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileErrors({ submit: err instanceof Error ? err.message : "Something went wrong" });
    }
    setProfileSaving(false);
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    }
    setPasswordSaving(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "delete my account") return;
    setDeleting(true);
    try {
      const token = await getAuthToken();
      await apiRequest("/users/me", { method: "DELETE", token });
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/sign-up");
    } catch {
      setDeleting(false);
    }
  }

  const usernameIcon = {
    idle: null,
    checking: (
      <svg className="w-4 h-4 animate-spin text-[#9CA3AF]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    ),
    available: (
      <svg className="w-4 h-4 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    taken: (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    invalid: null,
  }[usernameCheck];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-[#F3F4F6] rounded w-1/4" />
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col gap-4">
          <div className="h-4 bg-[#F3F4F6] rounded w-1/3" />
          <div className="h-10 bg-[#F3F4F6] rounded" />
          <div className="h-10 bg-[#F3F4F6] rounded" />
          <div className="h-10 bg-[#F3F4F6] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>

      {/* ── Profile section ── */}
      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-5">Profile</h2>

        <form onSubmit={handleSaveProfile} noValidate className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#00599B]/30 transition-all"
              style={{ minHeight: 0 }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-[#00599B]">
                  {firstName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ minHeight: 0 }}
                className="text-sm text-[#00599B] font-medium hover:underline"
              >
                Change photo
              </button>
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar_url ?? null); }}
                  style={{ minHeight: 0 }}
                  className="block text-xs text-[#9CA3AF] hover:text-red-500 mt-0.5 transition-colors"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-[#9CA3AF] mt-0.5">JPG, PNG or GIF · max 10MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setProfileErrors((p) => ({ ...p, firstName: "" })); }}
              error={profileErrors.firstName}
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setProfileErrors((p) => ({ ...p, lastName: "" })); }}
              error={profileErrors.lastName}
            />
          </div>

          <div>
            <Input
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase()); setProfileErrors((p) => ({ ...p, username: "" })); }}
              error={
                profileErrors.username ||
                (usernameCheck === "taken" ? "Username is already taken" : "") ||
                (usernameCheck === "invalid" ? "3–20 chars, letters/numbers/underscores only" : "")
              }
              rightElement={usernameIcon}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 555 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            hint="Visible on your public profile"
          />

          <Input
            label="Instagram"
            placeholder="yourhandle"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            hint="Visible on your public profile"
          />

          {profileErrors.submit && (
            <p className="text-sm text-red-500">{profileErrors.submit}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              loading={profileSaving}
              disabled={usernameCheck === "checking" || usernameCheck === "taken"}
            >
              Save changes
            </Button>
            {profileSaved && (
              <span className="text-sm text-[#1D9E75] font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Password section ── */}
      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-5">Password</h2>

        <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
            error={passwordError}
            autoComplete="new-password"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" loading={passwordSaving}>
              Update password
            </Button>
            {passwordSaved && (
              <span className="text-sm text-[#1D9E75] font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Updated
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Account section ── */}
      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-1">Account</h2>
        <p className="text-sm text-[#6B7280] mb-5">
          Signed in as <span className="font-medium text-[#111827]">{user?.email}</span>
        </p>

        <button
          onClick={() => setConfirmDelete(true)}
          style={{ minHeight: 0 }}
          className="text-sm text-red-500 hover:text-red-600 font-medium hover:underline transition-colors"
        >
          Delete account
        </button>
      </section>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Delete your account?</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              This will permanently delete your account, all your listings, and all your data. This cannot be undone.
            </p>
            <p className="text-sm text-[#374151] mb-2">
              Type <span className="font-mono font-semibold">delete my account</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete my account"
              className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deleting}
                disabled={deleteConfirmText !== "delete my account"}
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
