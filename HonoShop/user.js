export function getUserId() {
  let id = localStorage.getItem("honoshop_user");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("honoshop_user", id);
  }
  return id;
}
