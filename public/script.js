const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitButton = contactForm.querySelector('button[type="submit"]');
const submitLabel = document.getElementById("submitLabel");

document.getElementById("year").textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  if (!contactForm.reportValidity()) return;

  const data = Object.fromEntries(new FormData(contactForm).entries());
  submitButton.disabled = true;
  submitLabel.textContent = "Sending…";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Message could not be sent. Please try again.");

    formStatus.textContent = "Thanks! Your message has been sent successfully.";
    formStatus.classList.add("success");
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || "Something went wrong. Please try again later.";
    formStatus.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "Send message";
  }
});
