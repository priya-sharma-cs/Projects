// bhai kaha add krni h kark dedo bina purana logic ko bigade
// SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    document.getElementById("signupMessage").innerText = data.message;

    if (res.status === 201) {
      // Removing the alert, just redirecting to login page
      window.location.href = "./login.html";
    }
  });
}
// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    document.getElementById("loginMessage").innerText = data.message || "";

    if (res.ok) {
      // Removing the alert, just redirecting to dashboard
      localStorage.setItem("token", data.token); // optional
      
      // localStorage.setItem("userId", data.user.id); // ✅ Save userId also
      window.location.href = "./dashboard.html"; // ✅ Redirect added

      window.location.href = "./dashboard.html"; // ✅ Redirect added
    }
  });
}