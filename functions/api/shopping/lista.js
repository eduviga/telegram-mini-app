export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const { results } = await env.DB
    .prepare(`
      SELECT id, name, qty, done, source
      FROM shopping_items
      WHERE user_id = ?
      ORDER BY id ASC
    `)
    .bind(String(userId))
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
