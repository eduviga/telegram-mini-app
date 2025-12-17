export async function onRequestPost({ env, request }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const userId = body.userId ? String(body.userId) : null;
  const tipo = body.tipo;
  const nombre = (body.nombre || "").trim();
  const extra = body.extra;

  if (!userId || !tipo || !nombre) {
    return new Response("Missing fields", { status: 400 });
  }

  if (tipo === "add") {
    await env.DB.prepare(
      `INSERT INTO shopping_items (user_id, name, qty, done, source)
       VALUES (?, ?, 1, 0, 'MiniApp')`
    ).bind(userId, nombre).run();
  }

  if (tipo === "qty") {
    const qty = Math.max(1, parseInt(extra, 10) || 1);
    await env.DB.prepare(
      `UPDATE shopping_items SET qty=?
       WHERE user_id=? AND name=?`
    ).bind(qty, userId, nombre).run();
  }

  if (tipo === "toggle") {
    const done = String(extra) === "true" ? 1 : 0;
    await env.DB.prepare(
      `UPDATE shopping_items SET done=?
       WHERE user_id=? AND name=?`
    ).bind(done, userId, nombre).run();
  }

  if (tipo === "delete") {
    await env.DB.prepare(
      `DELETE FROM shopping_items
       WHERE user_id=? AND name=?`
    ).bind(userId, nombre).run();
  }

  return Response.json({ ok: true });
}
