# CivicTrust AI — Strategic Roadmap

### Phase 1: Hackathon Prototype (Completed & Tested)
- [x] Responsive Citizen Intake form with GPS coordinates and live file validation.
- [x] Unique Complaint Reference ID generator (`CT-2026-XXXX`).
- [x] Real-time SLA Countdown Engine with multi-tier overdue triggers.
- [x] Transparent multi-factor duplicate detection (Category + Haversine + Time + Tokens).
- [x] Adversarial Prompt-Injection Defense filter.
- [x] Perceptual Hash (pHash) Before/After comparison to prevent reused photo fraud.
- [x] Citizen Dispute / Reopen flow if ground repairs contradict evidence.
- [x] Officer & Administrator Governance Dashboards with immutable audit logging.
- [x] Bilingual English & Hindi UI support.
- [x] Zero-dependency local server runner (Python & Node.js).

### Phase 2: Production Cloud Backend (Design Ready)
- [ ] Connect Supabase PostgreSQL adapter with Row Level Security (schema ready in `supabase/migrations/`).
- [ ] Supabase Auth with OAuth 2.0 (Google, Aadhaar/DigiLocker SSO).
- [ ] Secure AWS S3 / Supabase Storage private buckets with signed 15-minute access URLs.
- [ ] WhatsApp / SMS webhook integration for low-bandwidth citizen updates.

### Phase 3: Advanced AI & Forensic Vision
- [ ] Gemini 1.5 Pro / Flash Multimodal Vision integration for deep road crack depth analysis.
- [ ] Perceptual DCT & Blockhash library integration with automated EXIF tampering detection.
- [ ] Automated drone survey aerial photo verification for municipal road re-paving projects.

### Phase 4: Smart City IoT Integrations
- [ ] Water flow sensor telemetry integration to automatically cross-verify pipeline burst reports.
- [ ] Smart streetlight power grid telemetry for automated outage detection.
- [ ] Municipal SCADA system bridge.
