export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body || !body.userId || !body.groupId) {
    return new Response("Missing data", { status: 400 });
  }

  const userId = String(body.userId);
  const groupId = String(body.groupId);

  // 🔹 Verificar que el grupo exista
  const existe = await env.DB.prepare(`
    SELECT id FROM groups WHERE id = ?
  `).bind(groupId).first();

  if (!existe) {
    return new Response("Group not found", { status: 404 });
  }

  // 🔹 Insertar miembro (si ya existe no rompe)
  await env.DB.prepare(`
    INSERT OR IGNORE INTO group_members (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
  `).bind(groupId, userId).run();

  return Response.json({
    ok: true,
    groupId
  });
}
