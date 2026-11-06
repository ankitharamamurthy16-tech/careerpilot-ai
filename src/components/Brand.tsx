const icon = "/logo.svg";

export function BrandMark({ size = 40 }: { size?: number }) {
  return <img src={icon} width={size} height={size} alt="CareerPilot AI" className="rounded-2xl" style={{ width: size, height: size }} />;
}

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div className="animate-bar h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}
