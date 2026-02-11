# Saleem (سليم) - Patient-Doctor Chat Portal

## Overview
Saleem is a bilingual (Arabic/English) HIPAA-compliant patient-doctor chat portal mobile app for Saudi Arabia. Built with Expo React Native frontend and Express.js backend with PostgreSQL database. Features full email+password authentication, real-time chat via clinic codes, medical vault, doctor notes, and PDPL compliance.

## Project State
- **Current Phase**: MVP Complete with full auth integration
- **Last Updated**: February 2026

## Key Features

### Authentication
- Full email+password auth for both patients and doctors
- JWT-based token authentication
- Password validation: 8+ chars, 1 uppercase, 1 number, 1 special char
- Doctor license verification system
- PDPL consent required before patient registration
- Auth state persisted via AsyncStorage

### Patient App
1. **Messaging (Primary Feature)** - Default tab, clinic code entry to join doctor
2. **Medical Vault** - File upload (lab results, radiology) via API
3. **Health Profile** - Conditions badges, medications
4. **Settings** - Language toggle, health data, logout

### Doctor Portal
1. **Dashboard** - Auto-generated clinic code (6 chars), patient list, unread counts
2. **Chat** - Real-time messaging with patients, private notes, patient blocking
3. **Profile** - Bio, specialization, social links, license display

## Tech Stack
- **Frontend**: Expo React Native (Expo Go compatible)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Auth**: JWT tokens + bcrypt password hashing
- **Real-time**: Polling (3-5s intervals), Socket.io server ready
- **Fonts**: Cairo (Google Fonts) for Arabic/English
- **Navigation**: React Navigation 7+

## Color Scheme
- Primary: Medical Navy #003366
- Accent: Healing Emerald #50C878
- Background: #F8F9FA
- Error: #DC3545

## API Endpoints (port 5000)
- POST /api/patients/register, /api/patients/login
- POST /api/doctors/register, /api/doctors/login
- GET/PUT /api/doctors/me, /api/patients/me
- POST /api/chats/join (clinicCode), GET /api/chats
- GET/POST /api/chats/:chatId/messages
- GET/PUT /api/doctors/notes/:patientId
- POST /api/doctors/block/:patientId
- POST /api/vault/upload, GET /api/vault, DELETE /api/vault/:fileId

## File Structure
```
client/
├── App.tsx                       # Main app with providers
├── contexts/
│   ├── AuthContext.tsx            # JWT auth state (login/register/logout)
│   ├── LanguageContext.tsx        # Bilingual support
│   └── UserContext.tsx            # Local user preferences
├── navigation/
│   ├── RootStackNavigator.tsx     # Auth-based routing (auth screens vs main app)
│   ├── MainTabNavigator.tsx       # Patient tabs (Home, Messages, Vault, Settings)
│   └── DoctorNavigator.tsx        # Doctor stack (Dashboard, Chat, Profile)
└── screens/
    ├── RoleSelectScreen.tsx       # Patient/Doctor role selection
    ├── PatientLoginScreen.tsx     # Patient email+password login
    ├── PatientRegisterScreen.tsx  # Patient registration with PDPL consent
    ├── DoctorLoginScreen.tsx      # Doctor login
    ├── DoctorRegisterScreen.tsx   # Doctor registration with license
    ├── MessagesScreen.tsx         # Patient chat list + clinic code entry
    ├── ChatScreen.tsx             # Patient chat (pushed to stack)
    ├── DoctorDashboardScreen.tsx  # Doctor dashboard with clinic code
    ├── DoctorChatScreen.tsx       # Doctor chat + notes + blocking
    ├── DoctorProfileScreen.tsx    # Doctor profile editing
    ├── VaultScreen.tsx            # Medical file upload/download
    ├── SettingsScreen.tsx         # Settings with auth logout
    └── HomeScreen.tsx             # Patient health profile
server/
├── routes.ts                     # All API endpoints + Socket.io
├── auth.ts                       # JWT, bcrypt, middleware
└── storage.ts                    # Database operations
```

## Running the App
- Frontend: `npm run expo:dev` (port 8081)
- Backend: `npm run server:dev` (port 5000)
- Scan QR code with Expo Go to test on device

## User Preferences
- Arabic is the primary language (RTL support)
- Chat is the PRIMARY feature - Messages tab is default
- Medical-professional aesthetic
- PDPL compliance required
- Doctors get auto-generated clinic codes (6 chars), can customize

## Design Guidelines
See `design_guidelines.md` for complete design specifications.
