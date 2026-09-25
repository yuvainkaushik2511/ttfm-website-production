export default function LaunchingBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-ember/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-ember ${className ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-ember" />
      Launching Soon
    </span>
  );
}
