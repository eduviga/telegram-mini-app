export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const {
    userId,
    tipo,
    nombre,
    extra,
    scope = "user",
    scopeId,
    source = "Web",
    list = "General"
  } = body;

  if (!userId)  return new Response("Missing userId", { status: 400 });
  if (!tipo)    return new Response("Missing tipo", { status: 400 });
  if (!nombre)  return new Response("Missing nombre", { status: 400 });
  if (!scopeId) return new Response("Missing scopeId", { status: 400 });

  const cleanList = String(list).trim().toLowerCase();
  const name = String(nombre).trim();

  // =========================
  // REGISTRAR USUARIO (simple)
  // =========================
  await env.DB.prepare(`
    INSERT INTO users (user_id, source, first_seen_at, last_seen_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      last_seen_at = datetime('now')
  `).bind(
    String(userId),
    source
  ).run();

  // =========================
  // ACCIONES
  // =========================

  if (tipo === "add") {

    const q = parseInt(extra || "1", 10);
    const qty = Number.isFinite(q) && q > 0 ? q : 1;

    const existing = await env.DB.prepare(`
      SELECT qty FROM shopping_items
      WHERE scope=? AND scope_id=? AND list=? AND name=?
    `).bind(scope, scopeId, cleanList, name).first();

    if (existing) {
      await env.DB.prepare(`
        UPDATE shopping_items
        SET qty = qty + ?, done = 0
        WHERE scope=? AND scope_id=? AND list=? AND name=?
      `).bind(qty, scope, scopeId, cleanList, name).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO shopping_items
          (scope, scope_id, user_id, list, name, qty, done, source)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(
        scope,
        scopeId,
        String(userId),
        cleanList,
        name,
        qty,
        source
      ).run();
    }

    return Response.json({ ok: true });
  }

  if (tipo === "toggle") {

    const done = String(extra).toLowerCase() === "true" ? 1 : 0;

    await env.DB.prepare(`
      UPDATE shopping_items
      SET done=?
      WHERE scope=? AND scope_id=? AND list=? AND name=?
    `).bind(done, scope, scopeId, cleanList, name).run();

    return Response.json({ ok: true });
  }

  if (tipo === "delete") {

    await env.DB.prepare(`
      DELETE FROM shopping_items
      WHERE scope=? AND scope_id=? AND list=? AND name=?
    `).bind(scope, scopeId, cleanList, name).run();

    return Response.json({ ok: true });
  }

  if (tipo === "qty") {

    const q = parseInt(extra || "1", 10);
    const qty = Number.isFinite(q) && q > 0 ? q : 1;

    await env.DB.prepare(`
      UPDATE shopping_items
      SET qty=?
      WHERE scope=? AND scope_id=? AND list=? AND name=?
    `).bind(qty, scope, scopeId, cleanList, name).run();

    return Response.json({ ok: true });
  }

  return new Response("Unknown tipo", { status: 400 });
}
