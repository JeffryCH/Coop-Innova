document.addEventListener("DOMContentLoaded", () => {
  includeHTML("navbar", "fragmentos/navbar.html");
  includeHTML("footer", "fragmentos/footer.html");
});





function includeHTML(id, file) {
  const element = document.getElementById(id);
  if (element) {
    fetch(file)
      .then(response => response.text())
      .then(data => element.innerHTML = data)
      .catch(error => console.error('Error al incluir:', file, error));
  }


}
