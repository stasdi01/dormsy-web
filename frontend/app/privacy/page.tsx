import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-[#F3F4F6] px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/colored-logo.svg" alt="DormSy" width={28} height={28} className="rounded-md" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#0F172A]">Dorm</span><span className="text-[#5F9DD0]">Sy</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-10">Last updated: April 2026</p>

        <div className="flex flex-col gap-8 text-[#374151] text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">1. Introduction</h2>
            <p>
              DormSy (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
              By using DormSy, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">2. Information We Collect</h2>
            <p className="mb-3"><strong className="text-[#111827]">Information you provide directly:</strong></p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 mb-4">
              <li>Name and college email address (required for registration)</li>
              <li>Username, profile photo, phone number, and Instagram handle (optional)</li>
              <li>Listing content including titles, descriptions, and photos</li>
              <li>Messages sent to other users through the platform</li>
            </ul>
            <p className="mb-3"><strong className="text-[#111827]">Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Listing view counts</li>
              <li>General usage data via analytics (page visits, feature usage)</li>
              <li>Device and browser type (collected by analytics tools)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>To create and manage your account</li>
              <li>To display your listings and profile to other verified students at your college</li>
              <li>To facilitate messaging between buyers and sellers</li>
              <li>To send transactional emails (new messages, listing expiry reminders)</li>
              <li>To improve the platform through usage analytics</li>
              <li>To enforce our Terms &amp; Conditions and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">4. What We Share — and What We Don&apos;t</h2>
            <p className="mb-3">
              We <strong className="text-[#111827]">do not sell your personal data</strong> to third parties. Ever.
            </p>
            <p className="mb-3">Your information is shared only in the following limited ways:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <strong className="text-[#111827]">Other students at your college</strong> — your username, profile photo,
                and any optional contact info (phone, Instagram) you choose to add are visible on your public profile
                within your campus community only.
              </li>
              <li>
                <strong className="text-[#111827]">Service providers</strong> — we use Supabase (database &amp; auth),
                Resend (email delivery), and analytics providers. These process data only as needed to operate the platform.
              </li>
              <li>
                <strong className="text-[#111827]">Legal requirements</strong> — we may disclose information if required
                by law or to protect the rights and safety of users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">5. College Isolation</h2>
            <p>
              DormSy is designed so that your listings, profile, and activity are only visible to verified students
              at your college. Students from other colleges cannot see your data, and you cannot see theirs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you delete your account,
              your profile and listings are permanently removed. Messages may be retained for a short period
              for safety and dispute resolution purposes before being deleted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate information via your account settings</li>
              <li>Delete your account and associated data at any time from Settings</li>
              <li>Opt out of non-essential emails by contacting us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">8. Cookies &amp; Analytics</h2>
            <p>
              We use cookies and similar technologies to operate the platform (authentication sessions) and to
              understand how users interact with DormSy (analytics). You can disable cookies in your browser
              settings, though this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">9. Children&apos;s Privacy</h2>
            <p>
              DormSy is intended for college students (18+). We do not knowingly collect personal information
              from anyone under 18. If we become aware that a user is under 18, we will delete their account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              via email or an in-app notice. Continued use of DormSy after changes are posted constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">11. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or want to exercise your data rights, contact us at{" "}
              <span className="text-[#00599B] font-medium">support@dormsy.com</span>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#F3F4F6] py-6 px-4 text-center text-xs text-[#9CA3AF]">
        <p>© {new Date().getFullYear()} DormSy. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/" className="hover:text-[#00599B] transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-[#00599B] transition-colors">Terms</Link>
          <Link href="/sign-up" className="hover:text-[#00599B] transition-colors">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
