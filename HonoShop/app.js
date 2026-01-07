async function agregarItem() {
  const input = document.querySelector("input");
  const texto = input.value.trim();
  if (!texto) return;

  const userId = localStorage.getItem("honoshop_user");

  await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      source: "web",
      scope: "user",
      scopeId: userId,
      tipo: "add",
      nombre: texto
    })
  });

  input.value = "";
}
