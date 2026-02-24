import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  doctors, patients, chats, messages, doctorNotes, emailVerifications, userAgreements,
  type Doctor, type InsertDoctor,
  type Patient, type InsertPatient,
  type Chat, type Message, type InsertMessage,
  type DoctorNote, type EmailVerification, type UserAgreement,
} from "../shared/schema";

export async function createDoctor(data: InsertDoctor & { password: string }): Promise<Doctor> {
  const [doctor] = await db.insert(doctors).values(data).returning();
  return doctor;
}

export async function getDoctorByEmail(email: string): Promise<Doctor | undefined> {
  const [doctor] = await db.select().from(doctors).where(eq(doctors.email, email.toLowerCase()));
  return doctor;
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
  return doctor;
}

export async function getDoctorByClinicCode(code: string): Promise<Doctor | undefined> {
  const [doctor] = await db.select().from(doctors).where(eq(doctors.clinicCode, code.toUpperCase()));
  return doctor;
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor | undefined> {
  const [doctor] = await db.update(doctors).set({ ...data, updatedAt: new Date() }).where(eq(doctors.id, id)).returning();
  return doctor;
}

export async function createPatient(data: InsertPatient & { password: string }): Promise<Patient> {
  const [patient] = await db.insert(patients).values(data).returning();
  return patient;
}

export async function getPatientByEmail(email: string): Promise<Patient | undefined> {
  const [patient] = await db.select().from(patients).where(eq(patients.email, email.toLowerCase()));
  return patient;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const [patient] = await db.select().from(patients).where(eq(patients.id, id));
  return patient;
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient | undefined> {
  const [patient] = await db.update(patients).set({ ...data, updatedAt: new Date() }).where(eq(patients.id, id)).returning();
  return patient;
}

export async function createChat(doctorId: string, patientId: string, clinicCode: string): Promise<Chat> {
  const existing = await db.select().from(chats).where(
    and(eq(chats.doctorId, doctorId), eq(chats.patientId, patientId), eq(chats.active, true))
  );
  if (existing.length > 0) return existing[0];
  
  const [chat] = await db.insert(chats).values({ doctorId, patientId, clinicCode }).returning();
  return chat;
}

export async function getChatsByDoctorId(doctorId: string): Promise<(Chat & { patientName: string; unreadCount: number })[]> {
  const chatList = await db.select().from(chats).where(
    and(eq(chats.doctorId, doctorId), eq(chats.active, true))
  ).orderBy(desc(chats.lastMessageAt));

  const result = [];
  for (const chat of chatList) {
    const patient = await getPatientById(chat.patientId);
    const unreadMessages = await db.select({ count: sql<number>`count(*)` }).from(messages).where(
      and(eq(messages.chatId, chat.id), eq(messages.senderType, "patient"), eq(messages.read, false))
    );
    result.push({
      ...chat,
      patientName: patient?.fullName || "Unknown",
      unreadCount: Number(unreadMessages[0]?.count || 0),
    });
  }
  return result;
}

export async function getChatsByPatientId(patientId: string): Promise<(Chat & { doctorName: string; unreadCount: number })[]> {
  const chatList = await db.select().from(chats).where(
    and(eq(chats.patientId, patientId), eq(chats.active, true))
  ).orderBy(desc(chats.lastMessageAt));

  const result = [];
  for (const chat of chatList) {
    const doctor = await getDoctorById(chat.doctorId);
    const unreadMessages = await db.select({ count: sql<number>`count(*)` }).from(messages).where(
      and(eq(messages.chatId, chat.id), eq(messages.senderType, "doctor"), eq(messages.read, false))
    );
    result.push({
      ...chat,
      doctorName: doctor?.nameEn || "Unknown",
      unreadCount: Number(unreadMessages[0]?.count || 0),
    });
  }
  return result;
}

export async function getChatById(chatId: string): Promise<Chat | undefined> {
  const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
  return chat;
}

export async function createMessage(data: InsertMessage): Promise<Message> {
  const [message] = await db.insert(messages).values(data).returning();
  await db.update(chats).set({ lastMessageAt: new Date() }).where(eq(chats.id, data.chatId));
  return message;
}

export async function getMessagesByChatId(chatId: string, limit = 100): Promise<Message[]> {
  return db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt).limit(limit);
}

export async function markMessagesAsRead(chatId: string, readerType: string): Promise<void> {
  const senderType = readerType === "doctor" ? "patient" : "doctor";
  await db.update(messages).set({ read: true }).where(
    and(eq(messages.chatId, chatId), eq(messages.senderType, senderType), eq(messages.read, false))
  );
}

export async function getLastMessage(chatId: string): Promise<Message | undefined> {
  const [msg] = await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(desc(messages.createdAt)).limit(1);
  return msg;
}

export async function saveDoctorNotes(doctorId: string, patientId: string, notes: string): Promise<DoctorNote> {
  const existing = await db.select().from(doctorNotes).where(
    and(eq(doctorNotes.doctorId, doctorId), eq(doctorNotes.patientId, patientId))
  );
  if (existing.length > 0) {
    const [note] = await db.update(doctorNotes).set({ notes, updatedAt: new Date() }).where(eq(doctorNotes.id, existing[0].id)).returning();
    return note;
  }
  const [note] = await db.insert(doctorNotes).values({ doctorId, patientId, notes }).returning();
  return note;
}

export async function getDoctorNotes(doctorId: string, patientId: string): Promise<DoctorNote | undefined> {
  const [note] = await db.select().from(doctorNotes).where(
    and(eq(doctorNotes.doctorId, doctorId), eq(doctorNotes.patientId, patientId))
  );
  return note;
}

export async function blockPatient(doctorId: string, patientId: string): Promise<void> {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return;
  const blocked = (doctor.blockedPatients as string[]) || [];
  if (!blocked.includes(patientId)) {
    blocked.push(patientId);
    await updateDoctor(doctorId, { blockedPatients: blocked } as any);
  }
}

export async function unblockPatient(doctorId: string, patientId: string): Promise<void> {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return;
  const blocked = ((doctor.blockedPatients as string[]) || []).filter(id => id !== patientId);
  await updateDoctor(doctorId, { blockedPatients: blocked } as any);
}

export async function isPatientBlocked(doctorId: string, patientId: string): Promise<boolean> {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return false;
  return ((doctor.blockedPatients as string[]) || []).includes(patientId);
}

export async function createEmailVerification(data: { userId: string; userType: string; email: string; codeHash: string; codeExpiresAt: Date }): Promise<EmailVerification> {
  const [record] = await db.insert(emailVerifications).values(data).returning();
  return record;
}

export async function getLatestVerification(email: string): Promise<EmailVerification | undefined> {
  const [record] = await db.select().from(emailVerifications).where(
    and(
      eq(emailVerifications.email, email.toLowerCase()),
      sql`${emailVerifications.verifiedAt} IS NULL`,
      sql`${emailVerifications.codeExpiresAt} > NOW()`,
      sql`${emailVerifications.attempts} < ${emailVerifications.maxAttempts}`
    )
  ).orderBy(desc(emailVerifications.createdAt)).limit(1);
  return record;
}

export async function incrementVerificationAttempts(id: string): Promise<void> {
  await db.update(emailVerifications).set({ attempts: sql`${emailVerifications.attempts} + 1` }).where(eq(emailVerifications.id, id));
}

export async function markEmailVerified(id: string): Promise<void> {
  await db.update(emailVerifications).set({ verifiedAt: new Date() }).where(eq(emailVerifications.id, id));
}

export async function deleteUnverifiedCodes(email: string): Promise<void> {
  await db.delete(emailVerifications).where(
    and(eq(emailVerifications.email, email.toLowerCase()), sql`${emailVerifications.verifiedAt} IS NULL`)
  );
}

export async function updatePatientEmailVerified(id: string): Promise<void> {
  await db.update(patients).set({ emailVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(patients.id, id));
}

export async function updateDoctorEmailVerified(id: string): Promise<void> {
  await db.update(doctors).set({ emailVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(doctors.id, id));
}

export async function createUserAgreement(data: { userId: string; userType: string }): Promise<UserAgreement> {
  const now = new Date();
  const [agreement] = await db.insert(userAgreements).values({
    userId: data.userId,
    userType: data.userType,
    agreedToTerms: true,
    termsAgreedAt: now,
    agreedToPrivacy: true,
    privacyAgreedAt: now,
  }).returning();
  return agreement;
}

export async function getUserAgreement(userId: string): Promise<UserAgreement | undefined> {
  const [agreement] = await db.select().from(userAgreements).where(eq(userAgreements.userId, userId));
  return agreement;
}
