# Saleem (سليم) - Professional Messaging Platform

## Overview
Saleem is a bilingual (Arabic/English) professional messaging platform for Saudi Arabia targeting ALL professions. Built with Expo React Native frontend and Express.js backend with PostgreSQL database. Features email+password authentication with 6-digit email verification, real-time chat via access codes, private notes, client blocking, and PDPL compliance.

## Project State
- **Current Phase**: General professional messaging platform (pivot from medical app complete)
- **Last Updated**: February 2026
- **Terminology**: "Professional/Specialist" (مختص) and "Client" (عميل) — internal code still uses "doctor"/"patient" for API routes and database tables

## Key Features

### Authentication
- Full email+password auth for both clients and professionals
- 6-digit email verification codes (dev mode: logged to console, prod: SMTP)
- JWT-based token authentication
- Password validation: 8+ chars, 1 uppercase, 1 number, 1 special char
- Professional license verification system
- PDPL consent, Terms & Conditions, Privacy Policy checkboxes required at registration
- Auth state persisted via AsyncStorage

### Client App
1. **Profile** - Simple profile display (name, email, phone)
2. **Messaging (Primary Feature)** - Default tab, access code entry to connect with professional
3. **Settings** - Language toggle, Terms & Conditions, Privacy Policy, Emergency Safety Notice, logout

### Professional Portal
1. **Dashboard** - Auto-generated access code (6 chars), client list, unread counts
2. **Chat** - Real-time messaging with clients, private notes, client blocking
3. **Profile** - Bio, specialization, social links, professional license display

### Legal & Compliance
- Terms & Conditions (bilingual modal)
- Privacy Policy (bilingual modal)
- Emergency Safety Notice with 997 emergency number
- PDPL data protection compliance

## Tech Stack
- **Frontend**: Expo React Native (Expo Go compatible)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Auth**: JWT tokens + bcrypt password hashing
- **Real-time**: Polling (3-5s intervals), Socket.io server ready
- **Fonts**: Cairo (Google Fonts) for Arabic/English
- **Navigation**: React Navigation 7+

## Color Scheme
- Primary: Navy #003366
- Accent: Emerald #50C878
- Background: #F8F9FA
- Error: #DC3545

## API Endpoints (port 5000)
- POST /api/patients/register, /api/patients/login
- POST /api/doctors/register, /api/doctors/login
- POST /api/auth/verify-email, /api/auth/resend-code
- GET/PUT /api/doctors/me, /api/patients/me
- POST /api/chats/join (clinicCode), GET /api/chats
- GET/POST /api/chats/:chatId/messages
- GET/PUT /api/doctors/notes/:patientId
- POST /api/doctors/block/:patientId
- POST /api/admin/login (admin@saleem.app + ADMIN_PASSWORD env)
- GET /api/admin/stats, /api/admin/users, /api/admin/user-growth (JWT-protected with admin flag)

## Admin Dashboard
- **URL**: `/admin` (web-based HTML dashboard served by Express)
- **Login**: admin@saleem.app with ADMIN_PASSWORD secret
- **Features**: Stats overview (users, messages, chats), user list with type badges, signup growth chart (Chart.js)
- **Auth**: JWT with admin: true flag, 24h expiry, separate from regular user auth

## File Structure
```
client/
├── App.tsx                       # Main app with providers
├── contexts/
│   ├── AuthContext.tsx            # JWT auth + email verification (login/register/verify/logout)
│   └── LanguageContext.tsx        # Bilingual support
├── navigation/
│   ├── RootStackNavigator.tsx     # Auth-based routing (auth screens vs main app)
│   ├── MainTabNavigator.tsx       # Client tabs (Profile, Messages, Settings)
│   └── DoctorNavigator.tsx        # Professional stack (Dashboard, Chat, Profile)
└── screens/
    ├── RoleSelectScreen.tsx       # Client/Professional role selection
    ├── PatientLoginScreen.tsx     # Client email+password login
    ├── PatientRegisterScreen.tsx  # Client registration with agreements
    ├── DoctorLoginScreen.tsx      # Professional login
    ├── DoctorRegisterScreen.tsx   # Professional registration with license + agreements
    ├── EmailVerificationScreen.tsx # 6-digit email verification code entry
    ├── MessagesScreen.tsx         # Client chat list + access code entry
    ├── ChatScreen.tsx             # Client chat (pushed to stack)
    ├── DoctorDashboardScreen.tsx  # Professional dashboard with access code
    ├── DoctorChatScreen.tsx       # Professional chat + notes + blocking
    ├── DoctorProfileScreen.tsx    # Professional profile editing
    ├── SettingsScreen.tsx         # Settings with legal docs + emergency notice
    └── HomeScreen.tsx             # Simple profile display + emergency alert
server/
├── routes.ts                     # All API endpoints + Socket.io
├── auth.ts                       # JWT, bcrypt, middleware
└── storage.ts                    # Database operations
shared/
└── schema.ts                     # Database schema (Drizzle ORM)
```

## Running the App
- Frontend: `npm run expo:dev` (port 8081)
- Backend: `npm run server:dev` (port 5000)
- Scan QR code with Expo Go to test on device

## User Preferences
- Arabic is the primary language (RTL support)
- Chat is the PRIMARY feature - Messages tab is default
- Professional aesthetic
- PDPL compliance required
- Professionals get auto-generated access codes (6 chars), can customize
- All professions supported (lawyers, consultants, teachers, etc.)

## Design Guidelines
See `design_guidelines.md` for complete design specifications.
