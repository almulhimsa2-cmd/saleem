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
  welcomeSubtitle: "Your Health Journey Begins Here",
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
  pdplDescription: "In accordance with Saudi Arabia's Personal Data Protection Law (PDPL), we need your explicit consent to collect and process your health data. This data will be used solely for:",
  pdplPoint1: "Storing your medical history securely",
  pdplPoint2: "Enabling communication with your healthcare provider",
  pdplPoint3: "Providing personalized health recommendations",
  pdplPoint4: "Improving our healthcare services",
  pdplConsent: "I have read and agree to the data processing terms in accordance with Saudi PDPL",
  iAccept: "I Accept",
  
  createHealthHero: "Create Your Health Hero",
  avatarSetupSubtitle: "Let's personalize your health profile",
  height: "Height",
  weight: "Weight",
  cm: "cm",
  kg: "kg",
  
  medicineCabinet: "Medicine Cabinet",
  medicineCabinetSubtitle: "Add your current medications",
  pills: "Pills",
  spray: "Spray",
  inhaler: "Inhaler",
  injection: "Injection",
  drops: "Drops",
  cream: "Cream",
  addMedication: "Add Medication",
  noMedications: "No medications added yet",
  tapToAdd: "Tap to add your medications",
  
  healthBadges: "Health Badges",
  healthBadgesSubtitle: "Select your health conditions",
  searchConditions: "Search conditions...",
  selectedBadges: "Selected Badges",
  noBadgesSelected: "No badges selected",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
  asthma: "Asthma",
  heartDisease: "Heart Disease",
  arthritis: "Arthritis",
  thyroid: "Thyroid",
  allergies: "Allergies",
  cholesterol: "High Cholesterol",
  
  home: "Home",
  vault: "Vault",
  messages: "Messages",
  profile: "Profile",
  settings: "Settings",
  
  questDashboard: "Quest Dashboard",
  activeQuest: "Active Quest",
  todayInstructions: "Today's Instructions",
  progressStreak: "Progress Streak",
  days: "days",
  
  medicalVault: "Medical Vault",
  uploadFile: "Upload File",
  labResults: "Lab Results",
  radiology: "Radiology",
  noFiles: "No files yet",
  noFilesSubtitle: "Your medical files will appear here",
  locked: "Locked",
  unlocked: "Unlocked",
  
  symptomLogger: "Symptom Logger",
  tapOrgan: "Tap an organ to log a symptom",
  severity: "Severity",
  description: "Description",
  submitSymptom: "Submit Symptom",
  
  chatRoom: "Chat Room",
  reviewInstructions: "Review today's instructions to unlock chat",
  typeMessage: "Type a message...",
  
  clinicCode: "Clinic Code",
  enterClinicCode: "Enter your clinic code",
  joinClinic: "Join Clinic",
  
  disclaimer: "For education only, not emergency care",
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
  welcomeSubtitle: "رحلتك الصحية تبدأ هنا",
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
  pdplDescription: "وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية، نحتاج موافقتك الصريحة لجمع ومعالجة بياناتك الصحية. سيتم استخدام هذه البيانات فقط من أجل:",
  pdplPoint1: "تخزين سجلك الطبي بشكل آمن",
  pdplPoint2: "تمكين التواصل مع مقدم الرعاية الصحية",
  pdplPoint3: "تقديم توصيات صحية مخصصة",
  pdplPoint4: "تحسين خدمات الرعاية الصحية",
  pdplConsent: "لقد قرأت وأوافق على شروط معالجة البيانات وفقاً لنظام حماية البيانات الشخصية السعودي",
  iAccept: "أوافق",
  
  createHealthHero: "أنشئ بطلك الصحي",
  avatarSetupSubtitle: "دعنا نخصص ملفك الصحي",
  height: "الطول",
  weight: "الوزن",
  cm: "سم",
  kg: "كجم",
  
  medicineCabinet: "خزانة الأدوية",
  medicineCabinetSubtitle: "أضف أدويتك الحالية",
  pills: "حبوب",
  spray: "بخاخ",
  inhaler: "جهاز استنشاق",
  injection: "حقنة",
  drops: "قطرات",
  cream: "كريم",
  addMedication: "إضافة دواء",
  noMedications: "لم تتم إضافة أدوية بعد",
  tapToAdd: "اضغط لإضافة أدويتك",
  
  healthBadges: "شارات الصحة",
  healthBadgesSubtitle: "اختر حالاتك الصحية",
  searchConditions: "البحث عن الحالات...",
  selectedBadges: "الشارات المختارة",
  noBadgesSelected: "لم يتم اختيار شارات",
  diabetes: "السكري",
  hypertension: "ارتفاع ضغط الدم",
  asthma: "الربو",
  heartDisease: "أمراض القلب",
  arthritis: "التهاب المفاصل",
  thyroid: "الغدة الدرقية",
  allergies: "الحساسية",
  cholesterol: "ارتفاع الكوليسترول",
  
  home: "الرئيسية",
  vault: "الخزنة",
  messages: "الرسائل",
  profile: "الملف الشخصي",
  settings: "الإعدادات",
  
  questDashboard: "لوحة المهام",
  activeQuest: "المهمة النشطة",
  todayInstructions: "تعليمات اليوم",
  progressStreak: "سلسلة التقدم",
  days: "أيام",
  
  medicalVault: "الخزنة الطبية",
  uploadFile: "رفع ملف",
  labResults: "نتائج المختبر",
  radiology: "الأشعة",
  noFiles: "لا توجد ملفات بعد",
  noFilesSubtitle: "ستظهر ملفاتك الطبية هنا",
  locked: "مقفل",
  unlocked: "مفتوح",
  
  symptomLogger: "سجل الأعراض",
  tapOrgan: "اضغط على عضو لتسجيل عرض",
  severity: "الشدة",
  description: "الوصف",
  submitSymptom: "إرسال العرض",
  
  chatRoom: "غرفة المحادثة",
  reviewInstructions: "راجع تعليمات اليوم لفتح المحادثة",
  typeMessage: "اكتب رسالة...",
  
  clinicCode: "رمز العيادة",
  enterClinicCode: "أدخل رمز العيادة",
  joinClinic: "انضم للعيادة",
  
  disclaimer: "للتثقيف فقط، ليس للطوارئ",
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
