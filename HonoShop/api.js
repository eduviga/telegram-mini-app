import { getUserId } from "./user.js";

const API_BASE = "/api";

export async function syncAction({ tipo, nombre, extra = null }) {
  const userId = getUserId();

  const payload = {
    userId,
    source: "web",
    scope: "user",
    scopeId: userId,
    tipo,
    nombre,
    extra
  };

  const res = await fetch(`${API_BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Error en sync");
  }

  return res.json();
}

export async function getLista() {
  const userId = getUserId();

  const res = await fetch(
    `${API_BASE}/lista?scope=user&scopeId=${encodeURIComponent(userId)}`
  );

  if (!res.ok) {
    throw new Error("Error al cargar lista");
  }

  return res.json();
}
