import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

type Language = "en" | "ar";

interface Translations {
  [key: string]: string;
}

const enTranslations: Translations = {
  appName: "Saleem",
  welcome: "Welcome to Saleem",
  welcomeSubtitle: "Secure Professional Messaging",
  getStarted: "Get Started",
  selectLanguage: "Select your language",
  arabic: "العربية",
  english: "English",
  next: "Next",
  skip: "Skip",
  done: "Done",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  confirm: "Confirm",
  
  pdplTitle: "Data Privacy Consent",
  pdplSubtitle: "Your privacy matters to us",
  pdplDescription: "In accordance with Saudi Arabia's Personal Data Protection Law (PDPL), we need your explicit consent to collect and process your personal data. This data will be used solely for:",
  pdplPoint1: "Storing your account information securely",
  pdplPoint2: "Enabling communication with your professional contacts",
  pdplPoint3: "Providing a secure messaging experience",
  pdplPoint4: "Improving our professional services",
  pdplConsent: "I have read and agree to the data processing terms in accordance with Saudi PDPL",
  iAccept: "I Accept",
  
  home: "Home",
  messages: "Messages",
  profile: "Profile",
  settings: "Settings",
  
  typeMessage: "Type a message...",
  
  clinicCode: "Access Code",
  enterClinicCode: "Enter your access code",
  joinClinic: "Join",
  
  disclaimer: "For follow-up communication only, not emergencies",
  deleteMyData: "Delete My Data",
  deleteConfirmation: "Type DELETE to confirm",
  logout: "Log Out",
  language: "Language",
  notifications: "Notifications",
  privacySecurity: "Privacy & Security",
};

const arTranslations: Translations = {
  appName: "سليم",
  welcome: "مرحباً بك في سليم",
  welcomeSubtitle: "رسائل مهنية آمنة",
  getStarted: "ابدأ الآن",
  selectLanguage: "اختر لغتك",
  arabic: "العربية",
  english: "English",
  next: "التالي",
  skip: "تخطي",
  done: "تم",
  cancel: "إلغاء",
  save: "حفظ",
  delete: "حذف",
  confirm: "تأكيد",
  
  pdplTitle: "موافقة حماية البيانات",
  pdplSubtitle: "خصوصيتك تهمنا",
  pdplDescription: "وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية، نحتاج موافقتك الصريحة لجمع ومعالجة بياناتك الشخصية. سيتم استخدام هذه البيانات فقط من أجل:",
  pdplPoint1: "تخزين معلومات حسابك بشكل آمن",
  pdplPoint2: "تمكين التواصل مع جهات الاتصال المهنية",
  pdplPoint3: "توفير تجربة مراسلة آمنة",
  pdplPoint4: "تحسين خدماتنا المهنية",
  pdplConsent: "لقد قرأت وأوافق على شروط معالجة البيانات وفقاً لنظام حماية البيانات الشخصية السعودي",
  iAccept: "أوافق",
  
  home: "الرئيسية",
  messages: "الرسائل",
  profile: "الملف الشخصي",
  settings: "الإعدادات",
  
  typeMessage: "اكتب رسالة...",
  
  clinicCode: "رمز الدخول",
  enterClinicCode: "أدخل رمز الدخول",
  joinClinic: "انضمام",
  
  disclaimer: "للمتابعة فقط، ليس للطوارئ",
  deleteMyData: "حذف بياناتي",
  deleteConfirmation: "اكتب DELETE للتأكيد",
  logout: "تسجيل الخروج",
  language: "اللغة",
  notifications: "الإشعارات",
  privacySecurity: "الخصوصية والأمان",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "@saleem_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved === "ar" || saved === "en") {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    const translations = language === "ar" ? arTranslations : enTranslations;
    return translations[key] || key;
  };

  const isRTL = language === "ar";

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
