# Saleem (سليم) - Gamified Patient-Doctor Portal

## Overview
Saleem is a multi-specialty, gamified patient-doctor portal mobile app that transforms medical history and post-op care into an interactive "Quest" experience. Built with Expo React Native and Express.js backend.

## Project State
- **Current Phase**: MVP Complete
- **Last Updated**: January 2026

## Key Features
1. **Gamified Onboarding**
   - Bilingual support (Arabic/English) with RTL layout
   - PDPL consent screen (Saudi data protection compliance)
   - Avatar creation with height/weight customization
   - Medicine Cabinet for tracking medications
   - Health Badges for chronic conditions

2. **Quest Dashboard (Home)**
   - Interactive avatar with health badges
   - Daily instructions from NHS/MedlinePlus sources
   - Progress streak tracking
   - Gamified completion system

3. **Medical Vault**
   - Secure file storage (Lab PDFs, Radiology images)
   - Lock/unlock privacy controls
   - PDPL-compliant UUID file renaming

4. **Communication Hub**
   - Body Map symptom logger
   - Secure messaging (unlocks after instruction review)
   - Severity tracking system

## Tech Stack
- **Frontend**: Expo React Native (Expo Go compatible)
- **Backend**: Express.js
- **Storage**: AsyncStorage (local persistence)
- **Fonts**: Cairo (Google Fonts) for Arabic/English
- **Navigation**: React Navigation 7+

## Color Scheme
- Primary: Medical Navy #003366
- Accent: Healing Emerald #50C878
- Background: #F8F9FA
- Error: #DC3545

## File Structure
```
client/
├── App.tsx                    # Main app with font loading
├── components/
│   ├── Avatar.tsx             # Dynamic health avatar
│   ├── BodyMap.tsx            # Symptom body map
│   ├── Button.tsx             # Themed button
│   ├── Card.tsx               # Card component
│   ├── Disclaimer.tsx         # Medical disclaimer
│   ├── HealthBadge.tsx        # Health condition badges
│   ├── InstructionCard.tsx    # Daily instruction cards
│   ├── MedicationIcon.tsx     # Medication type icons
│   └── ProgressStreak.tsx     # Streak tracker
├── contexts/
│   ├── LanguageContext.tsx    # Bilingual support
│   └── UserContext.tsx        # User state management
├── data/
│   ├── healthConditions.ts    # 40+ health conditions
│   └── instructions.ts        # Sample instructions
├── navigation/
│   ├── OnboardingNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── RootStackNavigator.tsx
└── screens/
    ├── WelcomeScreen.tsx
    ├── PDPLConsentScreen.tsx
    ├── AvatarSetupScreen.tsx
    ├── MedicineCabinetScreen.tsx
    ├── HealthBadgesScreen.tsx
    ├── HomeScreen.tsx
    ├── VaultScreen.tsx
    ├── MessagesScreen.tsx
    └── SettingsScreen.tsx
```

## Running the App
- Frontend: `npm run expo:dev` (port 8081)
- Backend: `npm run server:dev` (port 5000)
- Scan QR code with Expo Go to test on device

## User Preferences
- Arabic is the primary language (RTL support)
- Medical-professional aesthetic
- Gamified but not childish
- PDPL compliance required

## Design Guidelines
See `design_guidelines.md` for complete design specifications.
