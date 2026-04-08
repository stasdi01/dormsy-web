"use client";

type Strength = "weak" | "fair" | "strong";

function getStrength(password: string): Strength {
  if (!password) return "weak";
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  return "strong";
}

const config: Record<Strength, { label: string; color: string; bars: number }> = {
  weak:   { label: "Weak",   color: "bg-red-400",    bars: 1 },
  fair:   { label: "Fair",   color: "bg-yellow-400", bars: 2 },
  strong: { label: "Strong", color: "bg-[#1D9E75]",  bars: 3 },
};

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength = getStrength(password);
  const { label, color, bars } = config[strength];

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= bars ? color : "bg-[#E5E7EB]",
            ].join(" ")}
          />
        ))}
      </div>
      <span
        className={[
          "text-xs font-medium",
          strength === "weak"
            ? "text-red-500"
            : strength === "fair"
            ? "text-yellow-600"
            : "text-[#1D9E75]",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}
