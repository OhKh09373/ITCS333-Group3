let myitem = document.querySelector(".action-button#login");
let user = document.getElementById("login-section");
let mylist = document.getElementById("listings-section");
try
{
  myitem.addEventListener("click", login);

  function login() {
  user.style.display = "none";
  mylist.style.display = "flex";
}
}
catch (error) {
  console.error("Error in login function:", error);
}