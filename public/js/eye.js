/*Password*/
const passwordBtn = document.getElementById("password-eye");

passwordBtn.addEventListener("click", (e) => {
  const passwordInput = document.getElementById("oldPassword");
  const icon = passwordBtn.querySelector("i");
  const isVisible = icon.classList.contains("ri-eye-line");
  passwordInput.type = isVisible ? "password" : "text";
  icon.setAttribute("class", isVisible ? "ri-eye-off-line" : "ri-eye-line");
});

/* confirmPassword*/
const passwordBtn2 = document.getElementById("password-eye2");

passwordBtn2.addEventListener("click", (e) => {
  const passwordInput2 = document.getElementById("newPassword");
  const icon2 = passwordBtn2.querySelector("i");
  const isVisible2 = icon2.classList.contains("ri-eye-line");
  passwordInput2.type = isVisible2 ? "password" : "text";
  icon2.setAttribute("class", isVisible2 ? "ri-eye-off-line" : "ri-eye-line");
});

/* confirmPassword*/
const passwordBtn3 = document.getElementById("password-eye3");

passwordBtn3.addEventListener("click", (e) => {
  const passwordInput3 = document.getElementById("confirmPassword");
  const icon3 = passwordBtn3.querySelector("i");
  const isVisible3 = icon3.classList.contains("ri-eye-line");
  passwordInput3.type = isVisible3 ? "password" : "text";
  icon3.setAttribute("class", isVisible3 ? "ri-eye-off-line" : "ri-eye-line");
});
