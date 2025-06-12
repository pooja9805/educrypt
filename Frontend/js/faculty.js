// ✅ FACULTY LOGIN LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("facultyLoginForm");
  const loginError = document.getElementById("facultyLoginError");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("facultyUsername").value.trim();
      const password = document.getElementById("facultyPassword").value.trim();

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            role: "faculty"
          }),
        });

        const data = await res.json();
        console.log("Login response:", data); // <-- Add this

        if (res.ok && data.token) {
            localStorage.clear(); // ✅ Clears all old tokens/roles/student data

            // Save to localStorage
            localStorage.setItem("token", data.token);

            // You need to decode token to extract userId and role
            const decoded = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem("userId", decoded.id);
            localStorage.setItem("role", decoded.role);            
           localStorage.setItem("userRole", data.role || "faculty");

            // ✅ Add console logs here
            console.log("✅ Token:", data.token);
            console.log("✅ Decoded ID:", decoded.id);
            console.log("✅ Role:", decoded.role);            

          window.location.href = "../html/faculty-dashboard.html";
        } else {
          loginError.innerText = data.error || "Invalid credentials. Please try again.";
          loginError.style.color = "red";
        }
        } catch (err) {
        loginError.innerText = "Server error. Please try again later.";
        loginError.style.color = "red";
        console.error("Login failed:", err);
      }
    });
  }
});


// ✅ FACULTY REGISTER LOGIC
const registerForm = document.getElementById("facultyRegisterForm");
const registerError = document.getElementById("facultyRegisterError");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const name = `${firstName} ${lastName}`;
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();
    const errorBox = document.getElementById("facultyRegisterError");

    errorBox.innerText = "";

    if (!email.includes("@")) {
      errorBox.innerText = "Please enter a valid email address.";
      return;
    }

    if (password.length < 8) {
      errorBox.innerText = "Password must be at least 8 characters.";
      return;
    }

    if (password !== confirm) {
      errorBox.innerText = "Passwords do not match.";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/faculty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (res.status === 201) {
        alert("🎉 Registration successful! Please login.");
        window.location.href = "faculty-login.html";
      } else {
        errorBox.innerText = data.error || "Registration failed. Try again.";
      }
    } catch (err) {
      errorBox.innerText = "Server error. Please try again.";
      console.error("Registration error:", err);
    }
  });
}
