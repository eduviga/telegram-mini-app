function getUserId() {
  let id = localStorage.getItem("honoshop_user");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("honoshop_user", id);
  }
  return id;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnAgregar");
  const input = document.getElementById("inputProducto");

  btn.addEventListener("click", async () => {
    const texto = input.value.trim();
    if (!texto) return;

    const userId = getUserId();

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
  });
});;
