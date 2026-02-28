export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const { userId, code } = body;
  if (!userId || !code)
    return new Response("Missing fields", { status: 400 });

  const group = await env.DB.prepare(
    "SELECT id FROM groups WHERE code=?"
  ).bind(code.trim().toUpperCase()).first();

  if (!group)
    return Response.json({ ok: false, error: "Grupo no encontrado" });

  await env.DB.prepare(`
    INSERT OR IGNORE INTO group_members
    (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
  `).bind(group.id, userId).run();

  return Response.json({
    ok: true,
    groupId: group.id
  });
}
