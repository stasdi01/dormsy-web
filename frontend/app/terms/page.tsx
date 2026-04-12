import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-[#9CA3AF] mb-10">Last updated: April 2026</p>

        <div className="flex flex-col gap-8 text-[#374151] text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">1. About DormSy</h2>
            <p>
              DormSy is a peer-to-peer marketplace platform that allows verified college students to buy and sell
              secondhand items within their campus community. DormSy is a technology platform only — we do not buy,
              sell, or take possession of any items listed on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">2. Eligibility</h2>
            <p>
              You must be a currently enrolled student at a supported college and must register with a valid
              <code className="bg-[#F3F4F6] px-1 py-0.5 rounded text-xs mx-1">.edu</code>
              email address issued by your institution. By creating an account, you confirm that you meet these
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">3. No Guarantees — Transactions Are Between Users</h2>
            <p className="mb-3">
              <strong>DormSy does not guarantee, verify, or take responsibility for any transaction between users.</strong>{" "}
              All sales and exchanges are solely between the buyer and seller. DormSy is not a party to any transaction
              and has no control over the quality, safety, legality, or accuracy of listings.
            </p>
            <p>
              You agree that DormSy is not liable for any loss, damage, or dispute arising from a transaction,
              including but not limited to items not received, items not as described, damaged goods, or fraudulent
              listings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>You are solely responsible for the accuracy of your listings.</li>
              <li>You must not list prohibited, illegal, or dangerous items.</li>
              <li>You must complete transactions you commit to in good faith.</li>
              <li>You must not harass, scam, or deceive other users.</li>
              <li>You are responsible for arranging safe meetups for exchanges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">5. Prohibited Items</h2>
            <p className="mb-2">The following items may not be listed on DormSy:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Weapons, firearms, or ammunition</li>
              <li>Illegal drugs or controlled substances</li>
              <li>Alcohol (if you are under legal drinking age)</li>
              <li>Counterfeit or stolen goods</li>
              <li>Adult content or services</li>
              <li>Anything prohibited by your college's policies or applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">6. No Fees</h2>
            <p>
              DormSy is currently free to use. We do not charge listing fees, transaction fees, or commissions.
              We reserve the right to introduce optional paid features in the future with advance notice to users.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">7. Content &amp; Listings</h2>
            <p>
              By posting a listing, you grant DormSy a non-exclusive, royalty-free license to display and use
              the content (photos, descriptions) for the purpose of operating the platform. You retain ownership
              of your content. DormSy may remove any listing or content that violates these terms at any time
              without notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">8. Account Termination</h2>
            <p>
              DormSy reserves the right to suspend or permanently delete any account that violates these terms,
              engages in fraudulent activity, or abuses the platform in any way.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">9. Disclaimer of Warranties</h2>
            <p>
              DormSy is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not
              guarantee uninterrupted availability, error-free operation, or that listings are accurate or safe.
              Use the platform at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, DormSy and its founders, employees, and affiliates shall
              not be liable for any indirect, incidental, special, or consequential damages arising from your
              use of the platform, including losses from transactions with other users.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">11. Changes to These Terms</h2>
            <p>
              We may update these terms at any time. Continued use of DormSy after changes are posted constitutes
              acceptance of the new terms. We will notify users of material changes via email or an in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#111827] mb-2">12. Contact</h2>
            <p>
              If you have questions about these terms, please contact us at{" "}
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
          <Link href="/sign-up" className="hover:text-[#00599B] transition-colors">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
