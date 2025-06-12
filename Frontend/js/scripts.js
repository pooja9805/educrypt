const texts = [
    "AI-enhanced education experience.",
    "Secure file uploads with encryption.",
    "Compiler for real-time coding practice.",
    "Notion-style smart note-taking.",
    "Faculties can manage attendance easily.",
    "Students see course material clearly.",
    "Admin controls with full authority.",
    "Interactive dashboards for everyone.",
    "Personalized learning paths.",
    "Welcome to the future of education."
  ];
  
  let index = 0;
  let charIndex = 0;
  const typedText = document.getElementById("typedText");
  
  function typeNext() {
    if (!typedText) return;
  
    if (charIndex < texts[index].length) {
      typedText.innerHTML += texts[index].charAt(charIndex);
      charIndex++;
      setTimeout(typeNext, 50);
    } else {
      setTimeout(() => {
        typedText.innerHTML = "";
        index = (index + 1) % texts.length;
        charIndex = 0;
        setTimeout(typeNext, 500);
      }, 2000);
    }
  }
  
  window.onload = typeNext;
  