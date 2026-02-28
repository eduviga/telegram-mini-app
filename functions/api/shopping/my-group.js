export async function onRequestGet({ env, request }) {

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const rows = await env.DB.prepare(`
    SELECT group_id
    FROM group_members
    WHERE user_id = ?
  `).bind(String(userId)).all();

  const groups = rows.results.map(r => r.group_id);

  return Response.json({
    ok: true,
    groups
  });
}
