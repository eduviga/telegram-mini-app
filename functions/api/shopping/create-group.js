export async function onRequestPost({ env, request }) {

  const body = await request.json().catch(() => null);
  if (!body || !body.userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const userId = String(body.userId);

  // 🔹 Generador código 3-3-3
  function generarCodigo() {
    const parte = () =>
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `${parte()}-${parte()}-${parte()}`;
  }

  let groupId;
  let intento = 0;

  // 🔹 Evitar colisiones
  while (intento < 5) {
    groupId = generarCodigo();

    const existe = await env.DB.prepare(`
      SELECT id FROM groups WHERE id = ?
    `).bind(groupId).first();

    if (!existe) break;

    intento++;
  }

  if (!groupId) {
    return new Response("Error generating groupId", { status: 500 });
  }

  // 🔹 Insertar grupo
  await env.DB.prepare(`
    INSERT INTO groups (id, created_at)
    VALUES (?, datetime('now'))
  `).bind(groupId).run();

  // 🔹 Insertar miembro creador
  await env.DB.prepare(`
    INSERT INTO group_members (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
  `).bind(groupId, userId).run();

  return Response.json({
    ok: true,
    groupId
  });
}
