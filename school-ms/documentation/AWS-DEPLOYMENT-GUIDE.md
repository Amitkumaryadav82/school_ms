# AWS Deployment Guide - School Management System

## Overview
This guide covers deploying the School Management System as a monolithic application on AWS.

---

## Prerequisites

1. ✅ PostgreSQL database created (school_db)
2. ✅ Consolidated database script executed
3. ✅ Frontend built (`npm run build`)
4. ✅ Backend JAR built (`mvn clean package`)

---

## Local Testing with Production Profile

Before deploying to AWS, test the production configuration locally:

```bash
cd C:\Users\617062057\school_ms_kiro\school_ms\school-ms\backend\school-app

# Build the JAR
mvn clean package -DskipTests

# Run with production profile (uses local PostgreSQL)
cd target
java -jar school-app-1.0.0.jar
```

This will use:
- Local PostgreSQL: `jdbc:postgresql://localhost:5432/school_db`
- Username: `postgres`
- Password: `postgres`
- JWT Secret: Default development key
- CORS: `http://localhost:5173,http://localhost:3000`

---

## AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended - Easiest)

#### Step 1: Prepare Application

1. **Build the JAR:**
   ```bash
   cd school-ms/backend/school-app
   mvn clean package -DskipTests
   ```

2. **JAR location:** `target/school-app-1.0.0.jar`

#### Step 2: Create RDS PostgreSQL Database

1. Go to AWS RDS Console
2. Create PostgreSQL database:
   - Engine: PostgreSQL 15.x
   - Template: Free tier (for testing) or Production
   - DB instance identifier: `school-db`
   - Master username: `postgres`
   - Master password: `your_secure_password`
   - Database name: `school_db`
   - Public access: Yes (for initial setup)
   - VPC security group: Allow port 5432

3. **Note the endpoint:** `school-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`

#### Step 3: Load Database Schema

From your local machine:
```bash
psql -h school-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U postgres -d school_db -f consolidated_school_database.sql
```

#### Step 4: Create Elastic Beanstalk Application

1. Go to AWS Elastic Beanstalk Console
2. Create new application:
   - Application name: `school-management-system`
   - Platform: Java
   - Platform branch: Corretto 17
   - Upload your JAR: `school-app-1.0.0.jar`

3. Configure environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://school-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/school_db`
   - `SPRING_DATASOURCE_USERNAME`: `postgres`
   - `SPRING_DATASOURCE_PASSWORD`: `your_secure_password`
   - `JWT_SECRET`: `your_very_long_secure_random_jwt_secret_key_minimum_64_characters`
   - `JWT_EXPIRATION`: `86400000`
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.com`

4. Deploy!

---

### Option 2: AWS EC2 (More Control)

#### Step 1: Launch EC2 Instance

1. Go to EC2 Console
2. Launch instance:
   - AMI: Amazon Linux 2023
   - Instance type: t2.micro (free tier) or t2.small
   - Key pair: Create or select existing
   - Security group: Allow ports 22 (SSH), 8080 (application)

#### Step 2: Connect and Setup

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Java 17
sudo yum install java-17-amazon-corretto-devel -y

# Verify installation
java -version
```

#### Step 3: Upload JAR

From your local machine:
```bash
scp -i your-key.pem target/school-app-1.0.0.jar ec2-user@your-ec2-ip:~/
```

#### Step 4: Create Systemd Service

On EC2:
```bash
sudo nano /etc/systemd/system/school-app.service
```

Add:
```ini
[Unit]
Description=School Management System
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/school-app-1.0.0.jar
Restart=on-failure
RestartSec=10

# Environment variables
Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://your-rds-endpoint:5432/school_db"
Environment="SPRING_DATASOURCE_USERNAME=postgres"
Environment="SPRING_DATASOURCE_PASSWORD=your_password"
Environment="JWT_SECRET=your_secure_jwt_secret"
Environment="JWT_EXPIRATION=86400000"
Environment="ALLOWED_ORIGINS=https://your-frontend-domain.com"

[Install]
WantedBy=multi-user.target
```

#### Step 5: Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable school-app
sudo systemctl start school-app

# Check status
sudo systemctl status school-app

# View logs
sudo journalctl -u school-app -f
```

---

### Option 3: AWS ECS (Docker Container)

#### Step 1: Create Dockerfile

Create `school-ms/backend/school-app/Dockerfile`:

```dockerfile
FROM amazoncorretto:17-alpine
WORKDIR /app
COPY target/school-app-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Step 2: Build and Push to ECR

```bash
# Build Docker image
cd school-ms/backend/school-app
docker build -t school-app .

# Tag and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
docker tag school-app:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/school-app:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/school-app:latest
```

#### Step 3: Create ECS Task Definition

Use AWS Console or CLI to create task with environment variables.

---

## Environment Variables Reference

### Required for Production

| Variable | Example | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://rds-endpoint:5432/school_db` | RDS database URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `your_secure_password` | Database password |
| `JWT_SECRET` | `64+ character random string` | JWT signing key |
| `JWT_EXPIRATION` | `86400000` | Token expiration (24 hours in ms) |
| `ALLOWED_ORIGINS` | `https://yourdomain.com` | Frontend URL for CORS |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | Application port |
| `SPRING_PROFILES_ACTIVE` | `default` | Active profile |

---

## Security Best Practices

### 1. Generate Secure JWT Secret

```bash
# Generate a secure random key (64+ characters)
openssl rand -base64 64
```

Use this as your `JWT_SECRET` environment variable.

### 2. Use AWS Secrets Manager

Instead of hardcoding passwords:

```bash
# Store database password
aws secretsmanager create-secret \
    --name school-db-password \
    --secret-string "your_secure_password"

# Store JWT secret
aws secretsmanager create-secret \
    --name school-jwt-secret \
    --secret-string "your_jwt_secret"
```

Then reference in your application or systemd service.

### 3. Restrict Database Access

- Set RDS security group to only allow connections from your EC2/ECS instances
- Use private subnets for RDS
- Enable SSL/TLS for database connections

### 4. Use HTTPS

- Set up Application Load Balancer with SSL certificate
- Use AWS Certificate Manager for free SSL certificates
- Redirect HTTP to HTTPS

---

## Testing the Deployment

### 1. Health Check

```bash
curl http://your-server:8080/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

### 2. Test Login

```bash
curl -X POST http://your-server:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe_Initial1!"}'
```

### 3. Frontend Connection

Update your frontend environment to point to the backend:
```javascript
// In frontend .env or config
VITE_API_URL=https://your-backend-domain.com
```

---

## Monitoring and Logs

### CloudWatch Logs (Elastic Beanstalk/ECS)
- Automatically configured
- View in CloudWatch Console

### EC2 Systemd Logs
```bash
# View logs
sudo journalctl -u school-app -f

# Last 100 lines
sudo journalctl -u school-app -n 100
```

### Application Logs
The application logs to stdout, which is captured by:
- Elastic Beanstalk → CloudWatch
- EC2 systemd → journald
- ECS → CloudWatch

---

## Troubleshooting

### Application Won't Start

1. **Check logs:**
   ```bash
   sudo journalctl -u school-app -n 100
   ```

2. **Verify environment variables:**
   ```bash
   sudo systemctl show school-app | grep Environment
   ```

3. **Test database connection:**
   ```bash
   psql -h your-rds-endpoint -U postgres -d school_db
   ```

### Database Connection Issues

- Verify RDS security group allows inbound on port 5432
- Check RDS endpoint is correct
- Verify credentials
- Ensure RDS is publicly accessible (for testing) or in same VPC

### CORS Errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check frontend is using correct backend URL
- Ensure HTTPS is used if frontend is HTTPS

---

## Cost Optimization

### Free Tier Options
- **EC2:** t2.micro (750 hours/month free for 12 months)
- **RDS:** db.t2.micro (750 hours/month free for 12 months)
- **Elastic Beanstalk:** No additional charge (pay for underlying resources)

### Production Recommendations
- **EC2:** t2.small or t3.small
- **RDS:** db.t3.micro or db.t3.small
- **Enable Auto Scaling** for EC2/ECS based on load

---

## Next Steps

1. ✅ Test locally with production profile
2. ✅ Create RDS database
3. ✅ Load database schema
4. ✅ Deploy application (choose option above)
5. ✅ Configure environment variables
6. ✅ Test deployment
7. ✅ Set up monitoring
8. ✅ Configure backups (RDS automated backups)
9. ✅ Set up CI/CD (optional)

---

## Support

For issues or questions:
- Check application logs
- Verify environment variables
- Test database connectivity
- Review AWS service health

**Your application is now ready for AWS deployment!** 🚀
