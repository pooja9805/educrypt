// /js/forgot-password.js

document.addEventListener("DOMContentLoaded", () => {
  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otp");
  const phoneInput = document.getElementById("phone");

  const HARD_CODED_OTP = "123456";

  document.getElementById("forgotPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const phone = phoneInput.value.trim();

    if (!phone || phone.length < 10) {
      alert("📱 Please enter a valid phone number.");
      return;
    }

    // Show fake OTP in alert
    alert(`✅ OTP sent to your number!\n\n(for demo: ${HARD_CODED_OTP})`);
    localStorage.setItem("reset_phone", phone);

    otpSection.style.display = "block";
  });

  document.getElementById("verifyOtpBtn").addEventListener("click", function () {
    const otp = otpInput.value.trim();

    if (otp === HARD_CODED_OTP) {
      alert("✅ OTP verified! Redirecting to reset page...");
      window.location.href = "reset-password.html";
    } else {
      alert("❌ Invalid OTP. Try again.");
    }
  });
});
