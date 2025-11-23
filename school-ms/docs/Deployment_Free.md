# School MS — AWS Free Tier Deployment (Test/POC)

This guide shows how to deploy one school on AWS Free Tier so you can test without Lightsail. It uses:
- EC2 t2.micro or t3.micro (750 hours/month for 12 months)
- Local PostgreSQL on the same EC2 instance (simplest) or optional RDS Free Tier
- Spring Boot backend (serves the React frontend on the same origin)

Keep this for testing/POC; move to Lightsail or paid EC2 for production.

---

## At-a-glance architecture
- One EC2 (Ubuntu 22.04 LTS), security group allows 22/80/443
- Java 17 + PostgreSQL on the instance
- Spring Boot serves the built React UI (same origin)
- Optional: Caddy reverse proxy for automatic HTTPS with Let’s Encrypt

Cost guardrails (first 12 months):
- EC2: 750 hours/month (1 instance) — choose t2.micro or t3.micro
- EBS: 30 GB gp3 total across volumes
- Data transfer: free tier includes some outbound; keep usage low

---

# Preparing EC2 environment
sudo apt-get update
sudo apt-get -y install openjdk-17-jdk
which jar
jar --version



## Variables (decide per school)
Use these placeholders consistently.

- SCHOOL_CODE: short slug, e.g., `demo1`
- DOMAIN: optional (or use public IP), e.g., `demo1.example.com`
- DB_NAME: e.g., `school_demo1`
- DB_USER: e.g., `school_demo1`
- DB_PASSWORD: strong password

Windows PowerShell (local):
```powershell
  $SCHOOL_CODE = "greenwood"
  $DOMAIN      = "greenwood.example.com"  # or leave empty to use IP
  $DB_NAME     = "school_$SCHOOL_CODE"
  $DB_USER     = "school_$SCHOOL_CODE"
  $DB_PASSWORD = "Devendra_82"
```

---

## 1) Create the EC2 instance (Free Tier)
1. EC2 Console → Launch instance
   - Name: `school-$SCHOOL_CODE`
   - AMI: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - Instance type: `t2.micro` or `t3.micro`
   - Key pair: create/download a new one or reuse an existing key
   - Network: default VPC
   - Security group (create new): allow
     - SSH (22) from your IP
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0 (if you plan TLS)
   - Storage (EBS): 10–16 GB gp3 (keep ≤30 GB total for Free Tier)
2. Launch
3. (Optional) Allocate an Elastic IP and associate with the instance (free while attached)

Tip: To avoid SSH key management, you can use EC2 Instance Connect from the console.

---

## 2) Bootstrap the server (Ubuntu)
SSH to the instance (replace `<EC2_PUBLIC_IP>` and key path):
```bash
ssh -i ~/.ssh/<your-key>.pem ubuntu@<EC2_PUBLIC_IP>
```
Install Java and PostgreSQL (local DB):
```bash
sudo apt-get update
sudo apt-get -y install openjdk-17-jre-headless postgresql
```

Create the database and user:
```bash
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
```

---

## 3) Build artifacts locally
From your development machine.

Frontend (from `frontend/`):
```powershell
npm ci
npm run build
```
robocopy dist backend\school-app\src\main\resources\static /E


Backend (from `backend/school-app`):
```powershell
mvn clean package -DskipTests
```

Result: `backend/school-app/target/school-app-1.0.0.jar`

If your jar does not already include the React build, copy `frontend/dist` into `backend/school-app/src/main/resources/static` and rebuild.

---

## 4) Upload the jar to EC2
# Install AWS CLI v2 if not present
sudo apt-get update
sudo apt-get -y install unzip curl
curl -Ls https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip
unzip awscliv2.zip
sudo ./aws/install
aws --version

# Download jar from S3 (replace bucket/key)
aws s3 cp s3://<bucket-name>/deploy/school-app-1.0.0.jar /home/ubuntu/school-app.jar

# Optional: keep versioned copy
cp /home/ubuntu/school-app.jar /home/ubuntu/school-app-1.0.0.jar

## 5) Configure app environment
On the server:
```bash
cat >/home/ubuntu/school.env <<'EOF'
DB_URL=jdbc:postgresql://localhost:5432/school_greenwood
DB_USER=school_greenwood
DB_PASSWORD=Devendra_82
JWT_SECRET=GENERATE_A_64B_RANDOM_SECRET
SERVER_PORT=8080
# If UI is separate, set allowed origins; if same-origin, you can keep it minimal
ALLOWED_ORIGINS=http://51.21.149.103
# CORS_ALLOWED_ORIGIN_PATTERNS=https://*.example.com
JAVA_TOOL_OPTIONS=-Xms256m -Xmx384m -XX:+UseSerialGC
EOF
chmod 600 /home/ubuntu/school.env
# Verify the file exists and contents look correct
ls -l /home/ubuntu/school.env
sed -n '1,120p' /home/ubuntu/school.env
```
Replace placeholders `${DB_NAME}`, `${DB_USER}`, `${DB_PASSWORD}`, and ALLOWED_ORIGINS with actual values.

---
#  Must run to set the correct JWT size
# 1. Generate a 512-bit base64 secret
NEW_SECRET=$(openssl rand -base64 64)
sudo sed -i '/^JWT_SECRET=/d' /home/ubuntu/school.env
echo "JWT_SECRET=${NEW_SECRET}" | sudo tee -a /home/ubuntu/school.env >/dev/null

# 3. (Optional) Show length for sanity (should be >= 86 chars base64 including padding)
grep JWT_SECRET /home/ubuntu/school.env | awk -F= '{print \"Secret length:\" length($2)}'

# 4. Restart the app
sudo systemctl restart school-app

# 5. Check status and recent logs for absence of WeakKeyException
systemctl is-active school-app
journalctl -u school-app -n 50 --no-pager | grep -i WeakKeyException || echo "No WeakKeyException found"

# 6. Health check
curl -fsS http://localhost:8080/actuator/health || echo "Health check failed"


## 6) Create a systemd service
```bash
sudo bash -c 'cat >/etc/systemd/system/school-app.service <<SYSTEMD
[Unit]
Description=School App ($SCHOOL_CODE)
After=network.target postgresql.service

[Service]
User=ubuntu
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

# to check the live logs:
journalctl -u school-app -f


Now browse `http://<EC2_PUBLIC_IP>:8080/` (or port 80/443 after proxy setup below).

---

## 7) Optional: Domain + TLS
### Option A — Caddy (auto HTTPS)
```bash
sudo apt-get -y install debian-keyring debian-archive-keyring apt-transport-https curl
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get -y install caddy

sudo bash -c 'cat >/etc/caddy/Caddyfile <<CADDY
$DOMAIN {
  encode zstd gzip
  reverse_proxy localhost:8080
}
CADDY'

sudo systemctl enable caddy
sudo systemctl restart caddy
```
Make sure `${DOMAIN}` A record points to the EC2 public IP.

### Option B — Cloudflare proxy
- Point an A record to the EC2 IP and enable the orange cloud.
- Keep the app on port 80/8080; Cloudflare provides HTTPS to users. (Add origin TLS later.)

---

## 8) Backups (local rotation)
```bash
sudo mkdir -p /var/backups
sudo bash -c 'cat >/etc/cron.daily/pg-backup <<CRON
#!/bin/bash
set -e
TS=$(date +%F)
sudo -u postgres pg_dump ${DB_NAME} | gzip > /var/backups/${DB_NAME}-${TS}.sql.gz
find /var/backups -name "${DB_NAME}-*.sql.gz" -mtime +7 -delete
CRON'
sudo chmod +x /etc/cron.daily/pg-backup
```

(Free Tier note: You can also store small backups in S3; keep total GB low to avoid charges.)

---

## 9) Health checks and logs
- Health: `http(s)://<IP or domain>/actuator/health`
- Logs:
```bash
journalctl -u school-app -e --no-pager
```

---

## 10) Updates
Copy a new jar and restart:
```powershell
scp -i ~/.ssh/<your-key>.pem `
  backend/school-app/target/school-app-1.0.0.jar `
  ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/school-app.jar
ssh -i ~/.ssh/<your-key>.pem ubuntu@<EC2_PUBLIC_IP> "sudo systemctl restart school-app && systemctl status school-app --no-pager"
```

---

## 11) Optional: Use RDS Free Tier instead of local Postgres
Pros: easier DB upgrades and snapshots. Cons: more moving parts.

1. Create RDS PostgreSQL:
   - Engine: PostgreSQL Free Tier
   - Instance: `db.t3.micro`
   - Storage: ≤20 GB (Free Tier)
   - Public access: No (recommended). Put EC2 and RDS in same VPC/subnets.
   - Security group: allow inbound PostgreSQL (5432) from the EC2 security group
2. Note the RDS endpoint and set in `/home/ubuntu/school.env`:
   ```
   DB_URL=jdbc:postgresql://<rds-endpoint>:5432/<db-name>
   DB_USER=<db-user>
   DB_PASSWORD=<db-password>
   ```
3. Restart the app: `sudo systemctl restart school-app`

This can still fit Free Tier if you keep one EC2 and one RDS within the monthly 750 hours each.

---

## 12) Free Tier safeguards
- Create a billing alarm at $5
- Stop/terminate unused instances and delete unattached EBS volumes and Elastic IPs
- Keep EBS storage ≤30 GB; prune backups
- Avoid large outbound traffic

---

## 13) Teardown (avoid charges)
- Terminate EC2
- Delete associated EBS volumes, snapshots, and Elastic IPs
- Delete RDS (if created) and snapshots
- Remove S3 objects (if used)

---

## Troubleshooting quick tips
- 502/Bad Gateway behind Caddy: check `systemctl status school-app` and logs
- 403/CORS in browser: ensure same-origin or update `ALLOWED_ORIGINS`
- Out of memory: lower `-Xmx`, or stop Postgres and use RDS
- App not serving frontend: ensure React build is packaged into the jar/static

Happy testing on Free Tier! Keep an eye on the Billing dashboard.
