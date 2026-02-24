# SALEEM PROFESSIONAL MESSAGING APP
## Complete Replit Development Prompt - Final Version

**Status:** Ready for Development
**Timeline:** 2-3 weeks
**Priority:** High
**Budget:** Minimal (all free tools)

---

## PROJECT OVERVIEW

**What is Saleem?**
A professional messaging app that allows doctors, teachers, consultants, and other professionals to communicate with their clients/students securely without sharing personal contact information.

**Use Case:**
Doctors see patients in clinic → Patient needs follow-up → Instead of asking for WhatsApp, doctor gives them Saleem → Secure professional messaging happens → Doctor's personal number stays private

**Target Market:** Saudi Arabia (Arabic + English support)

**Legal Status:** Professional messaging app (NOT telemedicine, NOT medical diagnosis service)

**Current Situation:** 
- Basic chat app built
- Need to remove medical features
- Need to add proper branding
- Need to add legal compliance
- Ready to launch

---

## PRIORITY 1: REMOVE FEATURES

### 1.1 Remove Vault Feature
**What to Remove:**
- [ ] Delete entire Vault/Reports section from sidebar
- [ ] Delete all vault-related pages/components
- [ ] Delete vault upload functionality
- [ ] Delete vault database tables
- [ ] Delete all references to "vault" in code
- [ ] Remove "Upload Reports" buttons/features
- [ ] Remove "Lab Reports" and "Radiology" categories

**What to Keep:**
- File/document upload IN chat messages only (optional - doctors can share documents directly in conversation)

**Code Changes:**
```
DELETE:
- /pages/vault.tsx (or .jsx/.py)
- /components/VaultUpload.tsx
- /components/ReportViewer.tsx
- Database: reports table

KEEP:
- Chat message uploads (files sent within messages are OK)
```

---

### 1.2 Remove Medical Registration Fields
**What to Remove:**
- [ ] Height field (registration)
- [ ] Weight field (registration)
- [ ] Blood type field (if exists)
- [ ] Medical history fields (registration)
- [ ] Allergies field (registration)
- [ ] Current medications field (registration)
- [ ] Any other medical/health fields

**What to Keep:**
- Name
- Email
- Phone number
- Password
- User type (Doctor/Patient/Professional or Client/Student)
- Profile picture (optional, for professionals)

**New Registration Form (SIMPLIFIED):**

For Patients/Clients:
```
Step 1: Account Type
- I am a client/student seeking professional help

Step 2: Profile
- Name: [________]
- Email: [________]
- Phone: [________]
- Password: [________]

Step 3: Agreements
- ☑ I agree to Terms & Conditions
- ☑ I agree to Privacy Policy
```

For Professionals:
```
Step 1: Account Type
- I am a professional (doctor/teacher/consultant)

Step 2: Profile
- Name: [________]
- Email: [________]
- Phone: [________]
- Password: [________]
- Profession: [Dropdown: Doctor, Teacher, Lawyer, Consultant, Other]
- Specialization/Subject (optional): [________]

Step 3: Profile Picture (Optional)
- Upload photo or use default avatar

Step 4: Agreements
- ☑ I agree to Terms & Conditions
- ☑ I agree to Privacy Policy
```

**Database Changes:**
```
DELETE from users table:
- height
- weight
- blood_type
- medical_history
- allergies
- medications
- chronic_conditions
- surgical_history
- family_history

KEEP in users table:
- user_id
- name
- email
- phone
- password_hash
- user_type (professional/client)
- profession (doctor/teacher/lawyer/consultant)
- specialization (optional)
- profile_picture_url (optional)
- created_at
- updated_at
```

---

## PRIORITY 2: BRANDING & LOGO

### 2.1 Update App Logo
**What to Change:**
- [ ] Update app icon (square logo for app stores)
- [ ] Update splash screen logo
- [ ] Update logo in header/navbar
- [ ] Update favicon (browser tab icon)
- [ ] Ensure logo works in light AND dark mode
- [ ] Ensure logo is clear in small sizes (app icon)

**Logo Requirements:**
- **Size:** 1024x1024 pixels (will scale down automatically)
- **Format:** PNG with transparent background (for flexibility)
- **Design:** 
  - Professional appearance
  - Suggest security/privacy (optional: shield, lock, envelope, or shield+chat bubble)
  - No medical symbols (stethoscope, heart, red cross, etc.)
  - No generic chat bubbles alone
  - Works in all sizes (from 32px to 1024px)
  - Works in Arabic context

**Design Style:**
- Modern, clean, minimalist
- Professional color scheme (blues, purples, grays are common)
- NOT colorful/playful (this is professional)
- NOT medical (no doctor/hospital imagery)
- NOT generic chat icons

**Where to Update in Code:**
```
FILES TO CHANGE:
- /public/logo.png (main logo)
- /public/logo-white.png (white version for dark backgrounds)
- /public/favicon.ico (browser tab icon)
- /public/apple-touch-icon.png (iOS home screen)
- /public/android-chrome-192x192.png (Android app icon)
- /public/android-chrome-512x512.png (Android splash)
- /src/components/Logo.tsx (logo component)
- /src/components/Navbar.tsx (update logo reference)
- /public/manifest.json (update app icon references)
- /public/index.html (update favicon link)
```

**How to Get Logo:**
- Option A: Design yourself (Figma, Canva)
- Option B: Use freelancer (Fiverr, Upwork - SAR 100-300)
- Option C: Use AI generator (DALL-E, Midjourney - SAR 50-100)
- Option D: Use free logo maker (Looka, Logo.com - free or cheap)

**Recommended:**
- Use a freelancer on Fiverr (search: "professional messaging app logo")
- Cost: ~$25-50
- Budget: SAR 100-200
- Turnaround: 1-2 days

---

### 2.2 Update App Name/Branding
**What to Change:**
- [ ] Update app name everywhere it says "Saleem"
- [ ] Update description/tagline
- [ ] Update brand colors if changing them
- [ ] Update social media/marketing materials
- [ ] Update Terms & Conditions with new name
- [ ] Update Privacy Policy with new name

**Where to Update in Code:**
```
FILES TO CHANGE:
- /public/index.html (page title)
- /public/manifest.json (app name)
- /src/constants.ts or config.ts (app name constant)
- /src/components/Navbar.tsx (header text)
- /src/pages/welcome.tsx (welcome screen)
- /README.md (documentation)
- Package.json (app description)
- All marketing/splash screens
- Terms & Conditions (update name)
- Privacy Policy (update name)

CODE EXAMPLE:
const APP_NAME = "Saleem"; // Change to new name

Change all occurrences:
- "Saleem" → "[New Name]"
- "Professional messaging app" → "[Your tagline]"
```

---

## PRIORITY 3: LEGAL COMPLIANCE (Saudi Arabia)

### 3.1 Add Terms & Conditions
**Location:** Settings > Legal > Terms & Conditions

**Implementation:**
```
In App (Mobile Signup):
- Show checkbox: "☑ I agree to Terms & Conditions"
- Clickable link: "Read Terms"
- Must check before signup proceeds
- Save agreement timestamp to database

In Settings:
- Settings > Legal > Terms & Conditions
- Make it readable (good font size)
- Scrollable
- Both Arabic & English versions

In Database:
- Save: user_id, agreed_to_terms, agreement_date
```

**Content to Use:**
- Use the Terms & Conditions provided (in separate document)
- Both English and Arabic versions provided
- Add your app name where it says "Saleem"
- Add your contact email where needed
- Check: app is NOT for medical emergencies
- Check: app is for follow-ups only
- Check: governed by Saudi law

**File Location in Code:**
```
- /src/components/LegalDocuments.tsx (component to display)
- /src/pages/Settings.tsx (link to legal)
- /public/legal/terms-en.md (English version)
- /public/legal/terms-ar.md (Arabic version)
- Database: user_agreements table
```

---

### 3.2 Add Privacy Policy
**Location:** Settings > Legal > Privacy Policy

**Implementation:**
```
In App (Mobile Signup):
- Show checkbox: "☑ I agree to Privacy Policy"
- Clickable link: "Read Privacy Policy"
- Must check before signup proceeds
- Save agreement timestamp to database

In Settings:
- Settings > Legal > Privacy Policy
- Make it readable (good font size)
- Scrollable
- Both Arabic & English versions

In Database:
- Save: user_id, agreed_to_privacy, agreement_date
```

**Content to Use:**
- Use the Privacy Policy provided (in separate document)
- Both English and Arabic versions provided
- Add your app name where it says "Saleem"
- Add your contact email where needed
- Check: data stored in Saudi Arabia
- Check: encrypted messaging
- Check: user rights (access, delete, export)

**File Location in Code:**
```
- /src/components/LegalDocuments.tsx (component)
- /src/pages/Settings.tsx (link to legal)
- /public/legal/privacy-en.md (English version)
- /public/legal/privacy-ar.md (Arabic version)
- Database: user_agreements table
```

---

### 3.3 Add Emergency Safety Notice
**Location:** Settings > Safety & Emergency

**Implementation:**
```
In Settings Menu:
- Add: "Settings > Safety & Emergency"
- Show clear warning message

Content (Bilingual):
ENGLISH:
---
⚠️ EMERGENCY ALERT

This app is NOT for medical emergencies.

If you have a medical emergency:
1. Call 997 immediately
2. Go to the nearest hospital
3. Do NOT rely on this app

This is a professional messaging tool for 
follow-up communication only.
---

ARABIC:
---
⚠️ تنبيه الطوارئ

هذا التطبيق ليس لحالات الطوارئ الطبية.

في حالة الطوارئ الطبية:
1. اتصل برقم 997 فوراً
2. توجه للمستشفى الأقرب
3. لا تعتمد على هذا التطبيق

هذا تطبيق مراسلة احترافي للمتابعة فقط.
---

UI:
- Red background or warning color
- Bold text
- Large font
- Accessible from main Settings menu
- Not hidden or hard to find
```

**File Location in Code:**
```
- /src/pages/Settings.tsx (add Safety section)
- /src/components/EmergencyNotice.tsx (component)
```

---

### 3.4 Update Signup Agreements
**Implementation:**

**Step 1: Show both agreements**
```
Before user can create account:

☑ I have read and agree to the 
  Terms & Conditions [link]

☑ I have read and agree to the 
  Privacy Policy [link]

[Button: Create Account] 
(disabled until both checked)
```

**Step 2: Make links clickable**
```
When user clicks link:
- Modal opens showing full document
- Scrollable
- Both languages available
- Can close and return to signup
```

**Step 3: Save agreement**
```
When user clicks "Create Account":
- Save to database:
  - user_id
  - agreed_terms_at: [timestamp]
  - agreed_privacy_at: [timestamp]
  - terms_version: "1.0"
  - privacy_version: "1.0"
```

---

## PRIORITY 4: DATABASE CLEANUP

### 4.1 Remove Medical Data Tables
**Drop These Tables:**
```sql
DROP TABLE IF EXISTS user_medical_history;
DROP TABLE IF EXISTS user_health_records;
DROP TABLE IF EXISTS user_vault;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS lab_results;
DROP TABLE IF EXISTS radiology_reports;
DROP TABLE IF EXISTS prescriptions;
```

### 4.2 Clean Up Users Table
**Remove These Columns:**
```sql
ALTER TABLE users DROP COLUMN IF EXISTS height;
ALTER TABLE users DROP COLUMN IF EXISTS weight;
ALTER TABLE users DROP COLUMN IF EXISTS blood_type;
ALTER TABLE users DROP COLUMN IF EXISTS medical_history;
ALTER TABLE users DROP COLUMN IF EXISTS allergies;
ALTER TABLE users DROP COLUMN IF EXISTS medications;
ALTER TABLE users DROP COLUMN IF EXISTS chronic_conditions;
ALTER TABLE users DROP COLUMN IF EXISTS surgical_history;
ALTER TABLE users DROP COLUMN IF EXISTS family_history;
ALTER TABLE users DROP COLUMN IF EXISTS age;
ALTER TABLE users DROP COLUMN IF EXISTS date_of_birth;
```

### 4.3 Add Agreement Tracking Tables
```sql
CREATE TABLE user_agreements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agreed_to_terms BOOLEAN DEFAULT false,
  terms_agreed_at TIMESTAMP,
  terms_version VARCHAR(10),
  agreed_to_privacy BOOLEAN DEFAULT false,
  privacy_agreed_at TIMESTAMP,
  privacy_version VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## PRIORITY 5: UI/UX UPDATES

### 5.1 Simplify Registration Form
**Current Issue:** Too many fields
**Solution:** Only essential fields

**Registration Page - Professional:**
```
Screen 1: Account Type
[Button] I'm a Professional
[Button] I'm a Client/Student

Screen 2: Basic Info (if Professional)
- Full Name: [_______]
- Email: [_______]
- Phone: [_______]
- Password: [_______]
- Profession: [Dropdown]
  * Doctor
  * Teacher
  * Lawyer
  * Consultant
  * Other

Screen 3: Profile Picture (Optional)
- [Upload Photo Button]
- Or skip

Screen 4: Agreements
- ☑ Terms & Conditions [link]
- ☑ Privacy Policy [link]

[Create Account Button]
```

**Registration Page - Client/Student:**
```
Screen 1: Basic Info
- Full Name: [_______]
- Email: [_______]
- Phone: [_______]
- Password: [_______]

Screen 2: Agreements
- ☑ Terms & Conditions [link]
- ☑ Privacy Policy [link]

[Create Account Button]
```

### 5.2 Simplify Profile Page
**Remove:**
- [ ] Height field
- [ ] Weight field
- [ ] Medical history section
- [ ] Health conditions
- [ ] Medications list
- [ ] Allergies section

**Keep:**
- Name
- Email
- Phone
- Profile picture
- Profession (for professionals)
- Bio/Introduction (optional)

---

## PRIORITY 6: CODE CLEANUP

### 6.1 Remove Unused Components
**Delete These:**
```
/src/components/VaultUpload.tsx
/src/components/ReportViewer.tsx
/src/components/MedicalHistory.tsx
/src/components/HealthMetrics.tsx
/src/components/MedicationTracker.tsx
/src/pages/vault.tsx
/src/pages/health-profile.tsx
/src/hooks/useVault.ts
/src/hooks/useMedicalHistory.ts
```

### 6.2 Update Navigation
**Remove from Sidebar/Navigation:**
```
❌ DELETE:
- Vault
- Medical History
- Health Records
- Reports
- Prescriptions

✅ KEEP:
- Home
- Chat
- Contacts
- Profile
- Settings
- Logout
```

### 6.3 Clean Up Imports
**Review and Remove:**
- Any imports from deleted components
- Any unused medical-related libraries
- Any health-tracking dependencies
- Any medical icons/assets

---

## PRIORITY 7: TESTING

### 7.1 Test Registration
- [ ] Professional signup works
- [ ] Client signup works
- [ ] Terms checkbox required
- [ ] Privacy checkbox required
- [ ] Cannot proceed without both checked
- [ ] Agreements saved to database
- [ ] Profile page shows only essential fields

### 7.2 Test Legal Compliance
- [ ] Terms visible in Settings
- [ ] Privacy Policy visible in Settings
- [ ] Emergency notice visible in Settings
- [ ] Both languages readable
- [ ] No medical fields in profile
- [ ] No vault/report features

### 7.3 Test Chat Functionality
- [ ] Professionals can create profiles
- [ ] Clients can search for professionals
- [ ] Can send messages
- [ ] Can receive messages
- [ ] No medical history requests
- [ ] No health fields visible

### 7.4 Test Navigation
- [ ] Sidebar updated (no Vault)
- [ ] All links work
- [ ] Settings menu complete
- [ ] No broken links to deleted pages

---

## FINAL CHECKLIST BEFORE LAUNCH

### Code Updates:
- [ ] Logo updated (all sizes)
- [ ] App name updated everywhere
- [ ] Medical fields removed from database
- [ ] Medical pages deleted from code
- [ ] Medical components removed
- [ ] Terms & Conditions added (En + Ar)
- [ ] Privacy Policy added (En + Ar)
- [ ] Emergency notice added
- [ ] Signup agreements working
- [ ] Registration form simplified
- [ ] Profile page simplified
- [ ] Navigation cleaned up

### Testing:
- [ ] Registration works
- [ ] Login works
- [ ] Chat works
- [ ] No crashes
- [ ] Legal documents readable
- [ ] Emergency notice visible
- [ ] No medical fields visible
- [ ] Mobile responsive

### Legal:
- [ ] Terms & Conditions in English & Arabic
- [ ] Privacy Policy in English & Arabic
- [ ] Both accessible in Settings
- [ ] Both required on signup
- [ ] Contact info correct
- [ ] No medical claims in any text

### Deployment:
- [ ] All changes committed to git
- [ ] No sensitive data exposed
- [ ] Environment variables set
- [ ] Database backups created
- [ ] Ready to publish

---

## DEPLOYMENT INSTRUCTIONS

### Step 1: Final Code Review
```
1. Run linter: npm run lint (or equivalent)
2. Check for errors: npm run build
3. Test locally: npm run dev
4. Test on mobile: use phone/emulator
5. Verify all features work
```

### Step 2: Database Migration
```
1. Backup current database
2. Run cleanup scripts (drop medical tables)
3. Remove medical columns from users table
4. Add user_agreements table
5. Test that queries still work
```

### Step 3: Deploy to Production
```
1. Merge changes to main branch
2. Run production build
3. Deploy to hosting (Replit, Vercel, etc.)
4. Test in production environment
5. Monitor for errors
```

### Step 4: Monitor First Week
```
1. Check app daily for crashes
2. Monitor error logs
3. Respond to user feedback
4. Fix any bugs immediately
5. Keep backups current
```

---

## SUPPORT & CONTACT

**If developer has questions:**
- [ ] Who to contact: [Your email/phone]
- [ ] Support email: support@[appname].app
- [ ] Response time: Same day

**Documentation Location:**
- [ ] This prompt file
- [ ] Code comments explaining changes
- [ ] README.md (updated)
- [ ] API documentation (if applicable)

---

## TIMELINE ESTIMATE

| Task | Time | Status |
|---|---|---|
| Remove medical features | 4-6 hours | High priority |
| Update branding/logo | 2-3 hours | High priority |
| Add legal documents | 2-3 hours | High priority |
| Database cleanup | 2-3 hours | High priority |
| Testing | 4-6 hours | High priority |
| Deployment | 1-2 hours | Final |
| **TOTAL** | **15-25 hours** | **1-2 weeks** |

---

## SUCCESS CRITERIA

**App is ready to launch when:**

✅ No medical fields in registration
✅ No vault/report features
✅ Logo updated
✅ Terms & Conditions in app
✅ Privacy Policy in app
✅ Emergency notice in Settings
✅ All tests pass
✅ No crashes on registration
✅ Chat still works perfectly
✅ Mobile responsive
✅ Both Arabic & English work

---

## IMPORTANT NOTES

**For Developer:**
- Don't delete code until you verify what you're deleting
- Keep backups before major changes
- Test each feature after changes
- Use git branches for major changes
- Commit frequently

**For Project Manager (You):**
- Check progress daily
- Have developer show you changes
- Test on your phone before launch
- Get feedback from test doctors
- Be ready to fix bugs quickly

**For Legal (Sister):**
- Review final T&Cs before publication
- Review final Privacy Policy before publication
- Confirm Saudi Arabia compliance
- Confirm no medical claims

---

## QUESTIONS BEFORE STARTING?

**Common Questions:**

Q: Can I keep some medical features?
A: No. This needs to be purely professional messaging. No medical data collection.

Q: Do I need the Arabic version?
A: Yes. You're launching in Saudi Arabia. Both languages required.

Q: How long until launch?
A: 2-3 weeks of development + testing + 1 week deployment = ~1 month total.

Q: What if something breaks?
A: Database backups, git history, and daily testing catch most issues.

Q: Can I add features later?
A: Yes. Better to launch minimal and add features than be perfect and late.

---

**READY TO BUILD? Start with this prompt. Follow each priority in order. Commit code frequently. Test everything. Launch when all checklist items are done.**

**Timeline: 2-3 weeks**
**Difficulty: Moderate**
**Outcome: Professional, Saudi-compliant messaging app**

**LET'S GO! 🚀**

