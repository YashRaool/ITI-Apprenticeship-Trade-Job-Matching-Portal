import { UserRole } from "@iti-portal/shared";

// ─── Token verification cards ──────────────────────────────────────────────────
const tokens = [
  { label: "Background",    value: "var(--color-bg)",      style: { background: "var(--color-bg)", border: "1px solid var(--color-border)" } },
  { label: "Surface",       value: "var(--color-surface)", style: { background: "var(--color-surface)" } },
  { label: "Sky Accent",  value: "var(--color-sky)",   style: { background: "var(--color-sky)" } },
  { label: "Steel Accent",  value: "var(--color-steel)",   style: { background: "var(--color-steel)" } },
  { label: "Sky Glow",   value: "rgba(249,115,22,.15)", style: { background: "var(--color-sky-glow)", border: "1px solid var(--color-sky)" } },
];

export default function SetupPage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-8 bg-sky-glow"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ─── Glow backdrop ─ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ─── Card ─ */}
      <div
        className="relative z-10 w-full max-w-lg card shadow-sky"
        style={{ boxShadow: "var(--shadow-sky)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl"
            style={{ background: "var(--color-sky-glow)", border: "1px solid var(--color-sky)" }}
          >
            ⚙️
          </span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-ink-primary)" }}>
              Setup Complete
            </h1>
            <p className="text-sm" style={{ color: "var(--color-ink-secondary)" }}>
              Phase 0 — Scaffold verified
            </p>
          </div>
        </div>

        {/* Checks */}
        <ul className="space-y-2 mb-6">
          {[
            "✅ Vite + React + TypeScript booted",
            "✅ Tailwind CSS active with design tokens",
            "✅ React Router mounted",
            `✅ Shared types loaded — roles: ${Object.values(UserRole).join(", ")}`,
            "✅ Dark-mode-first theme applied",
          ].map((item) => (
            <li key={item} className="text-sm" style={{ color: "var(--color-ink-secondary)" }}>
              {item}
            </li>
          ))}
        </ul>

        {/* Token swatches */}
        <div>
          <p className="label-muted mb-3">Design Token Swatches</p>
          <div className="grid grid-cols-5 gap-2">
            {tokens.map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-full aspect-square rounded-lg"
                  style={t.style}
                  title={t.value}
                />
                <span className="text-[10px] text-center leading-tight" style={{ color: "var(--color-ink-muted)" }}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA placeholder */}
        <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs text-center" style={{ color: "var(--color-ink-muted)" }}>
            Next: Phase 1 — Auth (login, register, JWT flow)
          </p>
        </div>
      </div>
    </div>
  );
}
