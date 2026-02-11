import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

export type UserType = "doctor" | "patient";

export interface AuthUser {
  id: string;
  type: UserType;
  token: string;
  email: string;
  nameEn?: string;
  nameAr?: string;
  fullName?: string;
  specialization?: string;
  clinicCode?: string;
  verified?: boolean;
  licenseNumber?: string;
  phone?: string;
  bio?: string;
  profilePictureUrl?: string;
  youtubeLink?: string;
  websiteLink?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (type: UserType, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerDoctor: (data: DoctorRegisterData) => Promise<{ success: boolean; error?: string; errors?: string[] }>;
  registerPatient: (data: PatientRegisterData) => Promise<{ success: boolean; error?: string; errors?: string[] }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
}

export interface DoctorRegisterData {
  email: string;
  password: string;
  nameEn: string;
  nameAr?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  licenseType?: string;
}

export interface PatientRegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = "@saleem_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const saved = await AsyncStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuthUser;
        setUser(parsed);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = async (authUser: AuthUser) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } catch (error) {
      console.error("Error saving auth:", error);
    }
  };

  const login = async (type: UserType, email: string, password: string) => {
    try {
      const baseUrl = getApiUrl();
      const endpoint = type === "doctor" ? "/api/doctors/login" : "/api/patients/login";
      const res = await fetch(new URL(endpoint, baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" };
      }
      const profile = type === "doctor" ? data.doctor : data.patient;
      const authUser: AuthUser = {
        id: profile.id,
        type,
        token: data.token,
        email: profile.email,
        nameEn: profile.nameEn,
        nameAr: profile.nameAr,
        fullName: profile.fullName,
        specialization: profile.specialization,
        clinicCode: profile.clinicCode,
        verified: profile.verified,
        licenseNumber: profile.licenseNumber,
        phone: profile.phone,
        bio: profile.bio,
        profilePictureUrl: profile.profilePictureUrl,
        youtubeLink: profile.youtubeLink,
        websiteLink: profile.websiteLink,
      };
      await saveAuth(authUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const registerDoctor = async (regData: DoctorRegisterData) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/doctors/register", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message, errors: data.errors };
      }
      const authUser: AuthUser = {
        id: data.doctor.id,
        type: "doctor",
        token: data.token,
        email: data.doctor.email,
        nameEn: data.doctor.nameEn,
        nameAr: data.doctor.nameAr,
        specialization: data.doctor.specialization,
        clinicCode: data.doctor.clinicCode,
        verified: data.doctor.verified,
        licenseNumber: data.doctor.licenseNumber,
        phone: data.doctor.phone,
      };
      await saveAuth(authUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const registerPatient = async (regData: PatientRegisterData) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/patients/register", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message, errors: data.errors };
      }
      const authUser: AuthUser = {
        id: data.patient.id,
        type: "patient",
        token: data.token,
        email: data.patient.email,
        fullName: data.patient.fullName,
        phone: data.patient.phone,
      };
      await saveAuth(authUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const baseUrl = getApiUrl();
      const endpoint = user.type === "doctor" ? "/api/doctors/me" : "/api/patients/me";
      const res = await fetch(new URL(endpoint, baseUrl).href, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        const updated = { ...user, ...profile };
        await saveAuth(updated);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const updateProfile = async (data: Record<string, any>) => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      const baseUrl = getApiUrl();
      const endpoint = user.type === "doctor" ? "/api/doctors/me" : "/api/patients/me";
      const res = await fetch(new URL(endpoint, baseUrl).href, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.message };
      }
      const updated = { ...user, ...result };
      await saveAuth(updated);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Connection error" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerDoctor, registerPatient, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
