# School MS — Per‑School AWS Deployment (≤ $10/month)

This guide standardizes a “one school = one small server” model on AWS Lightsail. Each server runs:
- Spring Boot backend (Java 17)
- React frontend served by the backend (same origin)
- Local PostgreSQL on the same instance

Target monthly cost: about $5 for the 1GB Lightsail plan (+ optional $1–3 for snapshots/S3). Keep everything on a single instance to stay under $10 per school.

## Architecture at a glance
- One Lightsail Ubuntu instance per school with static IP
- Postgres runs locally; app connects over localhost
- Optional Caddy reverse proxy for automatic HTTPS, or use Cloudflare proxy
- Daily local SQL backups with 14‑day retention; optional off‑instance push to S3

## Prerequisites
- AWS account with Lightsail access.
- Windows 10/11 with OpenSSH client (scp/ssh) or WinSCP; PowerShell for local commands.
- Locally installed: Java 17, Node.js 18+, Maven 3.9+.
- Optional domain (recommended) managed in Route53 or any DNS provider.

## Per‑school variables (decide these first)
We’ll reuse these names throughout. Replace with your values when running commands.

- SCHOOL_CODE: short slug for the school, e.g., greenwood
- DOMAIN: FQDN, e.g., greenwood.example.com (or use the public IP temporarily)
- DB_NAME: Postgres DB name, e.g., school_greenwood
- DB_USER: Postgres user, e.g., school_greenwood
- DB_PASSWORD: a strong password

PowerShell (local):
```powershell
$SCHOOL_CODE = "greenwood"
$DOMAIN      = "greenwood.example.com"
$DB_NAME     = "school_$SCHOOL_CODE"
$DB_USER     = "school_$SCHOOL_CODE"
$DB_PASSWORD = "ReplaceWith#A_Strong_Pwd"
```

## 1) Create the server (Lightsail)
1. Lightsail → Create instance → Linux/Unix → Ubuntu LTS → $5 (1GB RAM) plan.
2. Create a Static IP and attach it to the instance.
3. In Lightsail networking, allow TCP 22, 80, 443.

## 2) Install dependencies on the instance
SSH into the instance as ubuntu and run:
```bash
sudo apt-get update
sudo apt-get -y install openjdk-17-jre-headless postgresql
# Optional for auto-HTTPS (recommended)
sudo apt-get -y install debian-keyring debian-archive-keyring apt-transport-https curl
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get -y install caddy
```

## 3) Create the database
```bash
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
```

Memory note: the 1GB plan is sufficient for Spring Boot + Postgres if you keep JVM heap modest.

## 4) Build artifacts locally
Frontend (from `frontend/`):
```powershell
npm ci
npm run build
```

Backend (from `backend/school-app`):
```powershell
mvn clean package -DskipTests
```

Resulting file: `backend/school-app/target/school-app-1.0.0.jar`

If your build does not already package the frontend into the jar, copy `frontend/dist` to `backend/school-app/src/main/resources/static` and rebuild. After deploy, browsing `http://<DOMAIN or IP>/` should show the login page.

## 5) Upload the application JAR
Windows PowerShell (OpenSSH):
```powershell
scp backend/school-app/target/school-app-1.0.0.jar ubuntu@<STATIC_IP>:/home/ubuntu/school-app.jar
```

## 6) Configure environment for the app
Create an env file with secure permissions:
```bash
cat >/home/ubuntu/school.env <<'EOF'
DB_URL=jdbc:postgresql://localhost:5432/${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=GENERATE_A_64B_RANDOM_SECRET
SERVER_PORT=8080
# If serving UI elsewhere, list UI origins (comma-separated)
ALLOWED_ORIGINS=https://${DOMAIN}
# Or allow wildcard patterns
# CORS_ALLOWED_ORIGIN_PATTERNS=https://*.example.com
# Keep heap small on 1GB server
JAVA_TOOL_OPTIONS=-Xms256m -Xmx384m -XX:+UseSerialGC
EOF
chmod 600 /home/ubuntu/school.env
```

Then replace placeholders inside `/home/ubuntu/school.env` with the actual values for this school.

## 7) Systemd service
```bash
sudo bash -c 'cat >/etc/systemd/system/school-app.service <<SYSTEMD
[Unit]
Description=School App (${SCHOOL_CODE})
After=network.target postgresql.service

[Service]
User=ubuntu
Environment="DB_NAME=${DB_NAME}"
Environment="DB_USER=${DB_USER}"
Environment="DB_PASSWORD=${DB_PASSWORD}"
Environment="DOMAIN=${DOMAIN}"
EnvironmentFile=/home/ubuntu/school.env
ExecStart=/usr/bin/java $JAVA_TOOL_OPTIONS -jar /home/ubuntu/school-app.jar --spring.profiles.active=prod --server.port=${SERVER_PORT}
Restart=on-failure
RestartSec=5
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
SYSTEMD'

sudo systemctl daemon-reload
sudo systemctl enable school-app
sudo systemctl start school-app
sudo systemctl status school-app --no-pager
```

## 8) TLS and reverse proxy (two simple options)
Pick A or B. Both are free and keep you under budget.

### A) Caddy (auto‑HTTPS with Let’s Encrypt)
```bash
sudo bash -c 'cat >/etc/caddy/Caddyfile <<CADDY
${DOMAIN} {
  encode zstd gzip
  reverse_proxy localhost:8080
}
CADDY'
sudo systemctl enable caddy
sudo systemctl restart caddy
```

Notes:
- Ensure your DNS A record for `${DOMAIN}` points to the instance static IP before (re)starting Caddy.
- Caddy will obtain and renew certificates automatically.

### B) Cloudflare proxy (no server‑side TLS config)
- Point an A record at the static IP and enable the orange‑cloud proxy in Cloudflare.
- Keep the app on port 80/8080. Cloudflare provides HTTPS to users. You can add origin TLS later.

## 9) DNS
- Create/Update A record: `${DOMAIN} → <static ip>`.
- If you changed `ALLOWED_ORIGINS`/`CORS_ALLOWED_ORIGIN_PATTERNS`, restart the app:
```bash
sudo systemctl restart school-app
```

## 10) Backups (keep it simple)
Daily local rotation (14 days):
```bash
sudo mkdir -p /var/backups
sudo bash -c 'cat >/etc/cron.daily/pg-backup <<CRON
#!/bin/bash
set -e
ts=$(date +%F)
sudo -u postgres pg_dump ${DB_NAME} | gzip > /var/backups/${DB_NAME}-${ts}.sql.gz
find /var/backups -name "${DB_NAME}-*.sql.gz" -mtime +14 -delete
CRON'
sudo chmod +x /etc/cron.daily/pg-backup
```

Optional off‑instance copy to S3 (still under budget for small DBs):
```bash
sudo apt-get -y install awscli
aws configure  # access key with write to an s3://<your-bucket>/<SCHOOL_CODE>/ path
sudo bash -c 'cat >/etc/cron.daily/pg-backup-s3 <<CRON
#!/bin/bash
set -e
aws s3 sync /var/backups s3://<your-bucket>/${SCHOOL_CODE}/ --exclude "*" --include "${DB_NAME}-*.sql.gz"
CRON'
sudo chmod +x /etc/cron.daily/pg-backup-s3
```

Lightsail snapshots are another option (charged per GB‑month). Schedule weekly snapshots for quick disaster recovery if budget allows.

## 11) Health checks and logs
- Health: `http(s)://<domain or ip>/actuator/health`
- Uptime monitoring: UptimeRobot free plan is sufficient.
- Logs during troubleshooting:
```bash
journalctl -u school-app -e --no-pager
```

## 12) Updates (zero downtime not required)
Replace the JAR, then restart the service:
```powershell
scp backend/school-app/target/school-app-1.0.0.jar ubuntu@<STATIC_IP>:/home/ubuntu/school-app.jar
ssh ubuntu@<STATIC_IP> "sudo systemctl restart school-app && systemctl status school-app --no-pager"
```

If you use Caddy or Cloudflare, no changes are needed for TLS on app updates.

## 13) Replicate for another school quickly
Two easy approaches:

1) Snapshot method (few clicks):
   - From a known‑good instance, create a Lightsail snapshot.
   - Create a new instance from the snapshot; attach a new static IP.
   - SSH and update `/home/ubuntu/school.env` and the systemd Environment vars (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DOMAIN`).
   - Create a fresh Postgres DB/user with the new names (Section 3) and run the app; apply Flyway migrations on first start.
   - Update DNS and Caddyfile with the new domain.

2) Bootstrap script (fast repeatable):
   - Keep a small script that performs Section 2–7 automatically, using env vars for SCHOOL_CODE/DOMAIN.
   - Run it on a clean $5 Lightsail Ubuntu instance.

## Cost guidance (as of 2025)
- Lightsail 1GB instance: ~$5/month
- Static IP: free
- Data transfer: generous free tier; typical school usage fits
- Optional: S3 backup storage a few GB: $0.10–$0.50/month
- Optional: Lightsail snapshots: $0.05/GB‑month

Staying within $10/month per school is realistic if you keep everything on one instance and use the free TLS options.

---

## Notes and FAQs

### CORS
- When the frontend is served by the same app origin, CORS isn’t required. Keep `ALLOWED_ORIGINS` ready if you later host the UI separately.

### API base URL for a separately hosted UI
If you host the frontend outside the JAR:
1. Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://${DOMAIN}
   ```
2. Build the UI and upload to a static host or object storage with CDN.
3. Ensure backend `ALLOWED_ORIGINS` includes the UI domain.

### JVM heap sizing
- 1GB plan: `-Xmx384m` is safe. If you enable more features, test `-Xmx512m` but watch memory.

### Frontend packaging check
- After deploy, opening `https://<domain>/` should render the login page. If not, ensure the frontend build is packaged or served via your chosen proxy.

---

## Appendix A — Generate a single baseline migration from an existing DB

Goal: Extract CREATE scripts (tables, indexes, sequences, constraints, functions) from your existing PostgreSQL database into one SQL file you can use as Flyway baseline for new deployments.

Use pg_dump on the server:
```bash
sudo -u postgres pg_dump \
  --schema-only \
  --no-owner --no-privileges --no-comments --no-security-labels --no-tablespaces \
  --exclude-table=flyway_schema_history \
  -d ${DB_NAME} > /home/ubuntu/baseline_schema.sql
```

From Windows (PowerShell):
```powershell
& "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe" `
  --schema-only `
  --no-owner --no-privileges --no-comments --no-security-labels --no-tablespaces `
  --exclude-table=flyway_schema_history `
  --file baseline_schema.sql `
  --dbname "postgresql://$DB_USER:$DB_PASSWORD@<HOST>:5432/$DB_NAME"
```

Place the final file as `backend/school-app/src/main/resources/db/migration/V1__baseline_all.sql` for new installs, or configure Flyway baseline for existing DBs.

---

## Appendix B — About schema migrations (Flyway)

We use Flyway migrations in production so database structure is versioned and repeatable.

- Files live at: `backend/school-app/src/main/resources/db/migration`
- Naming: `V<N>__<description>.sql` (e.g., `V2__add_exam_tables.sql`)
- On startup (prod), Flyway runs pending migrations in order.

Example migration:
```sql
-- V2__add_exam_tables.sql
CREATE TABLE IF NOT EXISTS exam_schedule (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL,
  section_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  exam_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_exam_class_section ON exam_schedule(class_id, section_id);
```

Forward‑only: create new migrations to change or revert structures rather than editing old files.
