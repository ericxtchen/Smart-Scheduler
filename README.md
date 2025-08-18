# 📅 Smart Scheduler  

![Build](https://img.shields.io/github/actions/workflow/status/ericxtchen/Smart-Scheduler/ci.yml?label=CI%2FCD&logo=github)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)
![Database](https://img.shields.io/badge/Database-Supabase%20(Postgres)-3FCF8E?logo=supabase)
![AI Powered](https://img.shields.io/badge/AI-Hugging%20Face%20VLMs-FCC624?logo=huggingface)

An AI-powered web application that centralizes **course schedules, study sessions, and productivity tools** into one smart calendar.  

Built with **React + TypeScript (frontend)**, **Node.js + Express + TypeScript (backend)**, and **Supabase (PostgreSQL)**, Smart Scheduler leverages **Vision-Language Models (VLMs)**, **prompt engineering**, and **intelligent preprocessing** to make managing academic life seamless.  

---

## 🚀 Features  

- **Calendar Integration**  
  - Import existing calendar events.  
  - Upload **screenshots of schedules** → automatically parsed into structured events using Hugging Face VLMs.  
  - Upload **PDF syllabi** → extract exam dates (midterms/finals) via `pdf-parse` + regex.  

- **Smart Event Processing**  
  - Image preprocessing + fallback system with tiered prompts ensures robust extraction.  
  - Prompt engineering with **well-defined output guidelines** and **example completions**.  

- **Centralized Study Hub**  
  - View all events with **FullCalendar** in an interactive UI.  
  - Integrated **Pomodoro timer** for upcoming events.  

- **Future Roadmap**  
  - Reminders & intelligent notifications.  
  - Deeper academic analytics (e.g., suggested study blocks, workload balance).  

---

## 🛠️ Tech Stack  

**Frontend**  
- React + TypeScript  
- FullCalendar (event visualization)  

**Backend**  
- Node.js + Express + TypeScript  
- Hugging Face VLMs (schedule extraction)  
- pdf-parse + Regex (syllabus parsing)  

**Database & Infrastructure**  
- Supabase (PostgreSQL)  
- CI/CD pipelines (GitHub Actions)  

---

## ⚡ Getting Started  

### Prerequisites  
- [Node.js](https://nodejs.org/) (v18+)  
- [Supabase](https://supabase.com/) account & project (for PostgreSQL DB)  

### Setup  

```bash
# 1. Clone the repo
git clone https://github.com/ericxtchen/Smart-Scheduler.git
cd Smart-Scheduler

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Run locally
# frontend
cd frontend
npm run dev

# backend
cd ../backend
npm run build && npm start
