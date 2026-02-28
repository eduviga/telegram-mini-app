export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body || !body.groupId || !body.name) {
    return new Response("Missing data", { status: 400 });
  }

  const groupId = String(body.groupId);
  const newName = String(body.name).trim();

  if (!newName) {
    return new Response("Invalid name", { status: 400 });
  }

  await env.DB.prepare(`
    UPDATE groups
    SET name = ?
    WHERE id = ?
  `).bind(newName, groupId).run();

  return Response.json({ ok: true });
}
