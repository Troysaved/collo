function LoadingSpinner() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: 320,
        gap: 12,
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontSize: 14,
        color: "var(--ink-3)",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        style={{ color: "var(--accent)", animation: "vv-spin 1.2s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="14 42"
        />
      </svg>
      <span>Turning the page…</span>
      <style>{`@keyframes vv-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoadingSpinner;
