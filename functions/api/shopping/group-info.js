export async function onRequestGet({ env, request }) {

  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId");

  if (!groupId) {
    return Response.json({ ok:false });
  }

  const group = await env.DB.prepare(
    "SELECT code FROM groups WHERE id=?"
  ).bind(groupId).first();

  if (!group) {
    return Response.json({ ok:false });
  }

  return Response.json({
    ok:true,
    code: group.code
  });
}
