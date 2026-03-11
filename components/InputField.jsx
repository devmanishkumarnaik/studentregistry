"use client";

export default function InputField({
  label, name, value, onChange, error,
  type = "text", placeholder, required = false, hint,
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={name} style={{
        display:"block", fontSize:12, fontWeight:600,
        letterSpacing:"0.06em", textTransform:"uppercase",
        color:"#94a3b8", marginBottom:7, fontFamily:"'Inter',sans-serif",
      }}>
        {label}{required && <span style={{ color:"#f87171", marginLeft:3 }}>*</span>}
      </label>

      <input
        id={name} type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder} required={required}
        style={{
          width:"100%", background:"#0d1b2e",
          border:`2px solid ${error ? "#ef4444" : "#1e3a5f"}`,
          borderRadius:10, padding:"12px 14px",
          color:"#f1f5f9", fontSize:15,
          fontFamily:"'Inter',sans-serif", fontWeight:400,
          outline:"none", boxSizing:"border-box",
          transition:"border-color 0.2s, box-shadow 0.2s", lineHeight:1.5,
        }}
        onFocus={(e) => {
          if (!error) { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.15)"; }
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor="#1e3a5f";
          e.target.style.boxShadow="none";
        }}
      />

      {hint && !error && (
        <p style={{ fontSize:12, color:"#475569", marginTop:5, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          {hint}
        </p>
      )}

      {error && (
        <p role="alert" style={{ color:"#f87171", fontSize:12.5, marginTop:6, display:"flex", alignItems:"center", gap:5, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}
