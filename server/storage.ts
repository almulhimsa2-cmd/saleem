import { eq, and, desc, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  doctors, patients, chats, messages, doctorNotes, vaultFiles,
  type Doctor, type InsertDoctor,
  type Patient, type InsertPatient,
  type Chat, type Message, type InsertMessage,
  type DoctorNote, type VaultFile,
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

export async function createVaultFile(data: Partial<VaultFile>): Promise<VaultFile> {
  const [file] = await db.insert(vaultFiles).values(data as any).returning();
  return file;
}

export async function getVaultFiles(patientId: string, type?: string): Promise<VaultFile[]> {
  if (type) {
    return db.select().from(vaultFiles).where(
      and(eq(vaultFiles.patientId, patientId), eq(vaultFiles.type, type))
    ).orderBy(desc(vaultFiles.uploadedAt));
  }
  return db.select().from(vaultFiles).where(eq(vaultFiles.patientId, patientId)).orderBy(desc(vaultFiles.uploadedAt));
}

export async function deleteVaultFile(id: string, patientId: string): Promise<boolean> {
  const result = await db.delete(vaultFiles).where(
    and(eq(vaultFiles.id, id), eq(vaultFiles.patientId, patientId))
  );
  return true;
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
