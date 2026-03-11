export default function Badge({ cgpa }) {
  const g = parseFloat(cgpa);
  // Scale 0-10
  const color =
    g >= 9.0 ? "#4ade80" :
    g >= 7.5 ? "#86efac" :
    g >= 6.0 ? "#facc15" :
    g >= 5.0 ? "#fb923c" : "#f87171";

  return (
    <span style={{
      background: `${color}15`,
      color,
      border: `1.5px solid ${color}40`,
      borderRadius: 7,
      padding: "3px 10px",
      fontSize: 13,
      fontFamily: "'Fira Code', monospace",
      fontWeight: 600,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
      display: "inline-block",
    }}>
      {parseFloat(cgpa).toFixed(1)}
    </span>
  );
}
