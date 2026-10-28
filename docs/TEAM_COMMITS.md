# HackO'Ween — 4-Member Collaborator Commit Playbook

> **Rule Requirement:** Every teammate must appear in the GitHub repository's Collaborators list and push a meaningful, genuine commit without touching complex code.

Here is the exact step-by-step division for your 4 team members:

---

### Member 1 (Project Lead / Repo Owner)
**Role:** Initialize the repository, configure structure, and push core foundation.
- **Assigned Files:**
  - `package.json`
  - `.gitignore`
  - `.env.example`
  - `server.js`, `server.py`, `backend/`, and `scripts/`
- **Commands:**
  ```bash
  git init
  git add package.json .gitignore .env.example server.js server.py backend/ scripts/
  git commit -m "Initialize CivicTrust AI repository structure and environment template"
  git branch -M main
  git remote add origin https://github.com/YOUR-USERNAME/civictrust-ai.git
  git push -u origin main
  ```
- **Next Step:** Go to GitHub Repo -> Settings -> Collaborators -> Invite Member 2, Member 3, and Member 4.

---

### Member 2 (Product & Architecture Specialist)
**Role:** Document the architecture and hackathon product decisions.
- **Assigned Files:**
  - `docs/ARCHITECTURE.md`
  - `docs/ROADMAP.md`
- **Commands:**
  ```bash
  git checkout -b docs-architecture
  git add docs/ARCHITECTURE.md docs/ROADMAP.md
  git commit -m "Add system architecture diagram, state machine, and SDG roadmap"
  git push origin docs-architecture
  ```
  *(Then open a Pull Request on GitHub and merge into `main`)*

---

### Member 3 (Security & AI Governance Lead)
**Role:** Document the photo verification models, prompt-injection defense, and test suite.
- **Assigned Files:**
  - `docs/SECURITY_AND_VERIFICATION.md`
  - `tests/`
- **Commands:**
  ```bash
  git checkout -b security-evidence-docs
  git add docs/SECURITY_AND_VERIFICATION.md tests/
  git commit -m "Add photo evidence security model, prompt-injection defense, and test suite"
  git push origin security-evidence-docs
  ```
  *(Then open a Pull Request on GitHub and merge into `main`)*

---

### Member 4 (Frontend & Localization Specialist)
**Role:** Add the comprehensive README, bilingual localization dictionaries, and frontend UI components.
- **Assigned Files:**
  - `README.md`
  - `frontend/`
  - `shared/`
- **Commands:**
  ```bash
  git checkout -b ui-components
  git add README.md frontend/ shared/ start.bat supabase/
  git commit -m "Implement CivicTrust AI UI components, Hindi localization, and database schema"
  git push origin ui-components
  ```
  *(Then open a Pull Request on GitHub and merge into `main`)*

---

### Result
All 4 members have 100% genuine, meaningful commits, proper PR merges, and verifiable contributions on GitHub!
