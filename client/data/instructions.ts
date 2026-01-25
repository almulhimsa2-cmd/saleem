export interface Instruction {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  specialty: string;
  source: string;
  completed: boolean;
}

export const sampleInstructions: Instruction[] = [
  {
    id: "1",
    title: "Take medications with food",
    titleAr: "تناول الأدوية مع الطعام",
    description: "To reduce stomach upset, take your prescribed medications with a meal or snack. This helps your body absorb the medication more effectively.",
    descriptionAr: "لتقليل اضطراب المعدة، تناول الأدوية الموصوفة مع وجبة أو وجبة خفيفة. هذا يساعد جسمك على امتصاص الدواء بشكل أكثر فعالية.",
    specialty: "general",
    source: "NHS UK",
    completed: false,
  },
  {
    id: "2",
    title: "Stay hydrated",
    titleAr: "حافظ على الترطيب",
    description: "Drink at least 8 glasses of water throughout the day. Proper hydration supports recovery and helps your body function optimally.",
    descriptionAr: "اشرب ما لا يقل عن 8 أكواب من الماء طوال اليوم. الترطيب الصحيح يدعم التعافي ويساعد جسمك على العمل بشكل مثالي.",
    specialty: "general",
    source: "MedlinePlus",
    completed: false,
  },
  {
    id: "3",
    title: "Monitor blood pressure",
    titleAr: "راقب ضغط الدم",
    description: "Check and record your blood pressure twice daily - once in the morning and once in the evening. Keep a log to share with your doctor.",
    descriptionAr: "افحص وسجل ضغط دمك مرتين يومياً - مرة في الصباح ومرة في المساء. احتفظ بسجل لمشاركته مع طبيبك.",
    specialty: "cardiology",
    source: "NHS UK",
    completed: false,
  },
  {
    id: "4",
    title: "Gentle walking exercise",
    titleAr: "تمارين المشي الخفيف",
    description: "Take a 15-minute gentle walk today. Walking improves circulation and promotes healing. Stop if you feel any discomfort.",
    descriptionAr: "امشِ لمدة 15 دقيقة اليوم بشكل خفيف. المشي يحسن الدورة الدموية ويعزز الشفاء. توقف إذا شعرت بأي إزعاج.",
    specialty: "general",
    source: "MedlinePlus",
    completed: false,
  },
  {
    id: "5",
    title: "Nasal irrigation",
    titleAr: "غسل الأنف",
    description: "Perform nasal irrigation using saline solution. Tilt your head to one side, pour the solution into the upper nostril, and let it drain from the lower nostril.",
    descriptionAr: "قم بغسل الأنف باستخدام محلول ملحي. أمل رأسك إلى جانب واحد، صب المحلول في الفتحة العلوية، واتركه يتصرف من الفتحة السفلية.",
    specialty: "ENT",
    source: "NHS UK",
    completed: false,
  },
];

export const getInstructionsForSpecialty = (specialty: string): Instruction[] => {
  return sampleInstructions.filter(
    (i) => i.specialty === "general" || i.specialty === specialty
  );
};
