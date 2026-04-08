import { DormSyLogo } from "@/components/ui/DormSyLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <DormSyLogo size="lg" variant="full" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
