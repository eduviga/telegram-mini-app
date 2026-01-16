export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);

  const scope = (url.searchParams.get("scope") || "user").toLowerCase(); // "user" | "group"
  const scopeId = url.searchParams.get("scopeId"); // userId o chat_instance
  const list = url.searchParams.get("list") || "General";

  if (!scopeId) {
    return new Response("Missing scopeId", { status: 400 });
  }

  const { results } = await env.DB
    .prepare(`
      SELECT id, name, qty, done, source
      FROM shopping_items
      WHERE scope = ? AND scope_id = ? AND list = ?
      ORDER BY id ASC
    `)
    .bind(scope, String(scopeId), list)
    .all();

  const items = (results || []).map(r => ({
    id: r.id,
    name: r.name,
    qty: r.qty,
    done: !!r.done,
    source: r.source
  }));

  return Response.json(items);
}
