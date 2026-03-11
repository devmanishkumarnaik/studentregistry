"use client";
import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const cfg = {
    success: { bg:"#051a0e", border:"#22c55e", color:"#86efac", icon:"✓" },
    warning: { bg:"#1c0f00", border:"#f97316", color:"#fdba74", icon:"!" },
    error:   { bg:"#1c0505", border:"#ef4444", color:"#fca5a5", icon:"✕" },
  }[type] || { bg:"#051a0e", border:"#22c55e", color:"#86efac", icon:"✓" };

  return (
    <div role="alert" aria-live="polite" style={{
      position:"fixed", top:"clamp(12px,3vw,20px)", right:"clamp(12px,3vw,20px)",
      zIndex:9999, background:cfg.bg,
      border:`1.5px solid ${cfg.border}44`, color:cfg.color,
      borderRadius:13, padding:"13px 18px", fontSize:13.5, fontWeight:500,
      fontFamily:"'Inter',sans-serif",
      boxShadow:`0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}18`,
      display:"flex", alignItems:"center", gap:10,
      maxWidth:"min(380px, calc(100vw - 24px))",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(60px)",
      transition:"opacity 0.3s ease, transform 0.3s ease",
      animation:"toastIn 0.3s ease",
    }}>
      <span style={{ width:24, height:24, borderRadius:"50%", background:`${cfg.border}20`, border:`1.5px solid ${cfg.border}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, color:cfg.border }}>
        {cfg.icon}
      </span>
      <span style={{ flex:1, lineHeight:1.4 }}>{message}</span>
    </div>
  );
}
