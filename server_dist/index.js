"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express = __toESM(require("express"));

// server/routes.ts
var import_node_http = require("node:http");
var import_socket = require("socket.io");
var import_multer = __toESM(require("multer"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// server/auth.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var JWT_SECRET = process.env.SESSION_SECRET || "saleem-health-secret-key-2024";
async function hashPassword(password) {
  return import_bcryptjs.default.hash(password, 12);
}
async function comparePasswords(password, hash) {
  return import_bcryptjs.default.compare(password, hash);
}
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
function verifyToken(token) {
  try {
    return import_jsonwebtoken.default.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  req.userId = payload.id;
  req.userType = payload.type;
  next();
}
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least 1 number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("At least 1 special character");
  return { valid: errors.length === 0, errors };
}

// server/routes.ts
var import_nodemailer = __toESM(require("nodemailer"));

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chats: () => chats,
  doctorNotes: () => doctorNotes,
  doctors: () => doctors,
  emailVerifications: () => emailVerifications,
  insertDoctorSchema: () => insertDoctorSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertPatientSchema: () => insertPatientSchema,
  messages: () => messages,
  patients: () => patients,
  userAgreements: () => userAgreements
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var doctors = (0, import_pg_core.pgTable)("doctors", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  password: (0, import_pg_core.text)("password").notNull(),
  nameEn: (0, import_pg_core.text)("name_en").notNull(),
  nameAr: (0, import_pg_core.text)("name_ar"),
  phone: (0, import_pg_core.text)("phone"),
  specialization: (0, import_pg_core.text)("specialization").default("General"),
  licenseNumber: (0, import_pg_core.text)("license_number"),
  licenseType: (0, import_pg_core.text)("license_type"),
  licenseFileUrl: (0, import_pg_core.text)("license_file_url"),
  licenseExpiry: (0, import_pg_core.text)("license_expiry"),
  verified: (0, import_pg_core.boolean)("verified").default(false),
  verificationStatus: (0, import_pg_core.text)("verification_status").default("pending"),
  emailVerified: (0, import_pg_core.boolean)("email_verified").default(false),
  emailVerifiedAt: (0, import_pg_core.timestamp)("email_verified_at"),
  bio: (0, import_pg_core.text)("bio"),
  profilePictureUrl: (0, import_pg_core.text)("profile_picture_url"),
  youtubeLink: (0, import_pg_core.text)("youtube_link"),
  websiteLink: (0, import_pg_core.text)("website_link"),
  linkedinLink: (0, import_pg_core.text)("linkedin_link"),
  clinicCode: (0, import_pg_core.text)("clinic_code").unique(),
  blockedPatients: (0, import_pg_core.jsonb)("blocked_patients").$type().default([]),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var patients = (0, import_pg_core.pgTable)("patients", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  password: (0, import_pg_core.text)("password").notNull(),
  fullName: (0, import_pg_core.text)("full_name").notNull(),
  phone: (0, import_pg_core.text)("phone"),
  emailVerified: (0, import_pg_core.boolean)("email_verified").default(false),
  emailVerifiedAt: (0, import_pg_core.timestamp)("email_verified_at"),
  pdplConsent: (0, import_pg_core.boolean)("pdpl_consent").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var chats = (0, import_pg_core.pgTable)("chats", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  clinicCode: (0, import_pg_core.text)("clinic_code").notNull(),
  doctorId: (0, import_pg_core.varchar)("doctor_id").notNull(),
  patientId: (0, import_pg_core.varchar)("patient_id").notNull(),
  active: (0, import_pg_core.boolean)("active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  lastMessageAt: (0, import_pg_core.timestamp)("last_message_at").defaultNow()
});
var messages = (0, import_pg_core.pgTable)("messages", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  chatId: (0, import_pg_core.varchar)("chat_id").notNull(),
  senderId: (0, import_pg_core.varchar)("sender_id").notNull(),
  senderType: (0, import_pg_core.text)("sender_type").notNull(),
  text: (0, import_pg_core.text)("text"),
  messageType: (0, import_pg_core.text)("message_type").default("text"),
  voiceUrl: (0, import_pg_core.text)("voice_url"),
  voiceDuration: (0, import_pg_core.integer)("voice_duration"),
  read: (0, import_pg_core.boolean)("read").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var doctorNotes = (0, import_pg_core.pgTable)("doctor_notes", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  doctorId: (0, import_pg_core.varchar)("doctor_id").notNull(),
  patientId: (0, import_pg_core.varchar)("patient_id").notNull(),
  notes: (0, import_pg_core.text)("notes"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var emailVerifications = (0, import_pg_core.pgTable)("email_verifications", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").notNull(),
  userType: (0, import_pg_core.text)("user_type").notNull(),
  email: (0, import_pg_core.text)("email").notNull(),
  codeHash: (0, import_pg_core.text)("code_hash").notNull(),
  codeExpiresAt: (0, import_pg_core.timestamp)("code_expires_at").notNull(),
  verifiedAt: (0, import_pg_core.timestamp)("verified_at"),
  attempts: (0, import_pg_core.integer)("attempts").default(0),
  maxAttempts: (0, import_pg_core.integer)("max_attempts").default(5),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var userAgreements = (0, import_pg_core.pgTable)("user_agreements", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").notNull(),
  userType: (0, import_pg_core.text)("user_type").notNull(),
  agreedToTerms: (0, import_pg_core.boolean)("agreed_to_terms").default(false),
  termsAgreedAt: (0, import_pg_core.timestamp)("terms_agreed_at"),
  termsVersion: (0, import_pg_core.text)("terms_version").default("1.0"),
  agreedToPrivacy: (0, import_pg_core.boolean)("agreed_to_privacy").default(false),
  privacyAgreedAt: (0, import_pg_core.timestamp)("privacy_agreed_at"),
  privacyVersion: (0, import_pg_core.text)("privacy_version").default("1.0"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertDoctorSchema = (0, import_drizzle_zod.createInsertSchema)(doctors).pick({
  email: true,
  password: true,
  nameEn: true,
  nameAr: true,
  phone: true,
  specialization: true,
  licenseNumber: true,
  licenseType: true
});
var insertPatientSchema = (0, import_drizzle_zod.createInsertSchema)(patients).pick({
  email: true,
  password: true,
  fullName: true,
  phone: true
});
var insertMessageSchema = (0, import_drizzle_zod.createInsertSchema)(messages).pick({
  chatId: true,
  senderId: true,
  senderType: true,
  text: true,
  messageType: true
});

// server/db.ts
var pool = new import_pg.default.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/storage.ts
async function createDoctor(data) {
  const [doctor] = await db.insert(doctors).values(data).returning();
  return doctor;
}
async function getDoctorByEmail(email) {
  const [doctor] = await db.select().from(doctors).where((0, import_drizzle_orm2.eq)(doctors.email, email.toLowerCase()));
  return doctor;
}
async function getDoctorById(id) {
  const [doctor] = await db.select().from(doctors).where((0, import_drizzle_orm2.eq)(doctors.id, id));
  return doctor;
}
async function getDoctorByClinicCode(code) {
  const [doctor] = await db.select().from(doctors).where((0, import_drizzle_orm2.eq)(doctors.clinicCode, code.toUpperCase()));
  return doctor;
}
async function updateDoctor(id, data) {
  const [doctor] = await db.update(doctors).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(doctors.id, id)).returning();
  return doctor;
}
async function createPatient(data) {
  const [patient] = await db.insert(patients).values(data).returning();
  return patient;
}
async function getPatientByEmail(email) {
  const [patient] = await db.select().from(patients).where((0, import_drizzle_orm2.eq)(patients.email, email.toLowerCase()));
  return patient;
}
async function getPatientById(id) {
  const [patient] = await db.select().from(patients).where((0, import_drizzle_orm2.eq)(patients.id, id));
  return patient;
}
async function updatePatient(id, data) {
  const [patient] = await db.update(patients).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(patients.id, id)).returning();
  return patient;
}
async function createChat(doctorId, patientId, clinicCode) {
  const existing = await db.select().from(chats).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(chats.doctorId, doctorId), (0, import_drizzle_orm2.eq)(chats.patientId, patientId), (0, import_drizzle_orm2.eq)(chats.active, true))
  );
  if (existing.length > 0) return existing[0];
  const [chat] = await db.insert(chats).values({ doctorId, patientId, clinicCode }).returning();
  return chat;
}
async function getChatsByDoctorId(doctorId) {
  const chatList = await db.select().from(chats).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(chats.doctorId, doctorId), (0, import_drizzle_orm2.eq)(chats.active, true))
  ).orderBy((0, import_drizzle_orm2.desc)(chats.lastMessageAt));
  const result = [];
  for (const chat of chatList) {
    const patient = await getPatientById(chat.patientId);
    const unreadMessages = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(messages).where(
      (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(messages.chatId, chat.id), (0, import_drizzle_orm2.eq)(messages.senderType, "patient"), (0, import_drizzle_orm2.eq)(messages.read, false))
    );
    result.push({
      ...chat,
      patientName: patient?.fullName || "Unknown",
      unreadCount: Number(unreadMessages[0]?.count || 0)
    });
  }
  return result;
}
async function getChatsByPatientId(patientId) {
  const chatList = await db.select().from(chats).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(chats.patientId, patientId), (0, import_drizzle_orm2.eq)(chats.active, true))
  ).orderBy((0, import_drizzle_orm2.desc)(chats.lastMessageAt));
  const result = [];
  for (const chat of chatList) {
    const doctor = await getDoctorById(chat.doctorId);
    const unreadMessages = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(messages).where(
      (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(messages.chatId, chat.id), (0, import_drizzle_orm2.eq)(messages.senderType, "doctor"), (0, import_drizzle_orm2.eq)(messages.read, false))
    );
    result.push({
      ...chat,
      doctorName: doctor?.nameEn || "Unknown",
      unreadCount: Number(unreadMessages[0]?.count || 0)
    });
  }
  return result;
}
async function getChatById(chatId) {
  const [chat] = await db.select().from(chats).where((0, import_drizzle_orm2.eq)(chats.id, chatId));
  return chat;
}
async function createMessage(data) {
  const [message] = await db.insert(messages).values(data).returning();
  await db.update(chats).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(chats.id, data.chatId));
  return message;
}
async function getMessagesByChatId(chatId, limit = 100) {
  return db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.chatId, chatId)).orderBy(messages.createdAt).limit(limit);
}
async function markMessagesAsRead(chatId, readerType) {
  const senderType = readerType === "doctor" ? "patient" : "doctor";
  await db.update(messages).set({ read: true }).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(messages.chatId, chatId), (0, import_drizzle_orm2.eq)(messages.senderType, senderType), (0, import_drizzle_orm2.eq)(messages.read, false))
  );
}
async function getLastMessage(chatId) {
  const [msg] = await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.chatId, chatId)).orderBy((0, import_drizzle_orm2.desc)(messages.createdAt)).limit(1);
  return msg;
}
async function saveDoctorNotes(doctorId, patientId, notes) {
  const existing = await db.select().from(doctorNotes).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(doctorNotes.doctorId, doctorId), (0, import_drizzle_orm2.eq)(doctorNotes.patientId, patientId))
  );
  if (existing.length > 0) {
    const [note2] = await db.update(doctorNotes).set({ notes, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(doctorNotes.id, existing[0].id)).returning();
    return note2;
  }
  const [note] = await db.insert(doctorNotes).values({ doctorId, patientId, notes }).returning();
  return note;
}
async function getDoctorNotes(doctorId, patientId) {
  const [note] = await db.select().from(doctorNotes).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(doctorNotes.doctorId, doctorId), (0, import_drizzle_orm2.eq)(doctorNotes.patientId, patientId))
  );
  return note;
}
async function blockPatient(doctorId, patientId) {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return;
  const blocked = doctor.blockedPatients || [];
  if (!blocked.includes(patientId)) {
    blocked.push(patientId);
    await updateDoctor(doctorId, { blockedPatients: blocked });
  }
}
async function unblockPatient(doctorId, patientId) {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return;
  const blocked = (doctor.blockedPatients || []).filter((id) => id !== patientId);
  await updateDoctor(doctorId, { blockedPatients: blocked });
}
async function isPatientBlocked(doctorId, patientId) {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return false;
  return (doctor.blockedPatients || []).includes(patientId);
}
async function createEmailVerification(data) {
  const [record] = await db.insert(emailVerifications).values(data).returning();
  return record;
}
async function getLatestVerification(email) {
  const [record] = await db.select().from(emailVerifications).where(
    (0, import_drizzle_orm2.and)(
      (0, import_drizzle_orm2.eq)(emailVerifications.email, email.toLowerCase()),
      import_drizzle_orm2.sql`${emailVerifications.verifiedAt} IS NULL`,
      import_drizzle_orm2.sql`${emailVerifications.codeExpiresAt} > NOW()`,
      import_drizzle_orm2.sql`${emailVerifications.attempts} < ${emailVerifications.maxAttempts}`
    )
  ).orderBy((0, import_drizzle_orm2.desc)(emailVerifications.createdAt)).limit(1);
  return record;
}
async function incrementVerificationAttempts(id) {
  await db.update(emailVerifications).set({ attempts: import_drizzle_orm2.sql`${emailVerifications.attempts} + 1` }).where((0, import_drizzle_orm2.eq)(emailVerifications.id, id));
}
async function markEmailVerified(id) {
  await db.update(emailVerifications).set({ verifiedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(emailVerifications.id, id));
}
async function deleteUnverifiedCodes(email) {
  await db.delete(emailVerifications).where(
    (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(emailVerifications.email, email.toLowerCase()), import_drizzle_orm2.sql`${emailVerifications.verifiedAt} IS NULL`)
  );
}
async function updatePatientEmailVerified(id) {
  await db.update(patients).set({ emailVerified: true, emailVerifiedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(patients.id, id));
}
async function updateDoctorEmailVerified(id) {
  await db.update(doctors).set({ emailVerified: true, emailVerifiedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(doctors.id, id));
}
async function createUserAgreement(data) {
  const now = /* @__PURE__ */ new Date();
  const [agreement] = await db.insert(userAgreements).values({
    userId: data.userId,
    userType: data.userType,
    agreedToTerms: true,
    termsAgreedAt: now,
    agreedToPrivacy: true,
    privacyAgreedAt: now
  }).returning();
  return agreement;
}

// server/routes.ts
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS
  }
});
async function sendVerificationEmail(email, code) {
  try {
    await transporter.sendMail({
      from: `"Saleem App" <${process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@saleem.app"}>`,
      to: email,
      subject: "Your Saleem Verification Code",
      text: `Welcome to Saleem! Your verification code is: ${code}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #003366;">Saleem - \u0633\u0644\u064A\u0645</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #50C878; letter-spacing: 8px; text-align: center; font-size: 32px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>`
    });
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email failed to send:", error);
    return false;
  }
}
var upload = (0, import_multer.default)({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  }
});
var uploadsDir = import_path.default.resolve(process.cwd(), "uploads");
if (!import_fs.default.existsSync(uploadsDir)) {
  import_fs.default.mkdirSync(uploadsDir, { recursive: true });
}
function generateVerificationCode() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
async function registerRoutes(app2) {
  app2.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }, require("express").static(uploadsDir));
  app2.post("/api/doctors/register", async (req, res) => {
    try {
      const { email, password, nameEn, nameAr, phone, specialization, licenseNumber, licenseType } = req.body;
      if (!email || !password || !nameEn) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return res.status(400).json({ message: "Password requirements not met", errors: pwCheck.errors });
      }
      const existing = await getDoctorByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashedPw = await hashPassword(password);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let clinicCode = "";
      for (let i = 0; i < 6; i++) clinicCode += chars[Math.floor(Math.random() * chars.length)];
      const doctor = await createDoctor({
        email: email.toLowerCase(),
        password: hashedPw,
        nameEn,
        nameAr: nameAr || null,
        phone: phone || null,
        specialization: specialization || "General",
        licenseNumber: licenseNumber || null,
        licenseType: licenseType || null
      });
      await updateDoctor(doctor.id, { clinicCode });
      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1e3);
      await createEmailVerification({
        userId: doctor.id,
        userType: "doctor",
        email: email.toLowerCase(),
        codeHash,
        codeExpiresAt
      });
      await createUserAgreement({ userId: doctor.id, userType: "doctor" });
      console.log(`[DEV] Verification code for ${email}: ${code}`);
      sendVerificationEmail(email.toLowerCase(), code);
      res.status(201).json({
        success: true,
        email: email.toLowerCase(),
        message: "Registration successful, verify your email",
        verification_required: true
      });
    } catch (error) {
      console.error("Doctor register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/doctors/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const doctor = await getDoctorByEmail(email.toLowerCase());
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
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1e3);
        await deleteUnverifiedCodes(email.toLowerCase());
        await createEmailVerification({
          userId: doctor.id,
          userType: "doctor",
          email: email.toLowerCase(),
          codeHash,
          codeExpiresAt
        });
        console.log(`[DEV] Verification code for ${email}: ${code}`);
        sendVerificationEmail(email.toLowerCase(), code);
        return res.status(403).json({
          message: "Email not verified",
          verification_required: true,
          email: email.toLowerCase()
        });
      }
      const token = generateToken({ id: doctor.id, type: "doctor" });
      const { password: _, ...doctorData } = doctor;
      res.json({ token, doctor: doctorData });
    } catch (error) {
      console.error("Doctor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/doctors/me", authMiddleware, async (req, res) => {
    try {
      const doctor = await getDoctorById(req.userId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const { password: _, ...doctorData } = doctor;
      res.json(doctorData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  app2.put("/api/doctors/me", authMiddleware, async (req, res) => {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;
      delete updates.id;
      const doctor = await updateDoctor(req.userId, updates);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const { password: _, ...doctorData } = doctor;
      res.json(doctorData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.put("/api/doctors/clinic-code", authMiddleware, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || code.length < 3) {
        return res.status(400).json({ message: "Code must be at least 3 characters" });
      }
      const existing = await getDoctorByClinicCode(code);
      if (existing && existing.id !== req.userId) {
        return res.status(409).json({ message: "Code already in use" });
      }
      const doctor = await updateDoctor(req.userId, { clinicCode: code.toUpperCase() });
      res.json({ clinicCode: doctor?.clinicCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to update code" });
    }
  });
  app2.post("/api/patients/register", async (req, res) => {
    try {
      const { email, password, fullName, phone } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ message: "Email, password, and full name are required" });
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return res.status(400).json({ message: "Password requirements not met", errors: pwCheck.errors });
      }
      const existing = await getPatientByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashedPw = await hashPassword(password);
      const patient = await createPatient({
        email: email.toLowerCase(),
        password: hashedPw,
        fullName,
        phone: phone || null
      });
      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1e3);
      await createEmailVerification({
        userId: patient.id,
        userType: "patient",
        email: email.toLowerCase(),
        codeHash,
        codeExpiresAt
      });
      await createUserAgreement({ userId: patient.id, userType: "patient" });
      console.log(`[DEV] Verification code for ${email}: ${code}`);
      sendVerificationEmail(email.toLowerCase(), code);
      res.status(201).json({
        success: true,
        email: email.toLowerCase(),
        message: "Registration successful, verify your email",
        verification_required: true
      });
    } catch (error) {
      console.error("Patient register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/patients/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const patient = await getPatientByEmail(email.toLowerCase());
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
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1e3);
        await deleteUnverifiedCodes(email.toLowerCase());
        await createEmailVerification({
          userId: patient.id,
          userType: "patient",
          email: email.toLowerCase(),
          codeHash,
          codeExpiresAt
        });
        console.log(`[DEV] Verification code for ${email}: ${code}`);
        sendVerificationEmail(email.toLowerCase(), code);
        return res.status(403).json({
          message: "Email not verified",
          verification_required: true,
          email: email.toLowerCase()
        });
      }
      const token = generateToken({ id: patient.id, type: "patient" });
      const { password: _, ...patientData } = patient;
      res.json({ token, patient: patientData });
    } catch (error) {
      console.error("Patient login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/patients/me", authMiddleware, async (req, res) => {
    try {
      const patient = await getPatientById(req.userId);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      const { password: _, ...patientData } = patient;
      res.json(patientData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  app2.put("/api/patients/me", authMiddleware, async (req, res) => {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;
      delete updates.id;
      const patient = await updatePatient(req.userId, updates);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      const { password: _, ...patientData } = patient;
      res.json(patientData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }
      const normalizedEmail = email.toLowerCase().trim();
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ message: "Invalid code format" });
      }
      const verification = await getLatestVerification(normalizedEmail);
      if (!verification) {
        return res.status(400).json({ message: "Code expired or not found" });
      }
      const codeValid = await comparePasswords(code, verification.codeHash);
      if (!codeValid) {
        await incrementVerificationAttempts(verification.id);
        const remaining = (verification.maxAttempts || 5) - (verification.attempts || 0) - 1;
        return res.status(400).json({
          message: "Invalid verification code",
          attempts_remaining: Math.max(0, remaining)
        });
      }
      await markEmailVerified(verification.id);
      if (verification.userType === "doctor") {
        await updateDoctorEmailVerified(verification.userId);
        const doctor = await getDoctorById(verification.userId);
        if (!doctor) return res.status(404).json({ message: "User not found" });
        const token = generateToken({ id: doctor.id, type: "doctor" });
        const { password: _, ...doctorData } = doctor;
        return res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: doctorData,
          userType: "doctor"
        });
      } else {
        await updatePatientEmailVerified(verification.userId);
        const patient = await getPatientById(verification.userId);
        if (!patient) return res.status(404).json({ message: "User not found" });
        const token = generateToken({ id: patient.id, type: "patient" });
        const { password: _, ...patientData } = patient;
        return res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: patientData,
          userType: "patient"
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });
  app2.post("/api/auth/resend-code", async (req, res) => {
    try {
      const { email, userType } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const normalizedEmail = email.toLowerCase().trim();
      let user;
      let resolvedType = userType;
      if (userType === "doctor") {
        user = await getDoctorByEmail(normalizedEmail);
      } else {
        user = await getPatientByEmail(normalizedEmail);
        resolvedType = "patient";
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      await deleteUnverifiedCodes(normalizedEmail);
      const code = generateVerificationCode();
      const codeHash = await hashPassword(code);
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1e3);
      await createEmailVerification({
        userId: user.id,
        userType: resolvedType,
        email: normalizedEmail,
        codeHash,
        codeExpiresAt
      });
      console.log(`[DEV] Resent verification code for ${email}: ${code}`);
      sendVerificationEmail(normalizedEmail, code);
      res.json({ success: true, message: "Verification code resent" });
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ message: "Failed to resend code" });
    }
  });
  app2.post("/api/chats/join", authMiddleware, async (req, res) => {
    try {
      const { clinicCode } = req.body;
      if (!clinicCode) {
        return res.status(400).json({ message: "Clinic code required" });
      }
      const doctor = await getDoctorByClinicCode(clinicCode);
      if (!doctor) {
        return res.status(404).json({ message: "Invalid clinic code" });
      }
      const blocked = await isPatientBlocked(doctor.id, req.userId);
      if (blocked) {
        return res.status(403).json({ message: "This doctor is not available for chat" });
      }
      const chat = await createChat(doctor.id, req.userId, clinicCode.toUpperCase());
      res.json({ chat, doctorName: doctor.nameEn, doctorSpecialization: doctor.specialization });
    } catch (error) {
      console.error("Join chat error:", error);
      res.status(500).json({ message: "Failed to join chat" });
    }
  });
  app2.get("/api/chats", authMiddleware, async (req, res) => {
    try {
      const userType = req.userType;
      const userId = req.userId;
      let chatList;
      if (userType === "doctor") {
        chatList = await getChatsByDoctorId(userId);
        const enrichedChats = [];
        for (const chat of chatList) {
          const lastMsg = await getLastMessage(chat.id);
          const notes = await getDoctorNotes(userId, chat.patientId);
          enrichedChats.push({
            ...chat,
            lastMessage: lastMsg?.text || "",
            lastMessageAt: lastMsg?.createdAt || chat.createdAt,
            hasNotes: !!notes?.notes
          });
        }
        res.json(enrichedChats);
      } else {
        chatList = await getChatsByPatientId(userId);
        const enrichedChats = [];
        for (const chat of chatList) {
          const lastMsg = await getLastMessage(chat.id);
          enrichedChats.push({
            ...chat,
            lastMessage: lastMsg?.text || "",
            lastMessageAt: lastMsg?.createdAt || chat.createdAt
          });
        }
        res.json(enrichedChats);
      }
    } catch (error) {
      console.error("Get chats error:", error);
      res.status(500).json({ message: "Failed to get chats" });
    }
  });
  app2.get("/api/chats/:chatId/messages", authMiddleware, async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await getChatById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      const userId = req.userId;
      if (chat.doctorId !== userId && chat.patientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const messageList = await getMessagesByChatId(chatId);
      await markMessagesAsRead(chatId, req.userType);
      res.json(messageList);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  app2.post("/api/chats/:chatId/messages", authMiddleware, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { text: text2, messageType } = req.body;
      const chat = await getChatById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      const userId = req.userId;
      const userType = req.userType;
      if (chat.doctorId !== userId && chat.patientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (userType === "patient") {
        const blocked = await isPatientBlocked(chat.doctorId, userId);
        if (blocked) {
          return res.status(403).json({ message: "You are blocked from this chat" });
        }
      }
      const message = await createMessage({
        chatId,
        senderId: userId,
        senderType: userType,
        text: text2 || "",
        messageType: messageType || "text"
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/doctors/notes/:patientId", authMiddleware, async (req, res) => {
    try {
      const note = await getDoctorNotes(req.userId, req.params.patientId);
      res.json(note || { notes: "" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get notes" });
    }
  });
  app2.put("/api/doctors/notes/:patientId", authMiddleware, async (req, res) => {
    try {
      const { notes } = req.body;
      const note = await saveDoctorNotes(req.userId, req.params.patientId, notes);
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to save notes" });
    }
  });
  app2.post("/api/doctors/block/:patientId", authMiddleware, async (req, res) => {
    try {
      await blockPatient(req.userId, req.params.patientId);
      res.json({ message: "Patient blocked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to block patient" });
    }
  });
  app2.post("/api/doctors/unblock/:patientId", authMiddleware, async (req, res) => {
    try {
      await unblockPatient(req.userId, req.params.patientId);
      res.json({ message: "Patient unblocked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unblock patient" });
    }
  });
  app2.get("/api/doctors/blocked", authMiddleware, async (req, res) => {
    try {
      const doctor = await getDoctorById(req.userId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      const blockedIds = doctor.blockedPatients || [];
      const blockedList = [];
      for (const id of blockedIds) {
        const patient = await getPatientById(id);
        if (patient) {
          blockedList.push({ id: patient.id, fullName: patient.fullName, email: patient.email });
        }
      }
      res.json(blockedList);
    } catch (error) {
      res.status(500).json({ message: "Failed to get blocked patients" });
    }
  });
  app2.get("/api/doctors/profile/:doctorId", async (req, res) => {
    try {
      const doctor = await getDoctorById(req.params.doctorId);
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
        verified: doctor.verified
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get doctor profile" });
    }
  });
  app2.post("/api/upload/profile-picture", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file provided" });
      const fileUrl = `/uploads/${file.filename}`;
      const userType = req.userType;
      if (userType === "doctor") {
        await updateDoctor(req.userId, { profilePictureUrl: fileUrl });
      }
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload picture" });
    }
  });
  const httpServer = (0, import_node_http.createServer)(app2);
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    socket.userId = payload.id;
    socket.userType = payload.type;
    next();
  });
  io.on("connection", (socket) => {
    const userId = socket.userId;
    const userType = socket.userType;
    console.log(`Socket connected: ${userType} ${userId}`);
    socket.join(`user:${userId}`);
    socket.on("join_chat", (chatId) => {
      socket.join(`chat:${chatId}`);
    });
    socket.on("leave_chat", (chatId) => {
      socket.leave(`chat:${chatId}`);
    });
    socket.on("send_message", async (data) => {
      try {
        const chat = await getChatById(data.chatId);
        if (!chat) return;
        if (chat.doctorId !== userId && chat.patientId !== userId) return;
        if (userType === "patient") {
          const blocked = await isPatientBlocked(chat.doctorId, userId);
          if (blocked) {
            socket.emit("error_message", { message: "You are blocked from this chat" });
            return;
          }
        }
        const message = await createMessage({
          chatId: data.chatId,
          senderId: userId,
          senderType: userType,
          text: data.text,
          messageType: data.messageType || "text"
        });
        io.to(`chat:${data.chatId}`).emit("new_message", message);
        const otherUserId = chat.doctorId === userId ? chat.patientId : chat.doctorId;
        io.to(`user:${otherUserId}`).emit("chat_update", {
          chatId: data.chatId,
          lastMessage: data.text,
          lastMessageAt: message.createdAt
        });
      } catch (error) {
        console.error("Send message error:", error);
      }
    });
    socket.on("mark_read", async (chatId) => {
      try {
        await markMessagesAsRead(chatId, userType);
        const chat = await getChatById(chatId);
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
  return httpServer;
}

// server/index.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var app = (0, import_express.default)();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    import_express.default.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(import_express.default.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", import_express.default.static(path2.resolve(process.cwd(), "assets")));
  app2.use(import_express.default.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
