const AUTH_KEY = "sr_session";

/**
 * POST /api/auth/login  — validates credentials against MongoDB Admin collection.
 * On success stores a session in localStorage with an 8-hour expiry.
 */
export async function login(username, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          user: json.user,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 h
        })
      );
      return { success: true, user: json.user };
    }
    return { success: false, error: json.error || "Login failed" };
  } catch {
    return { success: false, error: "Network error — check your connection" };
  }
}

/** Returns true if a valid, non-expired session exists. */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Returns the stored user object or null. */
export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw).user || null;
  } catch {
    return null;
  }
}

/** Clears the session. */
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}
