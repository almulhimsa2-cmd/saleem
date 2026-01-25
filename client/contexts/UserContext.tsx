import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medication {
  id: string;
  name: string;
  type: "pills" | "spray" | "inhaler" | "injection" | "drops" | "cream";
  dosage?: string;
}

export interface HealthBadge {
  id: string;
  name: string;
  nameAr: string;
  organ: string;
  icon: string;
}

export interface MedicalFile {
  id: string;
  name: string;
  type: "lab" | "radiology";
  date: string;
  locked: boolean;
  uri?: string;
}

export interface Symptom {
  id: string;
  organ: string;
  severity: number;
  description: string;
  date: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "patient" | "doctor";
  timestamp: string;
  isVoice?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  height: number;
  weight: number;
  clinicCode?: string;
  onboardingComplete: boolean;
  pdplConsent: boolean;
  medications: Medication[];
  badges: HealthBadge[];
  files: MedicalFile[];
  symptoms: Symptom[];
  messages: Message[];
  streakDays: number;
  lastActiveDate: string;
  instructionsReviewed: boolean;
}

const defaultProfile: UserProfile = {
  id: "",
  name: "",
  height: 170,
  weight: 70,
  onboardingComplete: false,
  pdplConsent: false,
  medications: [],
  badges: [],
  files: [],
  symptoms: [],
  messages: [],
  streakDays: 0,
  lastActiveDate: "",
  instructionsReviewed: false,
};

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  addMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
  addBadge: (badge: HealthBadge) => void;
  removeBadge: (id: string) => void;
  addFile: (file: MedicalFile) => void;
  removeFile: (id: string) => void;
  toggleFileLock: (id: string) => void;
  addSymptom: (symptom: Symptom) => void;
  addMessage: (message: Message) => void;
  markInstructionsReviewed: () => void;
  deleteAllData: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_KEY = "@saleem_user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && user.id) {
      saveUser();
    }
  }, [user, isLoading]);

  const loadUser = async () => {
    try {
      const saved = await AsyncStorage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({ ...defaultProfile, ...parsed });
      } else {
        setUser({ ...defaultProfile, id: generateId() });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser({ ...defaultProfile, id: generateId() });
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async () => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addMedication = (medication: Medication) => {
    setUser((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...medication, id: generateId() }],
    }));
  };

  const removeMedication = (id: string) => {
    setUser((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }));
  };

  const addBadge = (badge: HealthBadge) => {
    const exists = user.badges.find((b) => b.name === badge.name);
    if (!exists) {
      setUser((prev) => ({
        ...prev,
        badges: [...prev.badges, { ...badge, id: generateId() }],
      }));
    }
  };

  const removeBadge = (id: string) => {
    setUser((prev) => ({
      ...prev,
      badges: prev.badges.filter((b) => b.id !== id),
    }));
  };

  const addFile = (file: MedicalFile) => {
    setUser((prev) => ({
      ...prev,
      files: [...prev.files, { ...file, id: generateId() }],
    }));
  };

  const removeFile = (id: string) => {
    setUser((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }));
  };

  const toggleFileLock = (id: string) => {
    setUser((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        f.id === id ? { ...f, locked: !f.locked } : f
      ),
    }));
  };

  const addSymptom = (symptom: Symptom) => {
    setUser((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, { ...symptom, id: generateId() }],
    }));
  };

  const addMessage = (message: Message) => {
    setUser((prev) => ({
      ...prev,
      messages: [...prev.messages, { ...message, id: generateId() }],
    }));
  };

  const markInstructionsReviewed = () => {
    const today = new Date().toISOString().split("T")[0];
    setUser((prev) => {
      let newStreak = prev.streakDays;
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (prev.lastActiveDate === yesterdayStr) {
          newStreak = prev.streakDays + 1;
        } else {
          newStreak = 1;
        }
      }
      return {
        ...prev,
        instructionsReviewed: true,
        streakDays: newStreak,
        lastActiveDate: today,
      };
    });
  };

  const deleteAllData = async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      setUser({ ...defaultProfile, id: generateId() });
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        addMedication,
        removeMedication,
        addBadge,
        removeBadge,
        addFile,
        removeFile,
        toggleFileLock,
        addSymptom,
        addMessage,
        markInstructionsReviewed,
        deleteAllData,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
