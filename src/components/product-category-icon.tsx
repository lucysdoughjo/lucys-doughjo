type ProductCategoryIconProps = {
  categorySlug?: string;
  className?: string;
};

const iconClass = "h-7 w-7";

export function ProductCategoryIcon({
  categorySlug,
  className = "",
}: ProductCategoryIconProps) {
  const slug = categorySlug ?? "default";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-espresso/25 p-1 text-espresso ${className}`}
      aria-hidden
    >
      {slug === "bagels" ? (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <circle cx="16" cy="16" r="9" />
          <circle cx="16" cy="16" r="3.5" />
          <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="13" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : slug === "english-muffins" ? (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <ellipse cx="16" cy="18" rx="10" ry="7" />
          <path d="M8 18c2-4 6-6 8-6s6 2 8 6" />
          <path d="M10 14c1.5-1 3.5-1.5 6-1.5" />
        </svg>
      ) : slug === "cinnamon-rolls" ? (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <path d="M16 6c-4 4-6 8-6 12a6 6 0 1 0 12 0c0-4-2-8-6-12z" />
          <path d="M16 10v12M13 13c2 1 4 1 6 0M12.5 17c3 1.5 5 1.5 7 0" />
        </svg>
      ) : slug === "scones" ? (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <path d="M8 24 L16 8 L24 24 Z" />
          <path d="M11 20h10" />
          <circle cx="14" cy="17" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : slug === "jumbo-cookies" ? (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <circle cx="16" cy="16" r="9" />
          <circle cx="12" cy="13" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="19" cy="14" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="15" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="21" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg viewBox="0 0 32 32" fill="none" className={iconClass} stroke="currentColor" strokeWidth="1.25">
          <path d="M16 5v22M16 5c-3 2-5 5-5 9s2 7 5 9M16 5c3 2 5 5 5 9s-2 7-5 9" />
          <path d="M10 12h12M9 18h14" />
        </svg>
      )}
    </span>
  );
}
