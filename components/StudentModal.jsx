"use client";
import InputField from "./InputField";
import Spinner from "./Spinner";

const COURSES = [
  "Computer Science","Data Science","Mathematics","Physics",
  "Engineering","Biotechnology","Economics","Psychology",
  "Chemistry","Literature","Medicine","Architecture",
];

export default function StudentModal({ mode, form, errors, submitting, onChange, onSubmit, onClose }) {
  const isEdit = mode === "edit";

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label={isEdit ? "Edit Student" : "Add Student"}
      style={S.overlay}>
      <div style={S.card}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
            <div style={S.headerIcon}>
              {isEdit
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
            </div>
            <div style={{ minWidth:0 }}>
              <h2 style={S.title}>{isEdit ? "Edit Student" : "Add New Student"}</h2>
              <p style={S.subtitle}>Fields marked <span style={{ color:"#f87171" }}>*</span> are required</p>
            </div>
          </div>
          <button onClick={onClose} style={S.closeBtn} aria-label="Close modal"
            onMouseEnter={(e) => { e.currentTarget.style.background="#1e293b"; e.currentTarget.style.color="#e2e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="#0f172a"; e.currentTarget.style.color="#64748b"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={S.body}>
          <InputField label="Full Name" name="name" value={form.name} onChange={onChange}
            error={errors.name} placeholder="e.g. Rahul Sharma" required />

          <InputField label="Gmail Address" name="email" value={form.email} onChange={onChange}
            error={errors.email} placeholder="yourname@gmail.com" required
            hint="Only Gmail addresses accepted" />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <InputField label="Age" name="age" type="number" value={form.age} onChange={onChange}
              error={errors.age} placeholder="e.g. 20" required
              hint="5 – 60 years" />
            <InputField label="CGPA (0.0 – 10.0)" name="cgpa" type="number" value={form.cgpa} onChange={onChange}
              error={errors.cgpa} placeholder="e.g. 8.5" required />
          </div>

          {/* Course */}
          <div style={{ marginBottom:22 }}>
            <label htmlFor="course" style={S.selectLabel}>
              Course <span style={{ color:"#f87171" }}>*</span>
            </label>
            <select id="course" name="course" value={form.course} onChange={onChange}
              style={{ ...S.select, borderColor: errors.course ? "#ef4444" : "#1e3a5f", color: form.course ? "#f1f5f9" : "#475569" }}
              onFocus={(e) => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={(e)  => { e.target.style.borderColor=errors.course?"#ef4444":"#1e3a5f"; e.target.style.boxShadow="none"; }}>
              <option value="">— Select a course —</option>
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.course && (
              <p role="alert" style={{ color:"#f87171", fontSize:12.5, marginTop:6, fontFamily:"'Inter',sans-serif", fontWeight:500, display:"flex", alignItems:"center", gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errors.course}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={onClose} disabled={submitting} style={S.cancelBtn}>Cancel</button>
            <button onClick={onSubmit} disabled={submitting} style={{ ...S.submitBtn, opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting
                ? <><Spinner size={16} color="#fff" />{isEdit?"Saving…":"Adding…"}</>
                : isEdit ? "Save Changes" : "Add Student"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay:    { position:"fixed", inset:0, background:"rgba(2,8,23,0.85)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.2s ease", padding:"16px" },
  card:       { background:"#0b1629", border:"1px solid #1e3a5f", borderRadius:"clamp(14px,3vw,20px)", width:"100%", maxWidth:520, maxHeight:"90vh", display:"flex", flexDirection:"column", animation:"slideIn 0.25s ease", boxShadow:"0 30px 80px rgba(0,0,0,0.7)" },
  header:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"clamp(16px,3vw,24px) clamp(16px,3vw,28px)", borderBottom:"1px solid #1a2e4a", background:"#0d1b2e", borderRadius:"clamp(14px,3vw,20px) clamp(14px,3vw,20px) 0 0", flexShrink:0 },
  headerIcon: { width:40, height:40, borderRadius:11, background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  title:      { fontFamily:"'Outfit',sans-serif", fontSize:"clamp(17px,3vw,20px)", fontWeight:700, color:"#f1f5f9", lineHeight:1.2 },
  subtitle:   { fontFamily:"'Inter',sans-serif", fontSize:12, color:"#475569", marginTop:3 },
  closeBtn:   { background:"#0f172a", border:"1px solid #1e293b", color:"#64748b", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.15s" },
  body:       { padding:"clamp(16px,3vw,24px) clamp(16px,3vw,28px) clamp(20px,3vw,28px)", overflowY:"auto" },
  selectLabel:{ display:"block", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#94a3b8", marginBottom:7, fontFamily:"'Inter',sans-serif" },
  select:     { width:"100%", background:"#0d1b2e", border:"2px solid #1e3a5f", borderRadius:10, padding:"12px 14px", fontSize:15, fontFamily:"'Inter',sans-serif", fontWeight:400, outline:"none", cursor:"pointer", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s" },
  cancelBtn:  { flex:"1 1 100px", background:"#0f172a", border:"1.5px solid #1e293b", color:"#94a3b8", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.15s" },
  submitBtn:  { flex:"2 1 160px", background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 14px rgba(99,102,241,0.3)" },
};
