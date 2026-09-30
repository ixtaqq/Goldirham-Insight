export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M20 2 37 12 20 22 3 12 20 2Z" fill="#72dbb0" />
      <path d="m3 20 9-5 17 10-9 5L3 20Z" fill="#1c7855" />
      <path d="m20 18 17 10-17 10L3 28l9-5 8 5 9-5-9-5Z" fill="#172a22" />
    </svg>
  );
}
