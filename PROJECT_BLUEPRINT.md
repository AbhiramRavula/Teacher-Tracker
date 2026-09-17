# Faculty & Staff Daily Activity Tracker - Master Architecture Blueprint
**Institution:** Matrusri Engineering College (Department of Information Technology)  
**Academic Year:** 2026-27 ODD Semester  

---

## 1. Project Overview & Core Objective
A mobile-first, zero-login daily activity logging web application built for IT department faculty members and programmers. It provides a frictionless logging experience for daily hourly duties while keeping administrative controls securely gated behind Firebase Google Authentication. Data dual-logs instantly into individual faculty Google Sheet tabs and a consolidated master report sheet.

---

## 2. Active Staff Roster & Department Scope
- **Active Faculty Roster:** Dr. J. Srinivas, Mrs. Y. Sirisha, Dr. J. Shailaja, Dr. K. Durga Prasad, Mrs. T. Vijaya Lakshmi, Mrs. Srividya (restored), K. Smitha, Mrs. T. Aruna Jyothi, R. Madhavi, S.T. Ramya, Ms. G. Akshara, Mr. M. Suresh Kumar, Mr. M. Thirupathi, etc.
- **Active Programmers (Duty hours up to 05:30 PM):** Srinivas, Ramesh Kumar, Girija, Krishna Mohan, Mounika.
- **Excluded/Transferred Staff (Ignore completely effective Sept 15, 2026):** Vikram, BJ Praveena, Pushpa, Deepa.
- **Name Correction:** "Amith" is officially updated to **Samhith**.

---

## 3. Core Architecture & Workflows

### A. Public Staff Logging (Frictionless / Zero-Login)
- Regular staff and programmers open the app, select their name from a clean searchable dropdown, pick the date, and view their dynamically loaded hourly schedule (`P1`, `P2`, `P3`, etc.).
- They type their specific **Unit No** and **Topic Name** for the day.
- Clicking **"Submit Today's Complete Log"** fires a POST request directly to the Google Apps Script Web App URL. No Firebase login or authentication is required for staff to submit logs.
- Drafts are saved in real-time via `localStorage` keyed by `facultyName + date` to prevent data loss on mobile devices.

### B. Admin & HoD Portal (Firebase Auth Gated)
- Firebase Google Authentication is restricted strictly to authorized administrative accounts:
  1. `hodit@matrusri.edu.in` (Primary HoD)
  2. `abhiramravula7@gmail.com` (System Developer/Admin)
  3. A dynamic secondary AHoD slot configured from the admin panel.
- The header **"Sheets" configuration button** and administrative settings tabs are **strictly hidden** from regular unauthenticated users.

### C. Google Apps Script Backend (100% Append-Only & Zero Duplicates)
- **Zero Data Loss Guarantee:** Every submission is strictly appended to the bottom (`getLastRow() + 1`) of both the individual faculty tab and the `Master_Daily_Report`. Historical entries from past dates are never cleared, overwritten, or modified.
- **Concurrency Mutex:** `LockService.getScriptLock()` serializes concurrent submissions safely.
- **Tab Routing:** Checks if an individual sheet tab matching the faculty name (`safeTabName`) exists. If it exists, appends rows; **if not, it creates it**—guaranteeing **zero duplicate tabs**.
- **Master Report:** Simultaneously appends formatted rows to the `Master_Daily_Report` sheet (`S.No`, `Timestamp`, `Date`, `Name of the Faculty`, `Section`, `Course Name`, `Credits`, `Class Hour`, `Unit No`, `Topic Name`).

---

## 4. Tech Stack & Environment Variables
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **Hosting:** Vercel (Production deployment).
- **Database / Storage:** Google Sheets via Google Apps Script Web App URL.
- **Authentication:** Firebase Auth (Google Sign-In, restricted via email whitelist).
- **Required `.env` Variables:**
  - `VITE_APPS_SCRIPT_URL`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`

---

## 5. Architectural & Data Integrity Rules (Zero Data Loss)

- **Rule 5.1 (Append-Only Persistence):** Under no circumstances shall an incoming log submission overwrite, clear, or truncate existing data. All writes to individual faculty tabs and the `Master_Daily_Report` must use an append-only operation (`getLastRow() + 1`).
- **Rule 5.2 (Concurrency Locking):** The backend Google Apps Script must enforce `LockService.getScriptLock()` with a minimum wait timeout (e.g., 30 seconds) to prevent race conditions when multiple faculty members submit logs simultaneously.
- **Rule 5.3 (Tab Name Sanitization):** Faculty names must be cleaned and truncated (max 95 characters, removing invalid characters like `:`, `/`, `?`, `*`, `[`, `]`) to prevent Google Sheets sheet creation crashes.

---

## 6. Authentication & Role Security Rules

- **Rule 6.1 (Strict Privilege Separation):** Firebase Google Authentication must be restricted **exclusively** to the HoD and administrative portal (`hodit@matrusri.edu.in`, `abhiramravula7@gmail.com`, and the dynamic AHoD slot).
- **Rule 6.2 (Unauthenticated Public Submissions):** Regular faculty members and programmers must **never** be forced to sign in with Firebase just to submit their daily logs. Submissions must fire unauthenticated POST requests directly to the Apps Script Web App endpoint.
- **Rule 6.3 (UI Feature Gating):** The header "Sheets" configuration button, setup URLs, and raw data export configurations must be hidden in the DOM for any user who is not authenticated via the admin whitelist.

---

## 7. High-Risk Edge Cases & Mitigations

- **Edge Case 7.1 (Local vs. Remote State Drift):** The app must not clear `localStorage` drafts prematurely. If a network failure occurs, offline drafts remain intact until a confirmed submission succeeds.
- **Edge Case 7.2 (CORS & Google Apps Script Redirects):** Frontend `fetch()` requests to Google Apps Script Web Apps handle `redirect: 'follow'` and include a graceful `mode: 'no-cors'` fallback to prevent unhandled network exceptions on 302 redirects.
- **Edge Case 7.3 (Duplicate Tab Creation on Rapid Clicks):** Tab existence checks (`ss.getSheetByName()`) run inside the active `LockService` mutex to prevent duplicate tab creation on rapid simultaneous submissions.

---

## 8. Mandatory Production Test Cases

### **Test Case 1: Historical Data Preservation (The Golden Rule)**
- **Scenario:** Faculty member *Srinivas* submits a log today (`18-09-2026`). Yesterday's log (`17-09-2026`) already exists in his sheet tab.
- **Expected Result:** The new row is appended at row `N + 1`. Rows for `17-09-2026` remain completely intact, unmodified, and visible.

### **Test Case 2: Zero-Login Public Submission**
- **Scenario:** Open the app in an incognito window (where no Firebase admin login has occurred). Select programmer *Mounika*, fill out slots, and click "Submit Today's Complete Log".
- **Expected Result:** The app successfully POSTs data to Google Sheets and shows a success toast, **without** throwing a login prompt or Firebase authentication error.

### **Test Case 3: Admin Whitelist Enforcement**
- **Scenario:** An unauthorized user tries to sign in using a personal Gmail account (`unauthorized@gmail.com`) via the Admin Portal modal.
- **Expected Result:** Firebase authenticates the Google popup, but the application immediately evaluates the email against the whitelist, rejects entry, displays an "Access Denied" modal, and keeps administrative sheet settings hidden.

### **Test Case 4: Concurrent Submissions Lock Test**
- **Scenario:** Two programmers (*Ramesh Kumar* and *Girija*) submit their daily logs at the exact same millisecond.
- **Expected Result:** `LockService` serializes the requests. Both logs successfully append to their respective sheets and the `Master_Daily_Report` without throwing a Google Apps Script concurrency error or creating corrupted rows.

