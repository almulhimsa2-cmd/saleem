import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  hashPassword, comparePasswords, generateToken, verifyToken,
  authMiddleware, validatePassword,
} from "./auth";
import nodemailer from "nodemailer";
import * as storage from "./storage";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: `"Saleem App" <${process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@saleem.app"}>`,
      to: email,
      subject: "Your Saleem Verification Code",
      text: `Welcome to Saleem! Your verification code is: ${code}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #003366;">Saleem - سليم</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #50C878; letter-spacing: 8px; text-align: center; font-size: 32px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>`,
    });
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email failed to send:", error);
    return false;
  }
}

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }, require("express").static(uploadsDir));

  // === DOCTOR AUTH ===

  app.post("/api/doctors/register", async (req: Request, res: Response) => {
    try {
      const { email, password, nameEn, nameAr, phone, specialization, licenseNumber, licenseType } = req.body;
      if (!email || !password || !nameEn) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return res.status(400).json({ message: "Password requirements not met", errors: pwCheck.errors });
      }
      const existing = await storage.getDoctorByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashedPw = await hashPassword(password);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let clinicCode = "";
      for (let i = 0; i < 6; i++) clinicCode += chars[Math.floor(Math.random() * chars.length)];

      const doctor = await storage.createDoctor({
        email: email.toLowerCase(),
        password: hashedPw,
        nameEn,
        nameAr: nameAr || null,
        phone: phone || null,
        specialization: specialization || "General",
        licenseNumber: licenseNumber || null,
        licenseType: licenseType || null,
      } as any);
      await storage.updateDoctor(doctor.id, { clinicCode } as any);

      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await storage.createEmailVerification({
        userId: doctor.id,
        userType: "doctor",
        email: email.toLowerCase(),
        codeHash,
        codeExpiresAt,
      });

      await storage.createUserAgreement({ userId: doctor.id, userType: "doctor" });

      console.log(`[DEV] Verification code for ${email}: ${code}`);
      sendVerificationEmail(email.toLowerCase(), code);

      res.status(201).json({
        success: true,
        email: email.toLowerCase(),
        message: "Registration successful, verify your email",
        verification_required: true,
      });
    } catch (error: any) {
      console.error("Doctor register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/doctors/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const doctor = await storage.getDoctorByEmail(email.toLowerCase());
      if (!doctor) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await comparePasswords(password, doctor.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!doctor.emailVerified) {
        const code = generateVerificationCode();
        const codeHash = await hashPassword(code);
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await storage.deleteUnverifiedCodes(email.toLowerCase());
        await storage.createEmailVerification({
          userId: doctor.id,
          userType: "doctor",
          email: email.toLowerCase(),
          codeHash,
          codeExpiresAt,
        });
        console.log(`[DEV] Verification code for ${email}: ${code}`);
        sendVerificationEmail(email.toLowerCase(), code);
        return res.status(403).json({
          message: "Email not verified",
          verification_required: true,
          email: email.toLowerCase(),
        });
      }
      const token = generateToken({ id: doctor.id, type: "doctor" });
      const { password: _, ...doctorData } = doctor;
      res.json({ token, doctor: doctorData });
    } catch (error: any) {
      console.error("Doctor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/doctors/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const doctor = await storage.getDoctorById((req as any).userId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const { password: _, ...doctorData } = doctor;
      res.json(doctorData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/doctors/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;
      delete updates.id;
      const doctor = await storage.updateDoctor((req as any).userId, updates);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const { password: _, ...doctorData } = doctor;
      res.json(doctorData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/doctors/clinic-code", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code || code.length < 3) {
        return res.status(400).json({ message: "Code must be at least 3 characters" });
      }
      const existing = await storage.getDoctorByClinicCode(code);
      if (existing && existing.id !== (req as any).userId) {
        return res.status(409).json({ message: "Code already in use" });
      }
      const doctor = await storage.updateDoctor((req as any).userId, { clinicCode: code.toUpperCase() } as any);
      res.json({ clinicCode: doctor?.clinicCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to update code" });
    }
  });

  // === PATIENT AUTH ===
  app.post("/api/patients/register", async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, phone } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ message: "Email, password, and full name are required" });
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return res.status(400).json({ message: "Password requirements not met", errors: pwCheck.errors });
      }
      const existing = await storage.getPatientByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashedPw = await hashPassword(password);
      const patient = await storage.createPatient({
        email: email.toLowerCase(),
        password: hashedPw,
        fullName,
        phone: phone || null,
      } as any);

      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await storage.createEmailVerification({
        userId: patient.id,
        userType: "patient",
        email: email.toLowerCase(),
        codeHash,
        codeExpiresAt,
      });

      await storage.createUserAgreement({ userId: patient.id, userType: "patient" });

      console.log(`[DEV] Verification code for ${email}: ${code}`);
      sendVerificationEmail(email.toLowerCase(), code);

      res.status(201).json({
        success: true,
        email: email.toLowerCase(),
        message: "Registration successful, verify your email",
        verification_required: true,
      });
    } catch (error: any) {
      console.error("Patient register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/patients/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const patient = await storage.getPatientByEmail(email.toLowerCase());
      if (!patient) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await comparePasswords(password, patient.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!patient.emailVerified) {
        const code = generateVerificationCode();
        const codeHash = await hashPassword(code);
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await storage.deleteUnverifiedCodes(email.toLowerCase());
        await storage.createEmailVerification({
          userId: patient.id,
          userType: "patient",
          email: email.toLowerCase(),
          codeHash,
          codeExpiresAt,
        });
        console.log(`[DEV] Verification code for ${email}: ${code}`);
        sendVerificationEmail(email.toLowerCase(), code);
        return res.status(403).json({
          message: "Email not verified",
          verification_required: true,
          email: email.toLowerCase(),
        });
      }
      const token = generateToken({ id: patient.id, type: "patient" });
      const { password: _, ...patientData } = patient;
      res.json({ token, patient: patientData });
    } catch (error: any) {
      console.error("Patient login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/patients/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const patient = await storage.getPatientById((req as any).userId);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      const { password: _, ...patientData } = patient;
      res.json(patientData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/patients/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;
      delete updates.id;
      const patient = await storage.updatePatient((req as any).userId, updates);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      const { password: _, ...patientData } = patient;
      res.json(patientData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // === EMAIL VERIFICATION ===
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }
      const normalizedEmail = email.toLowerCase().trim();

      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ message: "Invalid code format" });
      }

      const verification = await storage.getLatestVerification(normalizedEmail);
      if (!verification) {
        return res.status(400).json({ message: "Code expired or not found" });
      }

      const codeValid = await comparePasswords(code, verification.codeHash);
      if (!codeValid) {
        await storage.incrementVerificationAttempts(verification.id);
        const remaining = (verification.maxAttempts || 5) - (verification.attempts || 0) - 1;
        return res.status(400).json({
          message: "Invalid verification code",
          attempts_remaining: Math.max(0, remaining),
        });
      }

      await storage.markEmailVerified(verification.id);

      if (verification.userType === "doctor") {
        await storage.updateDoctorEmailVerified(verification.userId);
        const doctor = await storage.getDoctorById(verification.userId);
        if (!doctor) return res.status(404).json({ message: "User not found" });
        const token = generateToken({ id: doctor.id, type: "doctor" });
        const { password: _, ...doctorData } = doctor;
        return res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: doctorData,
          userType: "doctor",
        });
      } else {
        await storage.updatePatientEmailVerified(verification.userId);
        const patient = await storage.getPatientById(verification.userId);
        if (!patient) return res.status(404).json({ message: "User not found" });
        const token = generateToken({ id: patient.id, type: "patient" });
        const { password: _, ...patientData } = patient;
        return res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: patientData,
          userType: "patient",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/resend-code", async (req: Request, res: Response) => {
    try {
      const { email, userType } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const normalizedEmail = email.toLowerCase().trim();

      let user: any;
      let resolvedType = userType;
      if (userType === "doctor") {
        user = await storage.getDoctorByEmail(normalizedEmail);
      } else {
        user = await storage.getPatientByEmail(normalizedEmail);
        resolvedType = "patient";
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      await storage.deleteUnverifiedCodes(normalizedEmail);

      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await storage.createEmailVerification({
        userId: user.id,
        userType: resolvedType,
        email: normalizedEmail,
        codeHash,
        codeExpiresAt,
      });

      console.log(`[DEV] Resent verification code for ${email}: ${code}`);
      sendVerificationEmail(normalizedEmail, code);

      res.json({ success: true, message: "Verification code resent" });
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ message: "Failed to resend code" });
    }
  });

  // === CHAT ROUTES ===
  app.post("/api/chats/join", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { clinicCode } = req.body;
      if (!clinicCode) {
        return res.status(400).json({ message: "Clinic code required" });
      }
      const doctor = await storage.getDoctorByClinicCode(clinicCode);
      if (!doctor) {
        return res.status(404).json({ message: "Invalid clinic code" });
      }
      const blocked = await storage.isPatientBlocked(doctor.id, (req as any).userId);
      if (blocked) {
        return res.status(403).json({ message: "This doctor is not available for chat" });
      }
      const chat = await storage.createChat(doctor.id, (req as any).userId, clinicCode.toUpperCase());
      res.json({ chat, doctorName: doctor.nameEn, doctorSpecialization: doctor.specialization });
    } catch (error) {
      console.error("Join chat error:", error);
      res.status(500).json({ message: "Failed to join chat" });
    }
  });

  app.get("/api/chats", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userType = (req as any).userType;
      const userId = (req as any).userId;
      let chatList;
      if (userType === "doctor") {
        chatList = await storage.getChatsByDoctorId(userId);
        const enrichedChats = [];
        for (const chat of chatList) {
          const lastMsg = await storage.getLastMessage(chat.id);
          const notes = await storage.getDoctorNotes(userId, chat.patientId);
          enrichedChats.push({
            ...chat,
            lastMessage: lastMsg?.text || "",
            lastMessageAt: lastMsg?.createdAt || chat.createdAt,
            hasNotes: !!notes?.notes,
          });
        }
        res.json(enrichedChats);
      } else {
        chatList = await storage.getChatsByPatientId(userId);
        const enrichedChats = [];
        for (const chat of chatList) {
          const lastMsg = await storage.getLastMessage(chat.id);
          enrichedChats.push({
            ...chat,
            lastMessage: lastMsg?.text || "",
            lastMessageAt: lastMsg?.createdAt || chat.createdAt,
          });
        }
        res.json(enrichedChats);
      }
    } catch (error) {
      console.error("Get chats error:", error);
      res.status(500).json({ message: "Failed to get chats" });
    }
  });

  app.get("/api/chats/:chatId/messages", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const chat = await storage.getChatById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      const userId = (req as any).userId;
      if (chat.doctorId !== userId && chat.patientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const messageList = await storage.getMessagesByChatId(chatId);
      await storage.markMessagesAsRead(chatId, (req as any).userType);
      res.json(messageList);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/chats/:chatId/messages", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { text, messageType } = req.body;
      const chat = await storage.getChatById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      const userId = (req as any).userId;
      const userType = (req as any).userType;
      if (chat.doctorId !== userId && chat.patientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (userType === "patient") {
        const blocked = await storage.isPatientBlocked(chat.doctorId, userId);
        if (blocked) {
          return res.status(403).json({ message: "You are blocked from this chat" });
        }
      }
      const message = await storage.createMessage({
        chatId,
        senderId: userId,
        senderType: userType,
        text: text || "",
        messageType: messageType || "text",
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // === DOCTOR NOTES ===
  app.get("/api/doctors/notes/:patientId", authMiddleware, async (req: Request, res: Response) => {
    try {
      const note = await storage.getDoctorNotes((req as any).userId, req.params.patientId);
      res.json(note || { notes: "" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get notes" });
    }
  });

  app.put("/api/doctors/notes/:patientId", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { notes } = req.body;
      const note = await storage.saveDoctorNotes((req as any).userId, req.params.patientId, notes);
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to save notes" });
    }
  });

  // === BLOCK ===
  app.post("/api/doctors/block/:patientId", authMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.blockPatient((req as any).userId, req.params.patientId);
      res.json({ message: "Patient blocked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to block patient" });
    }
  });

  app.post("/api/doctors/unblock/:patientId", authMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.unblockPatient((req as any).userId, req.params.patientId);
      res.json({ message: "Patient unblocked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unblock patient" });
    }
  });

  app.get("/api/doctors/blocked", authMiddleware, async (req: Request, res: Response) => {
    try {
      const doctor = await storage.getDoctorById((req as any).userId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const blockedIds = (doctor.blockedPatients as string[]) || [];
      const blockedList = [];
      for (const id of blockedIds) {
        const patient = await storage.getPatientById(id);
        if (patient) {
          blockedList.push({ id: patient.id, fullName: patient.fullName, email: patient.email });
        }
      }
      res.json(blockedList);
    } catch (error) {
      res.status(500).json({ message: "Failed to get blocked patients" });
    }
  });

  // === DOCTOR PROFILE (PUBLIC) ===
  app.get("/api/doctors/profile/:doctorId", async (req: Request, res: Response) => {
    try {
      const doctor = await storage.getDoctorById(req.params.doctorId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      res.json({
        id: doctor.id,
        nameEn: doctor.nameEn,
        nameAr: doctor.nameAr,
        specialization: doctor.specialization,
        bio: doctor.bio,
        profilePictureUrl: doctor.profilePictureUrl,
        youtubeLink: doctor.youtubeLink,
        websiteLink: doctor.websiteLink,
        verified: doctor.verified,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get doctor profile" });
    }
  });

  // === PROFILE PICTURE UPLOAD ===
  app.post("/api/upload/profile-picture", authMiddleware, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file provided" });
      const fileUrl = `/uploads/${file.filename}`;
      const userType = (req as any).userType;
      if (userType === "doctor") {
        await storage.updateDoctor((req as any).userId, { profilePictureUrl: fileUrl } as any);
      }
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload picture" });
    }
  });

  // === SOCKET.IO ===
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    (socket as any).userId = payload.id;
    (socket as any).userType = payload.type;
    next();
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    const userType = (socket as any).userType;
    console.log(`Socket connected: ${userType} ${userId}`);

    socket.join(`user:${userId}`);

    socket.on("join_chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("send_message", async (data: { chatId: string; text: string; messageType?: string }) => {
      try {
        const chat = await storage.getChatById(data.chatId);
        if (!chat) return;
        if (chat.doctorId !== userId && chat.patientId !== userId) return;
        if (userType === "patient") {
          const blocked = await storage.isPatientBlocked(chat.doctorId, userId);
          if (blocked) {
            socket.emit("error_message", { message: "You are blocked from this chat" });
            return;
          }
        }
        const message = await storage.createMessage({
          chatId: data.chatId,
          senderId: userId,
          senderType: userType,
          text: data.text,
          messageType: data.messageType || "text",
        });
        io.to(`chat:${data.chatId}`).emit("new_message", message);
        const otherUserId = chat.doctorId === userId ? chat.patientId : chat.doctorId;
        io.to(`user:${otherUserId}`).emit("chat_update", {
          chatId: data.chatId,
          lastMessage: data.text,
          lastMessageAt: message.createdAt,
        });
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    socket.on("mark_read", async (chatId: string) => {
      try {
        await storage.markMessagesAsRead(chatId, userType);
        const chat = await storage.getChatById(chatId);
        if (chat) {
          const otherUserId = chat.doctorId === userId ? chat.patientId : chat.doctorId;
          io.to(`user:${otherUserId}`).emit("messages_read", { chatId });
        }
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${userType} ${userId}`);
    });
  });

  // === ADMIN ROUTES ===
  const ADMIN_EMAIL = "admin@saleem.app";

  function adminMiddleware(req: Request, res: Response, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || !(payload as any).admin) {
      return res.status(401).json({ message: "Not authorized as admin" });
    }
    next();
  }

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      if (email.toLowerCase() !== ADMIN_EMAIL) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.SESSION_SECRET || "saleem-health-secret-key-2024";
      const token = jwt.sign({ id: "admin", type: "doctor", admin: true, email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ success: true, token });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/stats", adminMiddleware, async (_req: Request, res: Response) => {
    try {
      const [totalDoctors, totalPatients, messagesToday, activeToday, newDoctorsToday, newPatientsToday, totalChats] = await Promise.all([
        storage.getDoctorCount(),
        storage.getPatientCount(),
        storage.getMessageCountToday(),
        storage.getActiveUsersToday(),
        storage.getNewDoctorsToday(),
        storage.getNewPatientsToday(),
        storage.getTotalChats(),
      ]);
      res.json({
        totalDoctors,
        totalPatients,
        totalUsers: totalDoctors + totalPatients,
        messagesToday,
        activeToday,
        newToday: newDoctorsToday + newPatientsToday,
        totalChats,
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", adminMiddleware, async (_req: Request, res: Response) => {
    try {
      const [doctorsList, patientsList] = await Promise.all([
        storage.getAllDoctors(),
        storage.getAllPatients(),
      ]);
      const users = [
        ...doctorsList.map((d: any) => ({ id: d.id, email: d.email, displayName: d.nameEn || d.nameAr || "Unknown", userType: "professional", emailVerified: d.emailVerified, specialization: d.specialization, createdAt: d.createdAt })),
        ...patientsList.map((p: any) => ({ id: p.id, email: p.email, displayName: p.fullName || "Unknown", userType: "client", emailVerified: p.emailVerified, createdAt: p.createdAt })),
      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(users);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/user-growth", adminMiddleware, async (_req: Request, res: Response) => {
    try {
      const growth = await storage.getUserGrowth(30);
      res.json(growth);
    } catch (error) {
      console.error("Admin growth error:", error);
      res.status(500).json({ message: "Failed to fetch growth data" });
    }
  });

  return httpServer;
}
