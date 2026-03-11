/**
 * Client-side API adapter — calls Next.js API routes.
 */
const BASE = "/api/students";

async function handleResponse(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed: HTTP ${res.status}`);
  return json;
}

export async function find(query = {}) {
  const url = query.search
    ? `${BASE}?search=${encodeURIComponent(query.search)}`
    : BASE;
  const json = await handleResponse(await fetch(url, { cache: "no-store" }));
  return json.data;
}

export async function insertOne(doc) {
  const json = await handleResponse(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    })
  );
  return json.data;
}

export async function updateOne(id, update) {
  const json = await handleResponse(
    await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    })
  );
  return json.data;
}

export async function deleteOne(id) {
  const json = await handleResponse(
    await fetch(`${BASE}/${id}`, { method: "DELETE" })
  );
  return { deletedCount: 1, message: json.message };
}
