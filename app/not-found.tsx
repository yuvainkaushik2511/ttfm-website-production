import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 py-32 text-center">
      <span className="eyebrow">404</span>
      <h1 className="font-display mt-6 text-5xl font-semibold text-paper md:text-7xl">
        Scene not found.
      </h1>
      <p className="mt-6 max-w-md text-lg text-paper-dim">
        This page isn&rsquo;t in the cut. Let&rsquo;s get you back to the reel.
      </p>
      <Link
        href="/"
        data-cursor="link"
        className="mt-10 rounded-full bg-paper px-8 py-4 font-display text-base font-medium text-ink transition-colors hover:bg-ember"
      >
        Back to Home
      </Link>
    </div>
  );
}
