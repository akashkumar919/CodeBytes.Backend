import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendMailToAdmin = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 🔧 Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ⚠️ apni Gmail ID daalo
        pass: process.env.EMAIL_PASS, // ⚠️ Gmail App Password (not your normal password)
      },
    });

    // ✉️ Email content
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // 👈 where you want to receive messages
      subject: `New Message: ${subject}`,
      text: `
From: ${name}
Email: ${email}

Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
}




export {sendMailToAdmin};

