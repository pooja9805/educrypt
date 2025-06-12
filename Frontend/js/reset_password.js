// /js/reset-password.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const phone = localStorage.getItem("reset_phone");
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
      if (!phone) {
        alert("❌ Missing phone number. Please go through Forgot Password again.");
        window.location.href = "forgot-password.html";
        return;
      }
  
      if (newPassword.length < 6) {
        alert("❌ Password must be at least 6 characters long.");
        return;
      }
  
      if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match.");
        return;
      }
  
      // This is just for demo; you'd normally send a POST request to backend here
      alert(`✅ Password reset successful for phone: ${phone}`);
      localStorage.removeItem("reset_phone");
      window.location.href = "login.html"; // change path if login page is elsewhere
    });
  });
  