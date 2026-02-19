# Production Deployment Guide

## 🚀 Application Status: PRODUCTION READY

Your school management system is now configured for production deployment.

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Database schema finalized
- [x] User authentication working
- [x] Frontend built successfully (0 errors)
- [x] Backend compiled and tested
- [x] Security configurations updated
- [x] Logging configured for production
- [x] CORS configured with environment variables
- [x] Error messages sanitized (no stack traces exposed)

### ⚠️ Before Going Live
- [ ] Change JWT secret (see instructions below)
- [ ] Update CORS allowed origins for your domain
- [ ] Change admin password from "password" to secure password
- [ ] Configure database connection for production
- [ ] Set up SSL/TLS certificate
- [ ] Configure email settings (if using email features)

---

## 🔐 Security Configuration

### 1. JWT Secret (CRITICAL)

**Current**: Using placeholder secret  
**Action Required**: Generate a strong random key

```bash
# Generate a secure JWT secret (Linux/Mac/WSL)
openssl rand -base64 64

# Or use this online: https://www.grc.com/passwords.htm
```

**Set as environment variable**:
```bash
# Linux/Mac
export JWT_SECRET="your-generated-secret-here"

# Windows
set JWT_SECRET=your-generated-secret-here

# Or in application.properties for production
jwt.secret=your-generated-secret-here
```

### 2. Admin Password

**Current**: `password` (for testing)  
**Action Required**: Change after first login

```sql
-- Generate BCrypt hash for your secure password
-- Use online tool: https://bcrypt-generator.com/
-- Or use Java: new BCryptPasswordEncoder().encode("YourSecurePassword")

UPDATE users 
SET password_hash = 'YOUR_BCRYPT_HASH_HERE'
WHERE username = 'admin';
```

### 3. CORS Configuration

**Current**: Allows localhost  
**Action Required**: Set your production domain

```bash
# Set environment variable
export ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Or update application.properties
allowed.origins=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🗄️ Database Configuration

### For AWS RDS or Remote PostgreSQL

Set environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/school_db
export SPRING_DATASOURCE_USERNAME=your_db_user
export SPRING_DATASOURCE_PASSWORD=your_db_password
```

### Database Setup

1. **Create database**:
```sql
CREATE DATABASE school_db;
```

2. **Run consolidated script**:
```bash
psql -h your-db-host -U your_db_user -d school_db -f school-ms/consolidated_school_database.sql
```

---

## 📦 Build and Deploy

### Step 1: Build Frontend

```bash
cd school-ms/frontend
npm install
npm run build
```

**Output**: `dist/` folder with optimized production build

### Step 2: Copy Frontend to Backend

```bash
# Windows
robocopy dist ..\backend\school-app\src\main\resources\static /E

# Linux/Mac
cp -r dist/* ../backend/school-app/src/main/resources/static/
```

### Step 3: Build Backend JAR

```bash
cd ../backend/school-app
mvn clean package -DskipTests
```

**Output**: `target/school-app-1.0.0.jar` (single executable JAR)

### Step 4: Deploy

#### Option A: Run Directly
```bash
java -jar target/school-app-1.0.0.jar
```

#### Option B: Run with Environment Variables
```bash
java -jar target/school-app-1.0.0.jar \
  --spring.datasource.url=jdbc:postgresql://your-db:5432/school_db \
  --spring.datasource.username=dbuser \
  --spring.datasource.password=dbpass \
  --jwt.secret=your-secret \
  --allowed.origins=https://yourdomain.com
```

#### Option C: Run as System Service (Linux)

Create `/etc/systemd/system/school-app.service`:

```ini
[Unit]
Description=School Management System
After=network.target

[Service]
Type=simple
User=schoolapp
WorkingDirectory=/opt/school-app
ExecStart=/usr/bin/java -jar /opt/school-app/school-app-1.0.0.jar
Restart=on-failure
RestartSec=10

Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/school_db"
Environment="SPRING_DATASOURCE_USERNAME=postgres"
Environment="SPRING_DATASOURCE_PASSWORD=your_password"
Environment="JWT_SECRET=your_jwt_secret"
Environment="ALLOWED_ORIGINS=https://yourdomain.com"

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable school-app
sudo systemctl start school-app
sudo systemctl status school-app
```

---

## 🌐 Nginx Configuration (Recommended)

### Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### Configure Reverse Proxy

Create `/etc/nginx/sites-available/school-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Spring Boot
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/school-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔍 Health Checks

### Application Health
```bash
curl http://localhost:8080/actuator/health
```

### Database Connection
```bash
curl http://localhost:8080/actuator/health/db
```

---

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
tail -f application.log

# Search for errors
grep ERROR application.log

# Last 100 lines
tail -n 100 application.log
```

### Log Rotation
Logs automatically rotate at 10MB, keeping last 10 files (100MB total).

---

## 🚨 Troubleshooting

### Application Won't Start

1. **Check Java version**:
```bash
java -version  # Should be Java 17
```

2. **Check port availability**:
```bash
netstat -tuln | grep 8080
```

3. **Check database connection**:
```bash
psql -h your-db-host -U your_db_user -d school_db -c "SELECT 1;"
```

### Login Not Working

1. **Verify admin user exists**:
```sql
SELECT username, role, enabled FROM users WHERE username = 'admin';
```

2. **Check password hash**:
```sql
SELECT LENGTH(password_hash), LEFT(password_hash, 10) 
FROM users WHERE username = 'admin';
```
Should be 60 characters starting with `$2a$10$`

### CORS Errors

1. **Check allowed origins**:
```bash
grep allowed.origins application.properties
```

2. **Verify environment variable**:
```bash
echo $ALLOWED_ORIGINS
```

---

## 📱 Default Login Credentials

**Username**: `admin`  
**Password**: `password`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## 🎯 Production Checklist

Before going live, verify:

- [ ] Application starts without errors
- [ ] Can login with admin credentials
- [ ] Database connection working
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured for your domain
- [ ] JWT secret changed from default
- [ ] Admin password changed from "password"
- [ ] Logs are being written
- [ ] Health endpoint accessible
- [ ] Static files loading correctly
- [ ] API endpoints responding
- [ ] Error messages don't expose sensitive info

---

## 📞 Support

For issues or questions:
1. Check `application.log` for errors
2. Review this guide
3. Check `LOGIN-SUCCESS-SUMMARY.md` for authentication issues
4. Review `PERMANENT-FIXES-CHECKLIST.md` for configuration details

---

**Deployment Date**: January 27, 2026  
**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY
