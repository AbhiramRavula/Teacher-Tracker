# 🎓 Faculty & Staff Daily Activity Tracker

**Institution:** Matrusri Engineering College (Autonomous), Hyderabad  
**Department:** Department of Information Technology  
**Academic Year:** 2026-27 (ODD Semester)  
**Live Production URL:** [teacher-tracker-jet.vercel.app](https://teacher-tracker-jet.vercel.app/)

---

## 📌 1. Project Overview

The **Faculty & Staff Daily Activity Tracker** is a high-performance, mobile-first web application designed for academic departments. It enables professors, assistant professors, and lab programmers to log their daily class hours, laboratory sessions, syllabi progress, and administrative duties in seconds without any login barriers, while providing the Head of Department (HoD) with real-time analytics, automated Google Sheets synchronization, and multi-tab institutional Excel exports.

### 🎯 Core Objectives
1. **Zero-Friction Logging (Zero-Login):** Staff can open the link on mobile or desktop, choose their name, and submit daily activity logs immediately without passwords or authentication roadblocks.
2. **Dual-Destination Real-Time Sync:** Every submission instantly updates both the staff member's **Individual Google Sheet Tab** and the consolidated **`Master_Daily_Report`** sheet in real time.
3. **Smart Same-Day Upsert (Zero Clutter):** Re-submitting for an existing date updates that day's entries in-place rather than creating duplicate rows, enabling staff to fix mistakes seamlessly.
4. **Official Institutional Layout:** The `Master_Daily_Report` and Excel exports automatically group entries into section-wise sub-tables (`III SEM IT A`, `V SEM IT A`, `VII SEM IT A`, `III SEM IT B`, `V SEM IT B`, `VII SEM IT B`, and `Departmental & Lab Duties`).
5. **Gated Administrative Governance:** Administrative configurations, approval controls, and sheet sync management are secured behind **Firebase Google Authentication** with a strict email whitelist.

---

## 🚀 2. Key Features

### 👨‍🏫 A. Public Staff Tracker (Zero-Login)
* **Smart Searchable Roster:** Instant search across all active faculty members and lab programmers.
* **Role-Aware Workflows:** 
  * **Faculty:** Default 7-period structure (`P1` to `P6` + Closing duty at 04:20 PM).
  * **Programmers:** Extended duty slots up to **05:30 PM** for lab systems maintenance, network troubleshooting, and server backups.
* **Timetable Pre-Fill:** One-tap auto-fill dynamically matches the selected day (`Monday` – `Saturday`) against official department timetables, pre-populating Section, Course Name, Credits, and Class Hour.
* **Offline Draft Resilience:** Automatic background draft persistence in `localStorage` keyed by `facultyName + date` ensures no entered text is lost if a mobile browser refreshes.
* **Single-Click Submission Guard:** Immediate button disabling and visual loading state to prevent rapid double-clicks.

### 📊 B. Dual-Destination Google Sheets Integration
* **Institutional Master Report:** Formats data into the official departmental design with colored header banners, frozen panes, zebra-striping, and section-grouped sub-tables.
* **Individual Faculty Tabs:** Automatically finds or creates a dedicated worksheet tab for each staff member with sanitized tab names (zero duplicate tabs).
* **Concurrency Locking:** Employs `LockService.getScriptLock()` with a 30-second mutex timeout on Google Apps Script to serialize simultaneous submissions from multiple faculty members during rush hours.
* **Clean Tabular Sanitization:** Automatically strips markdown formatting, asterisks, and bracketed metadata before writing to Google Sheet cells.

### 🛡️ C. HoD & Administrative Portal
* **Firebase Google Authentication:** Locked behind an authorized email whitelist:
  * `hodit@matrusri.edu.in` (Head of Department)
  * `abhiramravula7@gmail.com` (Software Developer / System Admin)
  * Dynamic AHoD slot configured through admin settings.
* **Hidden Admin Controls:** Public users never see sheet configuration modals, API settings, or raw setup URLs.
* **Submission Status Management:** Review, approve, or mark submissions as *Under Review* or *Needs Clarification* with remarks.

### 📑 D. Multi-Tab Institutional Excel Export Engine
* One-click download of the complete departmental workbook (`.xlsx`) using `xlsx`:
  * **Tab 1 (`Grand_Daily_Report`):** Official institutional layout organized by class sections.
  * **Tabs 2..N:** Dedicated worksheet tabs for every faculty member and programmer.

---

## 📦 3. Project Deliverables

| Deliverable | Description | Key Technologies & Files |
| :--- | :--- | :--- |
| **1. Web Application Frontend** | Responsive SPA with Tracker, Timetable Grid, Submissions Archive, and HoD Portal. | React 19, Vite, Tailwind CSS 4, Lucide Icons, Framer Motion (`src/App.tsx`, `src/components/*`) |
| **2. Google Apps Script Backend** | Production `doPost` script with sectional sub-tables, same-day upsert, and concurrency locking. | Google Apps Script, JavaScript ES6 (`SAMPLE_APPS_SCRIPT_CODE` in `src/utils/googleSheets.ts`) |
| **3. Multi-Tab Excel Export Engine** | Client-side spreadsheet generator matching MECS IT layout with merged headers and formatting. | SheetJS (`xlsx`), TypeScript (`src/utils/excelExport.ts`) |
| **4. Cloud Persistence & Auth Layer** | Dual storage with Cloud Firestore backup and Firebase Google Sign-In security rules. | Firebase Auth, Cloud Firestore (`src/utils/firebaseAuth.ts`, `src/utils/firestoreService.ts`) |
| **5. Master Timetable Matrix** | Complete course, section, and hourly timetable mappings for III, V, and VII semesters. | TypeScript data models (`src/constants.ts`, `src/sampleData.ts`) |

---

## 🏗️ 4. System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               Public Faculty / Programmer              │
│       (Mobile / Desktop Web Client - Zero Login)       │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. Select Staff & Fill Slots
                           │ 2. One-Click Submit
                           ▼
┌────────────────────────────────────────────────────────┐
│                   React Frontend App                   │
│   • Input Sanitization (strip brackets & markdown)     │
│   • LocalStorage Draft Persistence                     │
│   • Single-Click Submission Guard                      │
└────────────┬───────────────────────────────┬───────────┘
             │                               │
             │ Real-Time HTTP POST           │ Cloud Backup
             ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│   Google Apps Script WebApp  │ │    Cloud Firestore     │
│   (LockService Mutex Lock)   │ │  (Dual Cloud Storage)  │
└────────────┬─────────────────┘ └────────────────────────┘
             │
             ├─────────────────────────────────┐
             ▼                                 ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│ Individual Faculty Tabs      │ │  Master_Daily_Report   │
│ • Dedicate Tab per Faculty   │ │  • Sectional Grouping  │
│ • Same-Day Upsert In-Place   │ │  • S.No Auto-Indexing  │
│ • College Header Banners     │ │  • Historical Record   │
└──────────────────────────────┘ └────────────────────────┘
```

---

## 🛠️ 5. Technology Stack

* **Frontend Framework:** React 19 (`react`, `react-dom`)
* **Build Tool:** Vite 6 (`vite`, `@vitejs/plugin-react`)
* **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`, `tailwindcss`)
* **Icons:** Lucide React (`lucide-react`)
* **Animations:** Motion (`motion`)
* **Excel Generation:** SheetJS (`xlsx`)
* **Authentication & Cloud DB:** Firebase Auth & Cloud Firestore (`firebase`)
* **Backend Database:** Google Sheets via Google Apps Script (Web App `/exec` endpoint)
* **Hosting Target:** Vercel

---

## 📋 6. Setup & Local Development

### Prerequisites
* Node.js `v18.0.0` or higher
* npm, yarn, pnpm, or bun

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbhiramRavula/Teacher-Tracker.git
   cd Teacher-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   # Google Apps Script Web App Deployment URL (ends in /exec)
   VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

   # Google Spreadsheet Document ID (from URL /d/SPREADSHEET_ID/edit)
   VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID

   # Firebase Configuration (For HoD / Admin Authentication)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Optional Secondary Admin Email
   VITE_AHOD_EMAIL=ahodit@matrusri.edu.in
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📑 7. Google Apps Script Backend Deployment

1. Open your master Google Sheet.
2. Click **Extensions > Apps Script**.
3. Replace any existing script with the code located in `SAMPLE_APPS_SCRIPT_CODE` (inside `src/utils/googleSheets.ts`).
4. Click **Save** (💾).
5. Click **Deploy > Manage deployments > Edit (pencil icon)**.
6. Under **Version**, choose **"New version"**.
7. Ensure:
   * **Execute as:** `Me (<your-google-account>)`
   * **Who has access:** `Anyone`
8. Click **Deploy** and copy the **Web App URL** (ends in `/exec`).
9. Paste the URL into your `.env` as `VITE_GOOGLE_SHEETS_WEB_APP_URL` or configure it directly in the Admin Portal under **Sheets Sync**.

---

## 🧪 8. Quality Assurance & Verification Tests

| Test Case | Scenario | Expected Behavior |
| :--- | :--- | :--- |
| **TC-1: Zero-Login Submission** | Open in Incognito, choose a staff member, fill period slots, and click Submit. | Immediate button disable, loading animation, successful POST to Google Sheets, success toast—**zero login prompts**. |
| **TC-2: Same-Day Upsert** | Re-submit logs for an already-logged date with edited topic descriptions. | In-place update of that date's rows on the individual tab and master report. **Zero duplicate rows created**. |
| **TC-3: Admin Portal Gating** | Non-admin visits site; attempt sign-in with unauthorized personal Gmail. | Header Sheets settings remain hidden. Unauthorized Google Sign-In is instantly rejected with "Access Denied". |
| **TC-4: Concurrency Lock** | Multiple faculty members submit at the exact same second during staffroom rush. | `LockService` serializes requests with a 30s timeout. All rows are cleanly written with **zero dropped data**. |
| **TC-5: Offline Draft Recovery** | Enter text in slot, refresh browser or close tab, and reopen. | All slot inputs remain saved in `localStorage` for that staff member and date. |

---

## 👥 9. Staff Roster & Department Scope

### Active Faculty Members
* Dr. J. Srinivas
* Mrs. Y. Sirisha
* Dr. J. Shailaja
* Dr. K. Durga Prasad
* Mrs. T. Vijaya Lakshmi
* Mrs. M. Srividya
* Mrs. K. Smitha
* Mrs. T. Aruna Jyothi
* Mrs. R. Madhavi
* Mrs. S. T. Ramya
* Ms. G. Akshara
* Mr. M. Suresh Kumar
* Mr. M. Thirupathi
* Mr. B. Samhith
* Ms. J. Nagalaxmi

### Active Lab Programmers (Duty hours up to 05:30 PM)
* Mr. Srinivas
* Mr. Ramesh Kumar
* Mrs. Girija
* Mr. Krishna Mohan
* Mrs. Mounika

---

## 📜 10. License & Department Attribution

Designed and developed for the **Department of Information Technology**, **Matrusri Engineering College (Autonomous)**, Hyderabad.  
All rights reserved © 2026-27.
