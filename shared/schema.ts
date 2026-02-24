import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  phone: text("phone"),
  specialization: text("specialization").default("General"),
  licenseNumber: text("license_number"),
  licenseType: text("license_type"),
  licenseFileUrl: text("license_file_url"),
  licenseExpiry: text("license_expiry"),
  verified: boolean("verified").default(false),
  verificationStatus: text("verification_status").default("pending"),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  bio: text("bio"),
  profilePictureUrl: text("profile_picture_url"),
  youtubeLink: text("youtube_link"),
  websiteLink: text("website_link"),
  linkedinLink: text("linkedin_link"),
  clinicCode: text("clinic_code").unique(),
  blockedPatients: jsonb("blocked_patients").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  pdplConsent: boolean("pdpl_consent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicCode: text("clinic_code").notNull(),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: text("sender_type").notNull(),
  text: text("text"),
  messageType: text("message_type").default("text"),
  voiceUrl: text("voice_url"),
  voiceDuration: integer("voice_duration"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorNotes = pgTable("doctor_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userType: text("user_type").notNull(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  codeExpiresAt: timestamp("code_expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAgreements = pgTable("user_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userType: text("user_type").notNull(),
  agreedToTerms: boolean("agreed_to_terms").default(false),
  termsAgreedAt: timestamp("terms_agreed_at"),
  termsVersion: text("terms_version").default("1.0"),
  agreedToPrivacy: boolean("agreed_to_privacy").default(false),
  privacyAgreedAt: timestamp("privacy_agreed_at"),
  privacyVersion: text("privacy_version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  email: true,
  password: true,
  nameEn: true,
  nameAr: true,
  phone: true,
  specialization: true,
  licenseNumber: true,
  licenseType: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  email: true,
  password: true,
  fullName: true,
  phone: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  senderId: true,
  senderType: true,
  text: true,
  messageType: true,
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type DoctorNote = typeof doctorNotes.$inferSelect;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type UserAgreement = typeof userAgreements.$inferSelect;
