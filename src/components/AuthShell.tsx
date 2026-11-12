import type { ReactNode } from "react";
import { BrandMark } from "./Brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background md:flex md:items-center md:justify-center md:bg-hero md:p-8">
      <div className="mx-auto w-full max-w-md overflow-hidden bg-background md:rounded-3xl md:shadow-glow">
        <div className="bg-hero rounded-b-[2.5rem] px-6 pb-10 pt-12 text-navy-foreground md:rounded-none">
          <div className="flex items-center gap-3">
            <BrandMark size={44} />
            <span className="font-display text-lg font-bold">CareerPilot AI</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm opacity-80">{subtitle}</p>
        </div>
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <input
        {...rest}
        className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="bg-brand shadow-glow h-12 w-full rounded-xl font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
    >
      {children}
    </button>
  );
}
