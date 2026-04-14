"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type CheckState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [collegeName, setCollegeName] = useState("");
  const [form, setForm] = useState({
    username: "",
    phone: "",
    instagram: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameCheck, setUsernameCheck] = useState<CheckState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load college name from user profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      // Ensure profile row exists (idempotent — safe to call multiple times)
      await fetch(`${apiUrl}/auth/create-profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCollegeName(data.user?.college?.name || "");
        // If already set up, redirect to feed
        if (data.user?.username) router.push("/feed");
      }
    });
  }, []);

  // Real-time username check with debounce
  useEffect(() => {
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    const val = form.username.trim();

    if (!val) { setUsernameCheck("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) { setUsernameCheck("invalid"); return; }

    setUsernameCheck("checking");
    checkTimeout.current = setTimeout(async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(
        `${apiUrl}/auth/check-username?username=${encodeURIComponent(val)}`
      );
      const data = await res.json();
      setUsernameCheck(data.available ? "available" : "taken");
    }, 400);

    return () => { if (checkTimeout.current) clearTimeout(checkTimeout.current); };
  }, [form.username]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      newErrors.username = "3–20 chars, letters/numbers/underscores only";
    } else if (usernameCheck === "taken") {
      newErrors.username = "Username is already taken";
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Upload avatar if provided
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("photo", avatarFile);
        const uploadRes = await fetch(`${apiUrl}/uploads/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: fd,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        }
      }

      const res = await fetch(`${apiUrl}/auth/profile-setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          instagram: form.instagram.trim().replace(/^@/, "") || null,
          avatar_url: avatarUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ username: data.error || "Setup failed. Try again." });
        return;
      }

      router.push("/feed");
    } catch {
      setErrors({ username: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">
          Set up your profile
        </h1>
        {collegeName && (
          <div className="inline-flex items-center gap-1.5 bg-[#E8F7F2] text-[#1D9E75] text-xs font-medium px-2.5 py-1 rounded-full mt-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re joining {collegeName}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] hover:border-[#00599B] transition-colors flex items-center justify-center overflow-hidden min-h-0"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-7 h-7 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            )}
          </button>
          <span className="text-xs text-[#9CA3AF]">
            {avatarFile ? avatarFile.name : "Add photo (optional)"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Username */}
        <div>
          <Input
            label="Username"
            placeholder="alexjohnson"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))
            }
            error={
              errors.username ||
              (usernameCheck === "taken" ? "Username is already taken" : "") ||
              (usernameCheck === "invalid" ? "3–20 chars, letters/numbers/underscores only" : "")
            }
            rightElement={usernameIcon}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="text-xs text-[#9CA3AF] mt-1">
            This is your public identity on DormSy. Choose carefully — it&apos;s hard to change.
          </p>
        </div>

        {/* Optional fields */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#9CA3AF] -mb-1">
            Optional — visible to other students on your public profile
          </p>
          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 555 000 0000"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            inputMode="tel"
          />
          <Input
            label="Instagram"
            placeholder="yourhandle"
            value={form.instagram}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={usernameCheck === "checking" || usernameCheck === "taken"}
          className="mt-1"
        >
          Finish setup
        </Button>
      </form>
    </>
  );
}
