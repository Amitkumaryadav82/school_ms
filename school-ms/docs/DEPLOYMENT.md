# School MS – Deployment Guide (Per School, Low Cost)

This guide deploys one small AWS Lightsail instance per school (~$5/mo). It uses local PostgreSQL, runs the Spring Boot app, and serves the React build via the embedded server (you can add Nginx+TLS later).

## Prerequisites
- Domain (optional, you can use the public IP initially).
- Java 17 locally, Node.js 18+ to build frontend.
- AWS account and Lightsail access.

## 1) Create the server
1. AWS Lightsail → Create instance → Linux/Unix → Ubuntu LTS → 1GB plan.
2. Create a static IP and attach it to the instance.
3. SSH into the instance and install dependencies:
   ```bash
   sudo apt-get update && sudo apt-get -y install openjdk-17-jre-headless postgresql
   ```

## 2) Set up PostgreSQL
```bash
sudo -u postgres psql -c "CREATE DATABASE school_db ENCODING 'UTF8';"
sudo -u postgres psql -c "CREATE USER school_user WITH ENCRYPTED PASSWORD 'CHANGEME_STRONG';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_db TO school_user;"
```

## 3) Build artifacts (locally)
Frontend (TypeScript/React build):
```powershell
# from frontend/
npm ci
npm run build
```
Backend:
```powershell
# from backend/school-app
# Option A: full build with tests
mvn clean verify

# Option B: faster build, skip tests (use only if needed)
mvn clean package -DskipTests
```
Result: `backend/school-app/target/school-app-1.0.0.jar`

## 4) Upload the JAR
```powershell
scp backend/school-app/target/school-app-1.0.0.jar ubuntu@<LIGHTSAIL_IP>:/home/ubuntu/school-app.jar
```

## 5) Create environment file on server
```bash
cat >/home/ubuntu/school.env <<'EOF'
DB_URL=jdbc:postgresql://localhost:5432/school_db
DB_USER=school_user
DB_PASSWORD=CHANGEME_STRONG
JWT_SECRET=GENERATE_A_64B_RANDOM_SECRET
ALLOWED_ORIGINS=https://myschool.example.com,https://www.myschool.example.com
JAVA_TOOL_OPTIONS=-Xms256m -Xmx384m -XX:+UseSerialGC
EOF
chmod 600 /home/ubuntu/school.env
```

## 6) Create a systemd unit
```bash
sudo bash -c 'cat >/etc/systemd/system/school-app.service <<SYSTEMD
[Unit]
Description=School App
After=network.target postgresql.service

[Service]
User=ubuntu
EnvironmentFile=/home/ubuntu/school.env
ExecStart=/usr/bin/java $JAVA_TOOL_OPTIONS -jar /home/ubuntu/school-app.jar --spring.profiles.active=prod
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

## 7) DNS (optional now, recommended later)
- Add an A record: `myschool.example.com → <lightsail static ip>`.
- Update `ALLOWED_ORIGINS` in `/home/ubuntu/school.env`, then restart:
  ```bash
  sudo systemctl restart school-app
  ```

## 8) Backups (simple local rotation)
```bash
sudo bash -c 'cat >/etc/cron.daily/pg-backup <<CRON
#!/bin/bash
ts=$(date +%F)
sudo -u postgres pg_dump school_db | gzip > /var/backups/school_db-$ts.sql.gz
find /var/backups -name "school_db-*.sql.gz" -mtime +14 -delete
CRON'
sudo chmod +x /etc/cron.daily/pg-backup
```

## 9) Health checks
- Probe `http(s)://<host>/actuator/health`.
- Optional UptimeRobot monitor.

## 10) Updates
```bash
# copy new jar
scp backend/school-app/target/school-app-1.0.0.jar ubuntu@<LIGHTSAIL_IP>:/home/ubuntu/school-app.jar
# restart
ssh ubuntu@<LIGHTSAIL_IP> "sudo systemctl restart school-app && systemctl status school-app --no-pager"
```

## Notes

## Appendix A — Generate a single baseline migration from an existing DB

Goal: Extract CREATE scripts (tables, indexes, sequences, constraints, functions) from your existing PostgreSQL database into one SQL file you can use as Flyway baseline for new deployments.

## Appendix B — No Postgres yet? Generate it from your H2/JPA model

If you are still on H2 only, you can have Hibernate generate a fresh PostgreSQL schema directly from the current JPA entities:

1) Install PostgreSQL locally and create an empty DB/user (see steps in the main guide).

2) Use the provided temporary profile `pg-gen` to create the schema in Postgres:
```powershell
Option 1: Run on the server (Ubuntu)
```bash
# Dumps only schema (no data), portable (no owner/privileges), and excludes Flyway history
This uses `application-pg-gen.properties` to point Hibernate at Postgres with `spring.jpa.hibernate.ddl-auto=create`, so it creates tables, PKs, FKs, and sequences.

3) Export that schema into a Flyway baseline file using pg_dump (see Appendix A). Rename the output to `V1__baseline_all.sql` and place it under `src/main/resources/db/migration`.

4) Switch to the normal prod profile (Postgres + Flyway) for real deployments.

sudo -u postgres pg_dump \
  --schema-only \
  --no-owner --no-privileges --no-comments --no-security-labels --no-tablespaces \
  --exclude-table=flyway_schema_history \
  -d school_db > /home/ubuntu/baseline_schema.sql
```

Option 2: Run from Windows (PowerShell)
```powershell
# If psql/pg_dump is installed (e.g., C:\Program Files\PostgreSQL\16\bin)
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" `
  --schema-only `
  --no-owner --no-privileges --no-comments --no-security-labels --no-tablespaces `
  --exclude-table=flyway_schema_history `
  --file baseline_schema.sql `
  --dbname "postgresql://school_user:CHANGEME_STRONG@<HOST>:5432/school_db"
```

Clean up (optional): The options above already minimize non-portable statements. If you still want to strip any remaining SET lines:
```powershell
Get-Content baseline_schema.sql | Where-Object { $_ -notmatch '^(SET|SELECT pg_catalog.set_config)' } | Set-Content V1__baseline_all.sql
```

Use with Flyway
- Place the file in the repo as:
  `backend/school-app/src/main/resources/db/migration/V1__baseline_all.sql`
- New installations: Flyway will run `V1__baseline_all.sql` to create the schema from scratch.
- Existing installation you are now bringing under Flyway:
  - Configure once (prod):
    - spring.flyway.baseline-on-migrate=true
    - spring.flyway.baseline-version=1
  - Start the app. Flyway will detect existing objects and create a baseline entry at version 1 without running V1.
  - From now on, add `V2__*.sql`, `V3__*.sql`, etc., for changes.

Notes
- pg_dump captures sequences, constraints, indexes, views, functions, and triggers present in the selected schema(s).
- If you use multiple schemas, add `--schema=public --schema=other_schema` or omit to dump all.
- Avoid `CREATE EXTENSION` unless you truly need it on targets.
- Keep baseline forward-only. To revert changes, create a new migration that undoes them.

---

## How schemas, tables, sequences, and other DB objects are created

We use Flyway migrations in production so database structure is versioned and repeatable.

- Migration files live at: `backend/school-app/src/main/resources/db/migration`
- Naming: `V<N>__<description>.sql` (e.g., `V1__baseline_timetable.sql`, `V2__add_staff_indexes.sql`)
- On application startup (prod profile), Flyway runs any pending migrations in order.

What’s already included:
- `V1__baseline_timetable.sql` adds:
  - Unique constraint to ensure a class/section/day/period is only used once.
  - Partial unique index to prevent teacher double-booking the same day/period.
  - Helpful indexes for common lookups.

Dev vs Prod:
- Dev uses H2 in-memory with `data.sql` to seed demo data. This is convenient for local testing.
- Prod uses PostgreSQL with Flyway enabled. `data.sql` is disabled in prod (`spring.sql.init.mode=never`).

Adding new objects (tables/sequences/indexes) for prod:
1. Create a new migration file, e.g. `V2__add_exam_tables.sql` under `db/migration`.
2. Put all DDL there (CREATE TABLE/INDEX/SEQUENCE, ALTER TABLE, etc.).
3. Build and deploy; on startup, Flyway applies `V2` automatically.

Example migration snippet:
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

Schema considerations:
- We use the default `public` schema; if you introduce multiple schemas, prefix objects (e.g., `school.exam_schedule`) and configure `spring.jpa.properties.hibernate.default_schema` as needed.
- Sequences: Postgres auto-creates BIGSERIAL sequences; you can also `CREATE SEQUENCE` explicitly if required.

Rollback strategy:
- Flyway encourages forward-only migrations. If you need to "undo", create a new migration (e.g., `V3__revert_exam_schedule.sql`) that drops or alters objects accordingly.
