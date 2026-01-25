export interface HealthCondition {
  id: string;
  name: string;
  nameAr: string;
  organ: string;
  icon: string;
  category: string;
}

export const healthConditions: HealthCondition[] = [
  { id: "1", name: "Type 1 Diabetes", nameAr: "السكري النوع الأول", organ: "pancreas", icon: "droplet", category: "Endocrine" },
  { id: "2", name: "Type 2 Diabetes", nameAr: "السكري النوع الثاني", organ: "pancreas", icon: "droplet", category: "Endocrine" },
  { id: "3", name: "Hypertension", nameAr: "ارتفاع ضغط الدم", organ: "heart", icon: "activity", category: "Cardiovascular" },
  { id: "4", name: "Heart Disease", nameAr: "أمراض القلب", organ: "heart", icon: "heart", category: "Cardiovascular" },
  { id: "5", name: "Coronary Artery Disease", nameAr: "مرض الشريان التاجي", organ: "heart", icon: "heart", category: "Cardiovascular" },
  { id: "6", name: "Asthma", nameAr: "الربو", organ: "lungs", icon: "wind", category: "Respiratory" },
  { id: "7", name: "COPD", nameAr: "مرض الانسداد الرئوي", organ: "lungs", icon: "wind", category: "Respiratory" },
  { id: "8", name: "Chronic Bronchitis", nameAr: "التهاب الشعب الهوائية المزمن", organ: "lungs", icon: "wind", category: "Respiratory" },
  { id: "9", name: "Arthritis", nameAr: "التهاب المفاصل", organ: "joints", icon: "move", category: "Musculoskeletal" },
  { id: "10", name: "Osteoporosis", nameAr: "هشاشة العظام", organ: "bones", icon: "activity", category: "Musculoskeletal" },
  { id: "11", name: "Hypothyroidism", nameAr: "قصور الغدة الدرقية", organ: "thyroid", icon: "thermometer", category: "Endocrine" },
  { id: "12", name: "Hyperthyroidism", nameAr: "فرط نشاط الغدة الدرقية", organ: "thyroid", icon: "thermometer", category: "Endocrine" },
  { id: "13", name: "High Cholesterol", nameAr: "ارتفاع الكوليسترول", organ: "blood", icon: "droplet", category: "Metabolic" },
  { id: "14", name: "Anemia", nameAr: "فقر الدم", organ: "blood", icon: "droplet", category: "Blood" },
  { id: "15", name: "Allergies", nameAr: "الحساسية", organ: "immune", icon: "alert-circle", category: "Immune" },
  { id: "16", name: "Chronic Kidney Disease", nameAr: "مرض الكلى المزمن", organ: "kidneys", icon: "filter", category: "Renal" },
  { id: "17", name: "Liver Disease", nameAr: "أمراض الكبد", organ: "liver", icon: "activity", category: "Hepatic" },
  { id: "18", name: "GERD", nameAr: "ارتجاع المريء", organ: "stomach", icon: "coffee", category: "Digestive" },
  { id: "19", name: "IBS", nameAr: "متلازمة القولون العصبي", organ: "intestines", icon: "activity", category: "Digestive" },
  { id: "20", name: "Migraine", nameAr: "الصداع النصفي", organ: "brain", icon: "zap", category: "Neurological" },
  { id: "21", name: "Epilepsy", nameAr: "الصرع", organ: "brain", icon: "zap", category: "Neurological" },
  { id: "22", name: "Depression", nameAr: "الاكتئاب", organ: "brain", icon: "cloud", category: "Mental Health" },
  { id: "23", name: "Anxiety Disorder", nameAr: "اضطراب القلق", organ: "brain", icon: "alert-triangle", category: "Mental Health" },
  { id: "24", name: "Sleep Apnea", nameAr: "توقف التنفس أثناء النوم", organ: "lungs", icon: "moon", category: "Sleep" },
  { id: "25", name: "Glaucoma", nameAr: "الجلوكوما", organ: "eyes", icon: "eye", category: "Ophthalmology" },
  { id: "26", name: "Cataracts", nameAr: "إعتام عدسة العين", organ: "eyes", icon: "eye", category: "Ophthalmology" },
  { id: "27", name: "Hearing Loss", nameAr: "فقدان السمع", organ: "ears", icon: "volume-x", category: "ENT" },
  { id: "28", name: "Sinusitis", nameAr: "التهاب الجيوب الأنفية", organ: "nose", icon: "wind", category: "ENT" },
  { id: "29", name: "Eczema", nameAr: "الإكزيما", organ: "skin", icon: "layers", category: "Dermatology" },
  { id: "30", name: "Psoriasis", nameAr: "الصدفية", organ: "skin", icon: "layers", category: "Dermatology" },
  { id: "31", name: "Atrial Fibrillation", nameAr: "الرجفان الأذيني", organ: "heart", icon: "heart", category: "Cardiovascular" },
  { id: "32", name: "Heart Failure", nameAr: "فشل القلب", organ: "heart", icon: "heart", category: "Cardiovascular" },
  { id: "33", name: "Pneumonia", nameAr: "الالتهاب الرئوي", organ: "lungs", icon: "wind", category: "Respiratory" },
  { id: "34", name: "Tuberculosis", nameAr: "السل", organ: "lungs", icon: "wind", category: "Respiratory" },
  { id: "35", name: "Rheumatoid Arthritis", nameAr: "التهاب المفاصل الروماتويدي", organ: "joints", icon: "move", category: "Musculoskeletal" },
  { id: "36", name: "Fibromyalgia", nameAr: "الألم العضلي الليفي", organ: "muscles", icon: "activity", category: "Musculoskeletal" },
  { id: "37", name: "Parkinson's Disease", nameAr: "مرض باركنسون", organ: "brain", icon: "zap", category: "Neurological" },
  { id: "38", name: "Multiple Sclerosis", nameAr: "التصلب المتعدد", organ: "brain", icon: "zap", category: "Neurological" },
  { id: "39", name: "Celiac Disease", nameAr: "مرض السيلياك", organ: "intestines", icon: "activity", category: "Digestive" },
  { id: "40", name: "Crohn's Disease", nameAr: "مرض كرون", organ: "intestines", icon: "activity", category: "Digestive" },
];

export const searchConditions = (query: string): HealthCondition[] => {
  const lowerQuery = query.toLowerCase();
  return healthConditions.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.nameAr.includes(query) ||
      c.category.toLowerCase().includes(lowerQuery)
  );
};
