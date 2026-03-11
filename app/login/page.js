"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => { const n = { ...er }; delete n[name]; delete n.global; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.password.trim()) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await login(form.username.trim(), form.password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setLoading(false);
      setErrors({ global: result.error });
    }
  };

  if (!mounted) return null;

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.grid} />

      <div style={S.card}>
        {/* Brand */}
        <div style={S.brand}>
          <div style={S.logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"    stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 12v5c3.333 1.667 8.667 1.667 12 0v-5" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 style={S.brandTitle}>Student Registry</h1>
            <p style={S.brandSub}>Administration Portal</p>
          </div>
        </div>

        <div style={S.divider} />
        <h2 style={S.heading}>Welcome back</h2>
        <p style={S.subheading}>Sign in to your account to continue</p>

        {errors.global && (
          <div style={S.errorBanner} role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div style={S.field}>
            <label style={S.label} htmlFor="username">Username</label>
            <div style={S.inputWrap}>
              <span style={S.icon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="username" type="text" name="username" value={form.username}
                onChange={handleChange} placeholder="Enter username"
                autoComplete="username" style={{ ...S.input, borderColor: errors.username ? "#ef4444" : "#1e3a5f" }}
                onFocus={(e) => { if (!errors.username) { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.15)"; }}}
                onBlur={(e)  => { e.target.style.borderColor=errors.username?"#ef4444":"#1e3a5f"; e.target.style.boxShadow="none"; }}
              />
            </div>
            {errors.username && <p style={S.fieldErr}>{errors.username}</p>}
          </div>

          {/* Password */}
          <div style={S.field}>
            <label style={S.label} htmlFor="password">Password</label>
            <div style={S.inputWrap}>
              <span style={S.icon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password" type={showPw?"text":"password"} name="password" value={form.password}
                onChange={handleChange} placeholder="Enter password"
                autoComplete="current-password" style={{ ...S.input, borderColor: errors.password ? "#ef4444" : "#1e3a5f", paddingRight:46 }}
                onFocus={(e) => { if (!errors.password) { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.15)"; }}}
                onBlur={(e)  => { e.target.style.borderColor=errors.password?"#ef4444":"#1e3a5f"; e.target.style.boxShadow="none"; }}
              />
              <button type="button" onClick={() => setShowPw(v=>!v)} style={S.eyeBtn} aria-label="Toggle password visibility">
                {showPw
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.password && <p style={S.fieldErr}>{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ ...S.submitBtn, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading
              ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 0.7s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </span>
              : "Sign In"
            }
          </button>
        </form>

        <p style={S.footer}>
          © {new Date().getFullYear()} Student Registry. All rights reserved.
        </p>
      </div>
    </div>
  );
}

const S = {
  page:       { minHeight:"100vh", background:"#020817", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", position:"relative", overflow:"hidden" },
  blob1:      { position:"absolute", top:"-20%", left:"-10%", width:"clamp(280px,50vw,500px)", height:"clamp(280px,50vw,500px)", borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)", animation:"float 8s ease-in-out infinite", pointerEvents:"none" },
  blob2:      { position:"absolute", bottom:"-20%", right:"-10%", width:"clamp(300px,55vw,600px)", height:"clamp(300px,55vw,600px)", borderRadius:"50%", background:"radial-gradient(circle,rgba(79,70,229,0.1) 0%,transparent 70%)", animation:"float 10s ease-in-out infinite 2s", pointerEvents:"none" },
  grid:       { position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"52px 52px", pointerEvents:"none" },
  card:       { position:"relative", zIndex:10, background:"rgba(11,22,41,0.97)", backdropFilter:"blur(24px)", border:"1px solid rgba(99,102,241,0.18)", borderRadius:"clamp(16px,3vw,24px)", padding:"clamp(28px,5vw,44px) clamp(20px,5vw,44px)", width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.06)", animation:"slideUp 0.4s ease forwards" },
  brand:      { display:"flex", alignItems:"center", gap:12, marginBottom:24 },
  logoBox:    { width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(79,70,229,0.15))", border:"1.5px solid rgba(99,102,241,0.35)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(99,102,241,0.2)", flexShrink:0 },
  brandTitle: { fontFamily:"'Outfit',sans-serif", fontSize:"clamp(16px,2.5vw,19px)", fontWeight:700, color:"#f1f5f9", lineHeight:1.1 },
  brandSub:   { fontFamily:"'Inter',sans-serif", fontSize:11, color:"#6366f1", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:3 },
  divider:    { height:1, background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)", marginBottom:24 },
  heading:    { fontFamily:"'Outfit',sans-serif", fontSize:"clamp(22px,4vw,28px)", fontWeight:700, color:"#f1f5f9", marginBottom:6, letterSpacing:"-0.02em" },
  subheading: { fontFamily:"'Inter',sans-serif", fontSize:14, color:"#64748b", marginBottom:26, fontWeight:400 },
  errorBanner:{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.35)", color:"#fca5a5", borderRadius:10, padding:"12px 16px", fontSize:13.5, marginBottom:20, display:"flex", alignItems:"center", gap:9, animation:"slideIn 0.2s ease", fontFamily:"'Inter',sans-serif" },
  field:      { marginBottom:18 },
  label:      { display:"block", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#94a3b8", marginBottom:7, fontFamily:"'Inter',sans-serif" },
  inputWrap:  { position:"relative" },
  icon:       { position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#475569", display:"flex", pointerEvents:"none" },
  input:      { width:"100%", background:"#0d1b2e", border:"2px solid #1e3a5f", borderRadius:11, padding:"12px 16px 12px 42px", color:"#f1f5f9", fontSize:15, fontFamily:"'Inter',sans-serif", fontWeight:400, outline:"none", transition:"border-color 0.2s,box-shadow 0.2s", boxSizing:"border-box", lineHeight:1.5 },
  eyeBtn:     { position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" },
  fieldErr:   { color:"#f87171", fontSize:12.5, marginTop:6, fontFamily:"'Inter',sans-serif", fontWeight:500 },
  submitBtn:  { width:"100%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", color:"#fff", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif", marginTop:6, boxShadow:"0 4px 20px rgba(99,102,241,0.35)", transition:"opacity 0.15s", letterSpacing:"-0.01em" },
  footer:     { marginTop:28, textAlign:"center", fontSize:11.5, color:"#1e3a5f", fontFamily:"'Inter',sans-serif" },
};
