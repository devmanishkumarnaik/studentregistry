"use client";
import Spinner from "./Spinner";

export default function DeleteModal({ student, submitting, onConfirm, onClose }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label="Confirm deletion"
      style={S.overlay}>
      <div style={S.card}>

        <div style={S.iconBox}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </div>

        <h2 style={S.title}>Delete Student?</h2>
        <p style={S.desc}>
          You are about to permanently remove{" "}
          <strong style={{ color:"#f1f5f9", fontWeight:700 }}>{student?.name}</strong> from the system.
          This action <strong style={{ color:"#f87171" }}>cannot be undone</strong>.
        </p>

        <div style={S.infoBox}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Name</span>
              <span style={S.infoValue}>{student?.name}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Email</span>
              <span style={{ ...S.infoValue, fontFamily:"'Fira Code',monospace", fontSize:12 }}>{student?.email}</span>
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Course</span>
              <span style={S.infoValue}>{student?.course}</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={onClose} disabled={submitting} style={S.cancelBtn}>Keep Student</button>
          <button onClick={onConfirm} disabled={submitting} style={{ ...S.deleteBtn, opacity: submitting ? 0.8 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting
              ? <><Spinner size={15} color="#fca5a5" /> Deleting…</>
              : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                  Yes, Delete
                </>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay:   { position:"fixed", inset:0, background:"rgba(2,8,23,0.88)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.2s ease", padding:"16px" },
  card:      { background:"#0b1629", border:"1.5px solid rgba(239,68,68,0.25)", borderRadius:"clamp(14px,3vw,20px)", width:"100%", maxWidth:430, padding:"clamp(20px,4vw,30px)", animation:"slideIn 0.25s ease", boxShadow:"0 30px 80px rgba(0,0,0,0.7)" },
  iconBox:   { width:52, height:52, borderRadius:14, background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 },
  title:     { fontFamily:"'Outfit',sans-serif", fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#f1f5f9", marginBottom:10 },
  desc:      { fontFamily:"'Inter',sans-serif", color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:20 },
  infoBox:   { background:"#070f1c", border:"1px solid #1e3a5f", borderRadius:10, padding:"14px 16px", marginBottom:22 },
  infoItem:  { display:"flex", flexDirection:"column", gap:2, minWidth:0 },
  infoLabel: { fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#334155", fontFamily:"'Inter',sans-serif" },
  infoValue: { fontSize:13.5, color:"#94a3b8", fontFamily:"'Inter',sans-serif", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  cancelBtn: { flex:"1 1 120px", background:"#0f172a", border:"1.5px solid #1e293b", color:"#94a3b8", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"border-color 0.15s" },
  deleteBtn: { flex:"2 1 140px", background:"linear-gradient(135deg,#dc2626,#b91c1c)", border:"none", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(239,68,68,0.3)" },
};
