let myitem = document.querySelector(".action-button#login");
let user = document.getElementById("login-section");
let mylist = document.getElementById("listings-section");

myitem.addEventListener("click", login);

function login() {
  user.style.display = "none";
  mylist.style.display = "flex";
}
