"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength } from "@/components/ui/PasswordStrength";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!form.email.toLowerCase().endsWith(".edu"))
      e.email = "Must be a .edu email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    else if (!/[0-9]/.test(form.password))
      e.password = "Password must contain at least one number";
    else if (!/[^a-zA-Z0-9]/.test(form.password))
      e.password = "Password must contain at least one special character";
    if (!agreedToTerms) e.terms = "You must agree to the Terms & Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      // 1. Validate domain on the backend
      const domainRes = await fetch(`${apiUrl}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const domainData = await domainRes.json();

      if (domainData.status === "unsupported") {
        router.push(
          `/coming-soon?email=${encodeURIComponent(form.email)}`
        );
        return;
      }

      if (!domainRes.ok) {
        setErrors({ email: domainData.error || "Something went wrong" });
        return;
      }

      // 2. Create Supabase Auth user
      const supabase = createClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.toLowerCase(),
        password: form.password,
        options: {
          data: {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setErrors({ email: "An account with this email already exists" });
        } else {
          setErrors({ email: signUpError.message });
        }
        return;
      }

      // 3. If email confirmation is disabled, session is returned immediately
      if (signUpData.session) {
        // Create profile then redirect
        await fetch(`${apiUrl}/auth/create-profile`, {
          method: "POST",
          headers: { Authorization: `Bearer ${signUpData.session.access_token}` },
        });
        router.push("/profile-setup");
        return;
      }

      // 4. Email confirmation enabled — go to verify screen
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">
        Create your account
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">
        Sign up with your college email to get started
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Alex"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Last name"
            placeholder="Johnson"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="College email"
          type="email"
          placeholder="you@college.edu"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors min-h-0"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
          <PasswordStrength password={form.password} />
        </div>

        {/* Terms checkbox */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <button
              type="button"
              onClick={() => { setAgreedToTerms((v) => !v); setErrors((e) => ({ ...e, terms: "" })); }}
              style={{ minHeight: 0 }}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                agreedToTerms ? "bg-[#00599B] border-[#00599B]" : errors.terms ? "border-red-400" : "border-[#D1D5DB]"
              }`}
            >
              {agreedToTerms && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
            <span className="text-sm text-[#374151]">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-[#00599B] font-medium hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-[#00599B] font-medium hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-500 pl-6">{errors.terms}</p>}
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#00599B] font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
