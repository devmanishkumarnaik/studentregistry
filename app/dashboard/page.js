"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout, getUser } from "@/lib/auth";
import StudentsTable from "@/components/StudentsTable";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user,  setUser]  = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setUser(getUser());
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div style={{ minHeight:"100vh", background:"#020817", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 0.7s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="#1e293b" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <StudentsTable
      user={user}
      onLogout={() => { logout(); router.push("/login"); }}
    />
  );
}
