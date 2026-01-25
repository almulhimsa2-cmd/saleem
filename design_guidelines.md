# Saleem (سليم) Design Guidelines

## Brand Identity
**Purpose**: A gamified patient-doctor portal that transforms medical history and post-op care into an interactive experience while maintaining Saudi PDPL compliance.

**Aesthetic Direction**: Medical-playful hybrid - clean, trustworthy medical interface with gamified elements that feel encouraging, not childish. Approachable without sacrificing professionalism.

**Memorable Element**: The dynamic avatar silhouette that evolves as users add health data - badges appear on organs, the avatar scales with height/weight inputs.

## Navigation Architecture
**Root Navigation**: Tab Bar (3 tabs)
- **Home** (Quest Dashboard): Avatar, active instructions, progress
- **Vault**: Medical files, lab results, radiology images
- **Messages**: Communication with doctor

**Authentication**: Required (doctor-generated clinic codes)
- Login/signup with clinic code entry
- Explicit PDPL consent screen (non-dismissible until accepted)
- Support Apple Sign-In for iOS

**Language Support**: RTL (Arabic) primary, LTR (English) toggle in settings

## Color Palette
- **Primary**: Medical Navy #003366
- **Accent**: Healing Emerald #50C878
- **Background**: #F8F9FA (light gray)
- **Surface**: #FFFFFF
- **Text Primary**: #1A1A1A
- **Text Secondary**: #666666
- **Error**: #DC3545
- **Success**: #50C878

## Typography
**Font**: Cairo (Google Fonts) - supports Arabic beautifully
- **Title**: Cairo Bold, 28px
- **Heading**: Cairo SemiBold, 20px
- **Body**: Cairo Regular, 16px
- **Caption**: Cairo Regular, 14px
- **Button**: Cairo SemiBold, 16px

## Screen-by-Screen Specifications

### 1. Onboarding Flow (Stack-Only)
**Welcome Screen**:
- Transparent header
- Hero illustration of avatar silhouette
- Two language buttons (العربية / English)
- "Get Started" button at bottom

**PDPL Consent Screen**:
- Default header with back button
- Scrollable consent text explaining Saudi data laws
- Non-pre-ticked checkbox
- "I Accept" button (disabled until checkbox)

**Avatar Setup**:
- Custom header: "Create Your Health Hero"
- Scrollable form: Height/weight sliders with live avatar preview
- Avatar scales visually based on input
- Continue button below form

**Medicine Cabinet**:
- Header: "Your Medications"
- Drag-and-drop grid of medication icons (Pills, Sprays, Inhalers)
- Virtual shelf at bottom where items are placed
- Skip/Continue in header right

**Badge System**:
- Header with search bar
- Smart-search results list (200+ diseases library)
- Selected badges appear on avatar's organs below
- Done button in header

### 2. Home Tab (Quest Dashboard)
- Transparent header with clinic name
- Safe area insets: top = headerHeight + 24px, bottom = tabBarHeight + 24px
- Scrollable content:
  - Hero: Large avatar with current badges/meds overlay
  - Active Quest card (today's recovery instructions)
  - Specialty-specific mini-game module (changes by doctor specialty)
  - Progress streak widget
- Components: Cards with subtle shadows, progress bars

### 3. Vault Tab
- Default header: "Medical Vault" with + button (upload)
- List of files (Labs, Radiology) with lock/unlock icons
- Each row: file type icon, name, date, lock toggle
- Empty state: illustration of secure folder
- Safe area insets: bottom = tabBarHeight + 24px

**Upload Modal** (Native modal):
- Header: "Upload File" with Cancel/Done
- File type selector (Lab PDF / Radiology Image)
- File picker button
- OCR preview placeholder (shows detected text suggestions)

### 4. Messages Tab
- Default header: "Messages" 
- Symptom Body-Map SVG at top (tappable organs)
- Chat messages below (unlocks after daily instructions reviewed)
- Voice note recording button in input bar
- Safe area insets: bottom = tabBarHeight + 24px

**Body-Map Symptom Logger** (Modal):
- Custom header: organ name (e.g., "Ear")
- Form: severity slider, description text area
- Submit in header right

### 5. Settings (accessible from Home avatar tap)
- Default header: "Settings"
- Scrollable sections:
  - Language toggle (العربية/English)
  - Notifications
  - Privacy & Security
  - Delete My Data (red, nested confirmation)
  - Log Out

### 6. Doctor Dashboard (Separate Flow)
- Tab bar: Patients / Clinic Code / Settings
- Patients list with search
- Clinic Code generator screen
- Patient detail view shows unlocked vault items

## Assets to Generate

**App Assets**:
1. **icon.png** - App icon: Medical cross + game controller fusion in Medical Navy/Emerald
2. **splash-icon.png** - Avatar silhouette outline in Emerald

**Illustrations**:
3. **avatar-base.svg** - Neutral human silhouette for customization (USED: Onboarding, Home)
4. **empty-vault.png** - Secure folder illustration (USED: Vault empty state)
5. **consent-shield.png** - Shield with checkmark (USED: PDPL consent screen)
6. **medicine-icons.png** - Pill, spray, inhaler icons (USED: Medicine Cabinet drag-drop)
7. **body-map.svg** - Tappable human outline with organs (USED: Messages symptom logger)

**Specialty Game Assets** (minimal, clean medical illustrations):
8. **ent-nasal.png** - Nasal passage diagram (USED: ENT mini-game)
9. **peds-milestone.png** - Growth chart graphic (USED: Pediatrics badges)
10. **obgyn-fetal.png** - Fetal position illustration (USED: OBGYN kick tracker)

**UI Elements**:
11. **badge-icons/** - Organ-specific badge icons for diabetes, hypertension, etc. (USED: Avatar overlay)

## Visual Design Rules
- All touchable elements: 0.6 opacity on press
- Cards: 8px border radius, #F0F0F0 background
- Floating action buttons (upload, voice note): 2px shadow offset, 0.10 opacity, 2px radius
- Avatar badges: appear ON corresponding organs (heart for cardiac, lungs for respiratory)
- Mini-games render in modular container, swap based on doctor specialty code
- Vault file icons: use Feather icons (lock, unlock, file-text, image)

## Compliance UI
- "Delete My Data" button: Red, requires typed confirmation "DELETE"
- All file uploads rename to UUIDs immediately
- Disclaimer banner on every screen: "For education only, not emergency care"