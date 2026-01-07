console.log("app.js cargado");
async function agregarItem() {
  const input = document.querySelector("input");
  const texto = input.value.trim();
  if (!texto) return;

  await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: localStorage.getItem("honoshop_user"),
      source: "web",
      scope: "user",
      scopeId: localStorage.getItem("honoshop_user"),
      tipo: "add",
      nombre: texto
    })
  });

  input.value = "";
}
