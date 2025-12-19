export async function onRequestPost({ env, request }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const tipo = (body.tipo || "").toString().toLowerCase();
  const nombre = (body.nombre || "").toString().trim();
  const extra = body.extra;

  const scope = (body.scope || "user").toString().toLowerCase();   // "user" | "group"
  const scopeId = body.scopeId ? String(body.scopeId) : null;      // userId o chat_instance

  const source = (body.source || "MiniApp").toString().slice(0, 30);

  if (!tipo || !nombre || !scopeId) {
    return new Response("Missing fields", { status: 400 });
  }

  if (tipo === "add") {
    await env.DB.prepare(
      `INSERT INTO shopping_items (scope, scope_id, user_id, name, qty, done, source)
       VALUES (?, ?, ?, ?, 1, 0, ?)`
    ).bind(scope, scopeId, String(body.userId || ""), nombre, source).run();
  }

  if (tipo === "qty") {
    const qty = Math.max(1, parseInt(extra ?? "1", 10) || 1);
    await env.DB.prepare(
      `UPDATE shopping_items SET qty=?
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(qty, scope, scopeId, nombre).run();
  }

  if (tipo === "toggle") {
    const done = String(extra).toLowerCase() === "true" ? 1 : 0;
    await env.DB.prepare(
      `UPDATE shopping_items SET done=?
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(done, scope, scopeId, nombre).run();
  }

  if (tipo === "delete") {
    await env.DB.prepare(
      `DELETE FROM shopping_items
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(scope, scopeId, nombre).run();
  }

  return Response.json({ ok: true });
}
