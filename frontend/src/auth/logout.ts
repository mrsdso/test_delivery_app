export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login"; // Можно использовать navigate из react-router-dom
}