export async function onRequestPost({ request, env }) {

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const { userId, groupId } = body;

  if (!userId) return new Response("Missing userId", { status: 400 });
  if (!groupId) return new Response("Missing groupId", { status: 400 });

  // 1️⃣ Eliminar al usuario del grupo
  await env.DB.prepare(`
    DELETE FROM group_members
    WHERE group_id = ? AND user_id = ?
  `).bind(groupId, userId).run();

  // 2️⃣ Verificar si quedaron miembros
  const remaining = await env.DB.prepare(`
    SELECT COUNT(*) as total
    FROM group_members
    WHERE group_id = ?
  `).bind(groupId).first();

  // 3️⃣ Si no quedan miembros, borrar grupo
  if (!remaining || remaining.total === 0) {
    await env.DB.prepare(`
      DELETE FROM groups
      WHERE id = ?
    `).bind(groupId).run();
  }

  return Response.json({ ok: true });
}
