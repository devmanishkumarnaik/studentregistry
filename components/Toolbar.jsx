"use client";

export default function Toolbar({ search, onSearchChange, onAdd, onExport, selectedCount }) {
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"stretch", marginBottom:20 }}>

      {/* Search */}
      <div style={{ position:"relative", flex:"1 1 200px", minWidth:0 }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#475569", display:"flex", pointerEvents:"none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email or course…"
          style={{
            width:"100%", background:"#0d1b2e",
            border:"2px solid #1e3a5f", borderRadius:10,
            padding:"11px 14px 11px 40px",
            color:"#f1f5f9", fontSize:14,
            fontFamily:"'Inter',sans-serif", fontWeight:400,
            outline:"none", transition:"border-color 0.2s, box-shadow 0.2s",
            boxSizing:"border-box", height:"100%",
          }}
          onFocus={(e) => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.15)"; }}
          onBlur={(e)  => { e.target.style.borderColor="#1e3a5f"; e.target.style.boxShadow="none"; }}
        />
        {search && (
          <button onClick={() => onSearchChange("")} aria-label="Clear search"
            style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"#1e293b", border:"none", color:"#64748b", borderRadius:5, width:22, height:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Export */}
      <button onClick={onExport}
        style={{ background:"#052e16", border:"1.5px solid #166534", color:"#4ade80", borderRadius:10, padding:"10px 16px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap", transition:"background 0.15s, transform 0.15s", flexShrink:0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background="#14532d"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background="#052e16"; }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>{selectedCount > 0 ? `Export (${selectedCount})` : "Export"}</span>
      </button>

      {/* Add */}
      <button onClick={onAdd}
        style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", color:"#fff", borderRadius:10, padding:"10px 18px", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:7, fontFamily:"'Inter',sans-serif", boxShadow:"0 4px 14px rgba(99,102,241,0.35)", transition:"transform 0.15s, box-shadow 0.15s", whiteSpace:"nowrap", flexShrink:0 }}
        onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.5)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 14px rgba(99,102,241,0.35)"; }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Student
      </button>
    </div>
  );
}
