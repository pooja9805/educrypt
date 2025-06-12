document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("studentLoginForm");
  const errorBox = document.getElementById("loginError");
  const token = localStorage.getItem("token");

  // ✅ If login form is present → it's the login page
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role: "student" }),
        });

        const data = await response.json();
        console.log("🧠 Login Response:", data);

        if (response.ok && data.token) {
          localStorage.clear();
          localStorage.setItem("token", data.token);
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          localStorage.setItem("userId", payload.id); // ✅ Save extracted studentId

          const userRole = data.user?.role || "student";
          const userName = data.user?.name || "Student";
          
          localStorage.setItem("userType", userRole); 
          localStorage.setItem("studentName", userName);
          
          console.log("🧪 Received ID from backend:", data.id);
          window.location.href = "../html/student-dashboard.html";
        } else {
          errorBox.innerText = data.error || "Incorrect username or password. Please try again.";
          errorBox.style.color = "red";
          errorBox.style.marginTop = "10px";
        }
      } catch (err) {
        errorBox.innerText = "Server error. Please try again later.";
        errorBox.style.color = "red";
        console.error("Login error:", err);
      }
    });
  }

  // ✅ If dashboard is present → load student dashboard
  const nameEl = document.querySelector(".user-name");
  const courseContainer = document.querySelector(".course-cards");
  const usernameSpan = document.querySelector(".username");
  const notificationContainer = document.getElementById("notificationList");

  if (token && nameEl && courseContainer && usernameSpan) {
    try {
      const resUser = await fetch("http://localhost:5000/api/students/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const student = await resUser.json();

      nameEl.textContent = student.name || "Student";
      usernameSpan.textContent = student.name?.split(" ")[0] || "Student";

      const resCourses = await fetch("http://localhost:5000/api/students/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { courses } = await resCourses.json();

      courseContainer.innerHTML = "";
      courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <div class="course-image" style="background-color: #00ffff;"></div>
          <div class="course-info">
            <h3>${course.name}</h3>
            <p class="instructor">${course.facultyName}</p>
            <div class="course-meta">
              <span><i class="fas fa-clock"></i> ${course.duration || "Flexible"}</span>
              <span><i class="fas fa-book"></i> ${course.modules || 8} modules</span>
            </div>
            <div class="progress-bar"><div class="progress" style="width: 0%;"></div></div>
            <p class="progress-text">0% completed</p>
          </div>
        `;
        courseContainer.appendChild(div);
      });

      const resNotif = await fetch("http://localhost:5000/api/students/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { notifications } = await resNotif.json();

      const notifBadge = document.querySelector(".notification-badge");
      if (notifications.length > 0) {
        notifBadge.textContent = notifications.length;
        if (notificationContainer) {
          notifications.forEach(n => {
            const item = document.createElement("div");
            item.className = "notif-item";
            item.innerHTML = `<p>${n.message}</p>`;
            notificationContainer.appendChild(item);
          });
        }
      } else {
        notifBadge.style.display = "none";
      }

    } catch (err) {
      console.error("Dashboard load failed:", err);
    }
  }
});
