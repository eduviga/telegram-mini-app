export async function onRequestPost({ env, request }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const userId = body.userId ? String(body.userId) : "";
  const tipo = (body.tipo || "").toString().toLowerCase();
  const nombre = (body.nombre || "").toString().trim();
  const extra = body.extra != null ? String(body.extra) : null;

  const scope = (body.scope || "user").toString().toLowerCase(); // "user" | "group"
  const scopeId = body.scopeId ? String(body.scopeId) : "";      // userId o chatId del grupo

  const source = (body.source || "MiniApp").toString().slice(0, 30);

  if (!scopeId) return new Response("Missing scopeId", { status: 400 });
  if (!tipo) return new Response("Missing tipo", { status: 400 });
  if (!nombre) return new Response("Missing nombre", { status: 400 });

  if (tipo === "add") {
  const q = parseInt(extra || "1", 10);
  const qty = Number.isFinite(q) && q > 0 ? q : 1;

  // ¿Existe ya el item?
  const existing = await env.DB.prepare(
    `SELECT qty FROM shopping_items
     WHERE scope=? AND scope_id=? AND name=?`
  ).bind(scope, scopeId, nombre).first();

  if (existing) {
    // sumar cantidad
    await env.DB.prepare(
      `UPDATE shopping_items
       SET qty = qty + ?, done = 0
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(qty, scope, scopeId, nombre).run();
  } else {
    // insertar nuevo
    await env.DB.prepare(
      `INSERT INTO shopping_items (scope, scope_id, user_id, name, qty, done, source)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).bind(scope, scopeId, userId, nombre, qty, source).run();
  }

  return Response.json({ ok: true });
}

  if (tipo === "qty") {
    let q = parseInt(extra || "1", 10);
    if (!Number.isFinite(q) || q < 1) q = 1;

    await env.DB.prepare(
      `UPDATE shopping_items
       SET qty=?
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(q, scope, scopeId, nombre).run();

    return Response.json({ ok: true });
  }

  if (tipo === "toggle") {
    const done = (String(extra).toLowerCase() === "true") ? 1 : 0;

    await env.DB.prepare(
      `UPDATE shopping_items
       SET done=?
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(done, scope, scopeId, nombre).run();

    return Response.json({ ok: true });
  }

  if (tipo === "delete") {
    await env.DB.prepare(
      `DELETE FROM shopping_items
       WHERE scope=? AND scope_id=? AND name=?`
    ).bind(scope, scopeId, nombre).run();

    return Response.json({ ok: true });
  }

  return new Response("Unknown tipo", { status: 400 });
}
