export default function Spinner({ size = 20, color = "#6366f1" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={`${color}35`} strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
