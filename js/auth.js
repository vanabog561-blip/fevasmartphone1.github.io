let mode = "login";
const form = document.querySelector("#authForm");
const nameInput = document.querySelector("#name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const msg = document.querySelector("#authMessage");
const title = document.querySelector("#authTitle");
const subtitle = document.querySelector("#authSubtitle");
const submit = document.querySelector("#submitBtn");
const reset = document.querySelector("#resetBtn");

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  mode = tab.dataset.mode;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  nameInput.parentElement.classList.toggle("hidden", mode === "login");
  title.textContent = mode === "login" ? "С возвращением 👋" : "Создай аккаунт ✨";
  subtitle.textContent = mode === "login" ? "Войди, чтобы сохранять телефоны." : "Регистрация займёт меньше минуты.";
  submit.textContent = mode === "login" ? "Войти" : "Зарегистрироваться";
  reset.classList.toggle("hidden", mode !== "login");
  msg.textContent = "";
}));

form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.textContent = "Подождите…";
  try {
    if (mode === "login") {
      await auth.signInWithEmailAndPassword(email.value.trim(), password.value);
      location.href = "index.html";
    } else {
      const cred = await auth.createUserWithEmailAndPassword(email.value.trim(), password.value);
      const name = nameInput.value.trim() || "Пользователь";
      await cred.user.updateProfile({ displayName: name });
      await db.collection("users").doc(cred.user.uid).set({
        name, email: cred.user.email, role: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      location.href = "index.html";
    }
  } catch (error) {
    console.error(error);
    const messages = {
      "auth/email-already-in-use":"Этот email уже зарегистрирован.",
      "auth/invalid-credential":"Неверный email или пароль.",
      "auth/weak-password":"Пароль слишком слабый.",
      "auth/invalid-email":"Проверьте email."
    };
    msg.textContent = messages[error.code] || error.message;
  }
});

reset.addEventListener("click", async () => {
  if (!email.value.trim()) { msg.textContent = "Сначала введи email."; return; }
  try {
    await auth.sendPasswordResetEmail(email.value.trim());
    msg.textContent = "Письмо для восстановления отправлено.";
  } catch (e) { msg.textContent = e.message; }
});

auth.onAuthStateChanged(() => {});
