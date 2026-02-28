export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const { userId, name } = body;
  if (!userId || !name)
    return new Response("Missing fields", { status: 400 });

  const groupId = crypto.randomUUID();

  // Generar código corto de 6 caracteres
  function generarCodigo() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  let code;
  let exists = true;

  // evitar colisión
  while (exists) {
    code = generarCodigo();
    const check = await env.DB.prepare(
      "SELECT id FROM groups WHERE code=?"
    ).bind(code).first();
    exists = !!check;
  }

  await env.DB.prepare(`
    INSERT INTO groups (id, code, name, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).bind(groupId, code, name.trim()).run();

  await env.DB.prepare(`
    INSERT INTO group_members (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
  `).bind(groupId, userId).run();

  return Response.json({
    ok: true,
    groupId,
    code
  });
}
