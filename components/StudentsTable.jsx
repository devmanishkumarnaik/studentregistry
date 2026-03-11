"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import * as db from "@/lib/db";
import Badge from "./Badge";
import Spinner from "./Spinner";
import Toast from "./Toast";
import Toolbar from "./Toolbar";
import StudentModal from "./StudentModal";
import DeleteModal from "./DeleteModal";

/* ── Validation (frontend) ───────────────────────────────────────────────── */
function validate(form) {
  const errors = {};
  if (!form.name.trim())
    errors.name = "Full name is required";
  else if (form.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters";

  if (!form.email.trim())
    errors.email = "Gmail address is required";
  else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email.trim()))
    errors.email = "Only Gmail addresses accepted (name@gmail.com)";

  if (!form.age)
    errors.age = "Age is required";
  else if (isNaN(form.age) || +form.age < 5 || +form.age > 60)
    errors.age = "Age must be between 5 and 60";

  if (!form.course)
    errors.course = "Please select a course";

  if (!form.cgpa)
    errors.cgpa = "CGPA is required";
  else if (isNaN(form.cgpa) || +form.cgpa < 0 || +form.cgpa > 10.0)
    errors.cgpa = "CGPA must be between 0.0 and 10.0";

  return errors;
}

const EMPTY = { name: "", email: "", age: "", course: "", cgpa: "" };

/* ── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background:"#0b1629", border:`1.5px solid ${accent}22`,
      borderRadius:14, padding:"clamp(14px,2.5vw,18px) clamp(14px,2.5vw,20px)",
      display:"flex", alignItems:"center", gap:14,
      flex:"1 1 130px", minWidth:0,
    }}>
      <div style={{
        width:42, height:42, borderRadius:11,
        background:`${accent}14`, border:`1.5px solid ${accent}30`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, flexShrink:0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:"clamp(20px,3vw,25px)", fontWeight:800, color:"#f1f5f9", fontFamily:"'Outfit',sans-serif", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {value}
        </div>
        <div style={{ fontSize:"clamp(10px,1.2vw,11px)", color:"#64748b", marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600, fontFamily:"'Inter',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function StudentsTable({ onLogout, user }) {
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [debSearch,  setDebSearch]  = useState("");
  const [modal,      setModal]      = useState(null);
  const [selStudent, setSelStudent] = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [sortCfg,      setSortCfg]      = useState({ key: "name", dir: "asc" });
  const [selIds,       setSelIds]       = useState(new Set());
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [signOutModal,     setSignOutModal]     = useState(false);
  const [emptyExportModal, setEmptyExportModal] = useState(false);

  const addToast    = useCallback((msg, type = "success") => setToasts((t) => [...t, { id: Date.now() + Math.random(), msg, type }]), []);
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* Debounce */
  useEffect(() => { const t = setTimeout(() => setDebSearch(search), 320); return () => clearTimeout(t); }, [search]);

  /* Fetch */
  const fetchStudents = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const data = await db.find(q ? { search: q } : {});
      setStudents(data);
    } catch (err) {
      addToast(err.message || "Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchStudents(debSearch); }, [debSearch, fetchStudents]);

  /* Sort */
  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      let va = a[sortCfg.key], vb = b[sortCfg.key];
      if (["age", "cgpa"].includes(sortCfg.key)) { va = +va; vb = +vb; }
      else { va = va?.toString().toLowerCase(); vb = vb?.toString().toLowerCase(); }
      return sortCfg.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [students, sortCfg]);

  const toggleSort = (key) => setSortCfg((p) => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }));

  /* Stats */
  const stats = useMemo(() => {
    if (!students.length) return { total: 0, avgCgpa: "—", topCourse: "—" };
    const total = students.length;
    const avgCgpa = (students.reduce((s, x) => s + parseFloat(x.cgpa || 0), 0) / total).toFixed(1);
    const counts = {};
    students.forEach((s) => { counts[s.course] = (counts[s.course] || 0) + 1; });
    const topCourse = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total, avgCgpa, topCourse };
  }, [students]);

  /* Form */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => { const n = { ...er }; delete n[name]; return n; });
  };

  const openAdd    = ()  => { setForm(EMPTY); setErrors({}); setModal("add"); };
  const openEdit   = (s) => { setSelStudent(s); setForm({ name:s.name, email:s.email, age:String(s.age), course:s.course, cgpa:String(s.cgpa) }); setErrors({}); setModal("edit"); };
  const openDelete = (s) => { setSelStudent(s); setModal("delete"); };
  const closeModal = ()  => { setModal(null); setSelStudent(null); setForm(EMPTY); setErrors({}); };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      if (modal === "add") {
        await db.insertOne({ ...form, age: +form.age, cgpa: (+form.cgpa).toFixed(1) });
        addToast("Student added successfully");
      } else {
        await db.updateOne(selStudent._id, { ...form, age: +form.age, cgpa: (+form.cgpa).toFixed(1) });
        addToast("Student updated successfully");
      }
      closeModal();
      fetchStudents(debSearch);
    } catch (err) {
      addToast(err.message || "Operation failed", "error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await db.deleteOne(selStudent._id);
      setSelIds((p) => { const n = new Set(p); n.delete(selStudent._id); return n; });
      addToast(`${selStudent.name} removed`, "warning");
      closeModal();
      fetchStudents(debSearch);
    } catch (err) {
      addToast(err.message || "Delete failed", "error");
    } finally { setSubmitting(false); }
  };

  const toggleSel = (id) => setSelIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelIds(selIds.size === sorted.length ? new Set() : new Set(sorted.map((s) => s._id)));

  const exportExcel = () => {
    if (sorted.length === 0) { setEmptyExportModal(true); return; }
    const rows = selIds.size > 0 ? sorted.filter((s) => selIds.has(s._id)) : sorted;
    const data = rows.map((s) => ({ Name:s.name, Email:s.email, Age:s.age, Course:s.course, CGPA:s.cgpa }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch:24 }, { wch:32 }, { wch:8 }, { wch:22 }, { wch:8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `students_${new Date().toISOString().slice(0,10)}.xlsx`);
    addToast(`Exported ${data.length} record${data.length !== 1 ? "s" : ""}`);
  };

  const SortIcon = ({ col }) =>
    sortCfg.key !== col
      ? <span style={{ opacity:0.25, marginLeft:4, fontSize:9 }}>↕</span>
      : <span style={{ color:"#818cf8", marginLeft:4, fontSize:9 }}>{sortCfg.dir==="asc"?"▲":"▼"}</span>;

  const COLS = [
    { key:"name",   label:"Student"  },
    { key:"email",  label:"Gmail"    },
    { key:"age",    label:"Age"      },
    { key:"course", label:"Course"   },
    { key:"cgpa",   label:"CGPA"     },
  ];

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <>
      {toasts.map((t) => <Toast key={t.id} message={t.msg} type={t.type} onDismiss={() => removeToast(t.id)} />)}

      {(modal==="add"||modal==="edit") && (
        <StudentModal mode={modal} form={form} errors={errors} submitting={submitting}
          onChange={handleChange} onSubmit={handleSubmit} onClose={closeModal} />
      )}
      {modal==="delete" && (
        <DeleteModal student={selStudent} submitting={submitting}
          onConfirm={handleDelete} onClose={closeModal} />
      )}

      <div style={S.page}>
        <div style={S.inner}>

          {/* ── Navbar ─────────────────────────────────────────────────── */}
          <nav style={S.navbar}>
            {/* Brand */}
            <div style={S.navBrand}>
              <div style={S.navLogo}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M6 12v5c3.333 1.667 8.667 1.667 12 0v-5" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"clamp(14px,2.5vw,16px)", color:"#f1f5f9" }}>
                  Student Registry
                </div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#6366f1", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Admin Dashboard
                </div>
              </div>
            </div>

            {/* Desktop right side */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* User pill — hidden on small mobile */}
              {user && (
                <div className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:8, background:"#0d1b2e", border:"1px solid #1e3a5f", borderRadius:20, padding:"5px 14px 5px 8px" }}>
                  <div style={{ width:27, height:27, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", fontFamily:"'Outfit',sans-serif", flexShrink:0 }}>
                    {(user.displayName||user.username||"A")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize:13, color:"#94a3b8", fontWeight:500, fontFamily:"'Inter',sans-serif", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {user.displayName || user.username}
                  </span>
                </div>
              )}

              {/* Sign out */}
              <button onClick={() => setSignOutModal(true)} aria-label="Sign out"
                style={{ background:"transparent", border:"1px solid #1e293b", color:"#64748b", borderRadius:9, padding:"8px clamp(8px,2vw,14px)", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor="#ef4444"; e.currentTarget.style.color="#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.color="#64748b"; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </nav>

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div style={{ marginBottom:"clamp(18px,3vw,28px)" }}>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:"clamp(22px,4vw,30px)", fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.03em", marginBottom:5 }}>
              Students
            </h1>
            <p style={{ fontFamily:"'Inter',sans-serif", color:"#475569", fontSize:"clamp(12px,1.8vw,14px)", fontWeight:400 }}>
              {loading ? "Loading…" : `${students.length} student${students.length!==1?"s":""} · ${selIds.size > 0 ? `${selIds.size} selected` : "none selected"}`}
            </p>
          </div>

          {/* ── Stats ──────────────────────────────────────────────────── */}
          <div style={{ display:"flex", gap:"clamp(8px,1.5vw,14px)", marginBottom:"clamp(16px,2.5vw,24px)", flexWrap:"wrap" }}>
            <StatCard label="Total Students" value={loading?"…":stats.total}                   icon="👥" accent="#6366f1" />
            <StatCard label="Average CGPA"   value={loading?"…":stats.avgCgpa}                 icon="📊" accent="#22c55e" />
            <StatCard label="Top Course"     value={loading?"…":stats.topCourse.split(" ")[0]} icon="🎓" accent="#f59e0b" />
            <StatCard label="Selected"       value={selIds.size}                                icon="✓"  accent="#38bdf8" />
          </div>

          {/* ── Toolbar ────────────────────────────────────────────────── */}
          <Toolbar search={search} onSearchChange={setSearch}
            onAdd={openAdd} onExport={exportExcel} selectedCount={selIds.size} />

          {/* ── Table (desktop) ────────────────────────────────────────── */}
          <div style={S.tableWrap}>
            {/* Desktop table — hidden on mobile via CSS class trick using div */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                <thead>
                  <tr style={{ background:"#060d18", borderBottom:"1.5px solid #1e3a5f" }}>
                    <th style={S.th}>
                      <input type="checkbox"
                        checked={sorted.length>0 && selIds.size===sorted.length}
                        onChange={toggleAll}
                        aria-label="Select all"
                        style={{ accentColor:"#6366f1", cursor:"pointer", width:15, height:15 }}
                      />
                    </th>
                    {COLS.map(({ key, label }) => (
                      <th key={key} onClick={() => toggleSort(key)} style={{ ...S.th, cursor:"pointer", userSelect:"none" }}>
                        <span style={{ display:"inline-flex", alignItems:"center" }}>{label}<SortIcon col={key} /></span>
                      </th>
                    ))}
                    <th style={{ ...S.th, textAlign:"right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length:5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom:"1px solid #0a1422" }}>
                        {Array.from({ length:7 }).map((_, j) => (
                          <td key={j} style={{ padding:"16px" }}>
                            <div className="skeleton" style={{ height:13, width:j===0?16:j===6?80:`${40+Math.random()*45}%`, animationDelay:`${i*0.07}s` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding:"60px 20px", textAlign:"center" }}>
                        <div style={{ fontSize:36, marginBottom:12, opacity:0.25 }}>🎓</div>
                        <p style={{ fontFamily:"'Outfit',sans-serif", color:"#475569", fontSize:15, fontWeight:600, marginBottom:5 }}>
                          No students found
                        </p>
                        <p style={{ fontFamily:"'Inter',sans-serif", color:"#334155", fontSize:13 }}>
                          {search ? "Try a different search term" : "Click 'Add Student' to get started"}
                        </p>
                      </td>
                    </tr>
                  ) : sorted.map((s, i) => {
                    const isSel    = selIds.has(s._id);
                    const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();
                    const hue      = (s.name.charCodeAt(0)*13 + (s.name.charCodeAt(1)||5)*7) % 360;

                    return (
                      <tr key={s._id} className="row-animate"
                        style={{ borderBottom:"1px solid #0a1422", animationDelay:`${i*0.035}s`, background:isSel?"rgba(99,102,241,0.07)":"transparent", transition:"background 0.15s" }}
                        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background="#0d1b2e"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background=isSel?"rgba(99,102,241,0.07)":"transparent"; }}
                      >
                        <td style={{ padding:"13px 16px", width:44 }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSel(s._id)}
                            aria-label={`Select ${s.name}`}
                            style={{ accentColor:"#6366f1", cursor:"pointer", width:15, height:15 }} />
                        </td>

                        {/* Name */}
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:`hsl(${hue},38%,16%)`, border:`2px solid hsl(${hue},52%,30%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:`hsl(${hue},62%,68%)`, fontFamily:"'Outfit',sans-serif" }}>
                              {initials}
                            </div>
                            <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, color:"#f1f5f9", fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"clamp(80px,12vw,200px)" }}>
                              {s.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontFamily:"'Fira Code',monospace", color:"#64748b", fontSize:12, background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:6, padding:"3px 9px", display:"inline-flex", alignItems:"center", gap:5, maxWidth:"clamp(100px,18vw,260px)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" fill="#ea433560"/>
                              <path d="M22 6l-10 7L2 6" stroke="#fff" strokeWidth="1.5" fill="none"/>
                            </svg>
                            {s.email}
                          </span>
                        </td>

                        {/* Age */}
                        <td style={{ padding:"13px 16px", fontFamily:"'Inter',sans-serif", color:"#94a3b8", fontSize:14 }}>
                          {s.age} <span style={{ fontSize:11, color:"#334155" }}>yr</span>
                        </td>

                        {/* Course */}
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontFamily:"'Inter',sans-serif", background:"#0d1b2e", border:"1px solid #1e3a5f", color:"#94a3b8", borderRadius:7, padding:"4px 11px", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap" }}>
                            {s.course}
                          </span>
                        </td>

                        {/* CGPA */}
                        <td style={{ padding:"13px 16px" }}><Badge cgpa={s.cgpa} /></td>

                        {/* Actions */}
                        <td style={{ padding:"13px 16px", textAlign:"right" }}>
                          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                            <button onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}
                              style={{ background:"transparent", border:"1px solid #1e293b", color:"#64748b", borderRadius:8, padding:"6px 12px", fontSize:12.5, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:500, display:"flex", alignItems:"center", gap:5, transition:"all 0.15s", whiteSpace:"nowrap" }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor="#818cf8"; e.currentTarget.style.color="#818cf8"; e.currentTarget.style.background="rgba(99,102,241,0.08)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.color="#64748b"; e.currentTarget.style.background="transparent"; }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => openDelete(s)} aria-label={`Delete ${s.name}`}
                              style={{ background:"transparent", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", borderRadius:8, padding:"6px 12px", fontSize:12.5, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:500, display:"flex", alignItems:"center", gap:5, transition:"all 0.15s", whiteSpace:"nowrap" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor="#ef4444"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(239,68,68,0.3)"; }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ────────────────────────────────────── */}
            {!loading && sorted.length > 0 && (
              <div style={{ display:"none" }} id="mobile-list">
                {sorted.map((s) => {
                  const isSel    = selIds.has(s._id);
                  const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();
                  const hue      = (s.name.charCodeAt(0)*13 + (s.name.charCodeAt(1)||5)*7) % 360;
                  return (
                    <div key={s._id} style={{ padding:"14px 16px", borderBottom:"1px solid #0a1422", background:isSel?"rgba(99,102,241,0.06)":"transparent" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSel(s._id)}
                          style={{ accentColor:"#6366f1", cursor:"pointer", width:15, height:15, marginTop:3 }} />
                        <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, background:`hsl(${hue},38%,16%)`, border:`2px solid hsl(${hue},52%,30%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:`hsl(${hue},62%,68%)`, fontFamily:"'Outfit',sans-serif" }}>
                          {initials}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, color:"#f1f5f9", fontSize:14, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                          <div style={{ fontFamily:"'Fira Code',monospace", color:"#64748b", fontSize:11.5, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.email}</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                            <span style={{ fontFamily:"'Inter',sans-serif", background:"#0d1b2e", border:"1px solid #1e3a5f", color:"#94a3b8", borderRadius:6, padding:"2px 9px", fontSize:11.5, fontWeight:500 }}>{s.course}</span>
                            <span style={{ fontFamily:"'Inter',sans-serif", color:"#64748b", fontSize:11.5 }}>Age {s.age}</span>
                            <Badge cgpa={s.cgpa} />
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <button onClick={() => openEdit(s)}
                            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", color:"#818cf8", borderRadius:7, padding:"6px 10px", fontSize:11.5, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:600 }}>
                            Edit
                          </button>
                          <button onClick={() => openDelete(s)}
                            style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", borderRadius:7, padding:"6px 10px", fontSize:11.5, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:600 }}>
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!loading && sorted.length > 0 && (
              <div style={{ borderTop:"1px solid #0f1f35", padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                <span style={{ fontFamily:"'Inter',sans-serif", color:"#475569", fontSize:12.5, fontWeight:500 }}>
                  {selIds.size > 0 && <span style={{ color:"#818cf8", fontWeight:600 }}>{selIds.size} selected · </span>}
                  {sorted.length} student{sorted.length!==1?"s":""}
                </span>
                {selIds.size > 0 && (
                  <button onClick={() => setSelIds(new Set())}
                    style={{ background:"transparent", border:"1px solid #1e3a5f", color:"#475569", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                    Clear selection
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Responsive style tag */}
      <style>{`
        @media (max-width: 640px) {
          #mobile-list { display: block !important; }
          table { display: none !important; }
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 641px) {
          #mobile-list { display: none !important; }
        }
      `}</style>

      {/* ── Empty export modal ───────────────────────────────────────── */}
      {emptyExportModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEmptyExportModal(false); }}
          role="dialog" aria-modal="true"
          style={{
            position:"fixed", inset:0,
            background:"rgba(2,8,23,0.88)",
            backdropFilter:"blur(10px)",
            zIndex:2000,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:16,
            animation:"fadeIn 0.18s ease",
          }}
        >
          <div style={{
            background:"#0b1629",
            border:"1.5px solid rgba(99,102,241,0.25)",
            borderRadius:"clamp(14px,3vw,20px)",
            width:"100%", maxWidth:380,
            padding:"clamp(24px,4vw,32px)",
            animation:"slideIn 0.22s ease",
            boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
            textAlign:"center",
          }}>
            {/* Icon */}
            <div style={{
              width:64, height:64, borderRadius:18,
              background:"rgba(99,102,241,0.1)",
              border:"1.5px solid rgba(99,102,241,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px",
              fontSize:28,
            }}>
              📭
            </div>

            <h2 style={{
              fontFamily:"'Outfit',sans-serif",
              fontSize:"clamp(18px,3vw,21px)",
              fontWeight:700, color:"#f1f5f9",
              marginBottom:10, letterSpacing:"-0.02em",
            }}>
              No Data to Export
            </h2>

            <p style={{
              fontFamily:"'Inter',sans-serif",
              color:"#64748b", fontSize:14,
              lineHeight:1.65, marginBottom:28,
            }}>
              The student list is currently empty. Please add at least one student before exporting.
            </p>

            {/* Buttons */}
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={() => setEmptyExportModal(false)}
                style={{
                  flex:1,
                  background:"#0f172a",
                  border:"1.5px solid #1e293b",
                  color:"#94a3b8",
                  borderRadius:11, padding:"11px",
                  fontSize:14, fontWeight:600,
                  cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",
                  transition:"border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor="#334155"; e.currentTarget.style.color="#e2e8f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.color="#94a3b8"; }}
              >
                Close
              </button>
              <button
                onClick={() => { setEmptyExportModal(false); openAdd(); }}
                style={{
                  flex:2,
                  background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                  border:"none",
                  color:"#fff",
                  borderRadius:11, padding:"11px",
                  fontSize:14, fontWeight:600,
                  cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
                  transition:"opacity 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform="none"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sign-out confirmation modal ───────────────────────────────── */}
      {signOutModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSignOutModal(false); }}
          role="dialog" aria-modal="true" aria-label="Confirm sign out"
          style={{
            position:"fixed", inset:0,
            background:"rgba(2,8,23,0.88)",
            backdropFilter:"blur(10px)",
            zIndex:2000,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:16,
            animation:"fadeIn 0.18s ease",
          }}
        >
          <div style={{
            background:"#0b1629",
            border:"1.5px solid rgba(99,102,241,0.25)",
            borderRadius:"clamp(14px,3vw,20px)",
            width:"100%", maxWidth:400,
            padding:"clamp(24px,4vw,32px)",
            animation:"slideIn 0.22s ease",
            boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)",
          }}>

            {/* Icon */}
            <div style={{
              width:54, height:54, borderRadius:15,
              background:"rgba(99,102,241,0.1)",
              border:"1.5px solid rgba(99,102,241,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              marginBottom:20,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            {/* Text */}
            <h2 style={{
              fontFamily:"'Outfit',sans-serif",
              fontSize:"clamp(18px,3vw,22px)",
              fontWeight:700, color:"#f1f5f9",
              marginBottom:10, letterSpacing:"-0.02em",
            }}>
              Sign out?
            </h2>
            <p style={{
              fontFamily:"'Inter',sans-serif",
              color:"#64748b", fontSize:14,
              lineHeight:1.65, marginBottom:28,
            }}>
              You will be signed out of your admin session.
              {user?.displayName && (
                <span> Goodbye, <strong style={{ color:"#94a3b8" }}>{user.displayName}</strong>!</span>
              )}
            </p>

            {/* User info strip */}
            {user && (
              <div style={{
                display:"flex", alignItems:"center", gap:12,
                background:"#070f1c",
                border:"1px solid #1e3a5f",
                borderRadius:12, padding:"12px 14px",
                marginBottom:24,
              }}>
                <div style={{
                  width:38, height:38, borderRadius:"50%",
                  background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:700, color:"#fff",
                  fontFamily:"'Outfit',sans-serif", flexShrink:0,
                }}>
                  {(user.displayName||user.username||"A")[0].toUpperCase()}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:600, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {user.displayName || user.username}
                  </div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#475569", marginTop:2 }}>
                    Administrator
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={() => setSignOutModal(false)}
                style={{
                  flex:1,
                  background:"#0f172a",
                  border:"1.5px solid #1e293b",
                  color:"#94a3b8",
                  borderRadius:11, padding:"12px",
                  fontSize:14, fontWeight:600,
                  cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",
                  transition:"border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor="#334155"; e.currentTarget.style.color="#e2e8f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.color="#94a3b8"; }}
              >
                Stay
              </button>
              <button
                onClick={() => { setSignOutModal(false); onLogout(); }}
                style={{
                  flex:2,
                  background:"linear-gradient(135deg,#4f46e5,#6366f1)",
                  border:"none",
                  color:"#fff",
                  borderRadius:11, padding:"12px",
                  fontSize:14, fontWeight:600,
                  cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
                  transition:"opacity 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 14px rgba(99,102,241,0.35)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Yes, Sign Out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

const S = {
  page:     { minHeight:"100vh", background:"linear-gradient(160deg,#020817 0%,#040e1e 60%,#020817 100%)", paddingBottom:48 },
  inner:    { maxWidth:1180, margin:"0 auto", padding:"0 clamp(12px,3vw,24px)" },
  navbar:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"clamp(12px,2vw,18px) 0", borderBottom:"1px solid #0f1f35", marginBottom:"clamp(20px,3vw,34px)", position:"sticky", top:0, background:"rgba(2,8,23,0.95)", backdropFilter:"blur(14px)", zIndex:100, gap:10 },
  navBrand: { display:"flex", alignItems:"center", gap:10, minWidth:0 },
  navLogo:  { width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,rgba(99,102,241,0.22),rgba(79,70,229,0.14))", border:"1.5px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(99,102,241,0.18)", flexShrink:0 },
  tableWrap:{ background:"#070f1c", border:"1.5px solid #1a3050", borderRadius:"clamp(12px,2vw,18px)", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.45)" },
  th:       { padding:"clamp(10px,1.5vw,13px) clamp(10px,1.5vw,16px)", textAlign:"left", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#475569", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap" },
};
