export async function onRequestGet({ env, request }) {

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const rows = await env.DB.prepare(`
    SELECT g.id, g.name
    FROM groups g
    INNER JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = ?
  `).bind(String(userId)).all();

  return Response.json({
    ok: true,
    groups: rows.results
  });
}
