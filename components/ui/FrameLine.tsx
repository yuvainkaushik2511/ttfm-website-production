import clsx from "clsx";

// TTFM's recurring signature motif — "the frame." A thin horizontal line,
// reused across the entry sequence, Hero, section transitions and Contact.
// Deliberately plain: it's a mark, not a decoration, so it stays a single
// unadorned rule rather than growing gradients or glows per use site.
export default function FrameLine({ className }: { className?: string }) {
  return <span aria-hidden className={clsx("block h-px w-full bg-line", className)} />;
}
