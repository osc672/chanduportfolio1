require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.static(publicDir));

// Vercel serves files in /public through its CDN. This route also makes the
// homepage work when running the app locally with `npm start`.
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
app.get("/health", (req, res) => res.json({ ok: true }));

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_TO"];
function missingSmtpSettings() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (![name, email, subject, message].every((v) => typeof v === "string" && v.trim())) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }
  if (name.trim().length < 2 || name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254 ||
      subject.trim().length < 3 || subject.length > 120 ||
      message.trim().length < 10 || message.length > 5000) {
    return res.status(400).json({ error: "Please check your details and try again." });
  }

  const missing = missingSmtpSettings();
  if (missing.length) {
    console.error("SMTP environment variables missing:", missing.join(", "));
    return res.status(503).json({ error: "Email service is not configured. Please try again later." });
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: { name: name.trim(), address: email.trim() },
      subject: `[Portfolio] ${subject.trim()}`,
      text: `New portfolio message\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\n${message.trim()}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#20242c"><div style="background:#101218;color:#fff;padding:24px;border-radius:14px 14px 0 0"><h2 style="margin:0">Sai Chandu <span style="color:#c2f970">·</span> Portfolio</h2><p style="color:#c2f970;margin-bottom:0">New contact form message</p></div><div style="padding:24px;border:1px solid #e7e9ee;border-radius:0 0 14px 14px"><p><b>Name:</b> ${escapeHtml(name.trim())}</p><p><b>Email:</b> ${escapeHtml(email.trim())}</p><p><b>Subject:</b> ${escapeHtml(subject.trim())}</p><hr><p><b>Message</b></p><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message.trim())}</p><p><a href="mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(`Re: ${subject.trim()}`)}" style="display:inline-block;background:#c2f970;padding:12px 16px;border-radius:8px;color:#111;text-decoration:none;font-weight:bold">Reply to sender</a></p></div></div>`,
    });
    return res.json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("SMTP send error:", error.message);
    return res.status(502).json({ error: "The email could not be sent. Please try again later." });
  }
});

// Export the Express app for Vercel's zero-configuration Express runtime.
module.exports = app;

// Start a local HTTP server only when running directly with Node.js.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
}
