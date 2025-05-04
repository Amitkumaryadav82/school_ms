# School Management System Deployment Guide

This document provides comprehensive instructions for deploying the School Management System as a monolithic application in various environments.

## System Requirements

- Java 17 or higher
- PostgreSQL 15.x
- Docker and Docker Compose (recommended)
- 2 CPU cores minimum (4+ recommended for production)
- 4GB RAM minimum (8GB+ recommended for production)
- 20GB storage minimum

## Deployment Options

### Option 1: Docker Deployment (Recommended)

The recommended deployment method is using Docker and Docker Compose, which provides:
- Consistent environment across development, testing, and production
- Easy scaling and management
- Built-in monitoring and health checks

#### Steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-organization/school-management-system.git
   cd school-management-system
   ```

2. **Configure environment variables** (optional):
   Create a `.env` file in the root directory with custom configurations:
   ```
   POSTGRES_DB=school_db
   POSTGRES_USER=dbuser
   POSTGRES_PASSWORD=securepassword
   SPRING_PROFILES_ACTIVE=prod
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secureAdminPassword
   ```

3. **Build and start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Web UI: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html
   - PgAdmin: http://localhost:5050 (email: admin@school.com, password: admin)

5. **Monitor the application**:
   - Logs: `docker-compose logs -f app`
   - Health: http://localhost:8080/actuator/health
   - Metrics: http://localhost:8080/actuator/metrics

### Option 2: Manual Deployment

For environments where Docker is not available, you can deploy the application manually.

#### Prerequisites:
- Java 17+ installed
- PostgreSQL 15.x installed and running
- Maven 3.8+ installed (for building)

#### Steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-organization/school-management-system.git
   cd school-management-system
   ```

2. **Build the application**:
   ```bash
   cd school-ms/backend/school-app
   mvn clean package -DskipTests
   ```

3. **Configure database**:
   - Create a PostgreSQL database named `School_db`
   - Run the schema and data scripts:
     ```bash
     psql -U postgres -d School_db -f ../../backend/schema.sql
     psql -U postgres -d School_db -f ../../backend/dummy_data.sql
     ```

4. **Run the application**:
   ```bash
   java -jar target/school-app-1.0.0.jar --spring.profiles.active=prod
   ```

5. **Access the application**:
   - Web UI: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html

## Configuration Options

The application can be configured using environment variables or by modifying `application.properties`:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `spring.datasource.url` | Database URL | jdbc:postgresql://localhost:5432/School_db |
| `spring.datasource.username` | Database username | postgres |
| `spring.datasource.password` | Database password | Devendra_82 |
| `spring.profiles.active` | Active Spring profile | dev |
| `server.port` | Server port | 8080 |
| `jwt.secret` | JWT secret key | [Generated secure key] |
| `jwt.expiration` | JWT expiration time (ms) | 86400000 (24h) |

## Production Considerations

### Security

1. **Change default credentials**:
   - Update the default database password
   - Change the admin user credentials
   - Set a strong JWT secret key

2. **Enable HTTPS**:
   - Generate SSL/TLS certificates
   - Configure HTTPS in application-prod.properties:
     ```
     server.ssl.key-store=classpath:keystore.p12
     server.ssl.key-store-password=your-keystore-password
     server.ssl.key-store-type=PKCS12
     server.ssl.key-alias=tomcat
     server.ssl.enabled=true
     ```

3. **Firewall configuration**:
   - Expose only necessary ports (8080 for HTTP/HTTPS)
   - Restrict database access to application server only

### Performance Tuning

1. **JVM settings**:
   ```
   -Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
   ```

2. **Database connection pool**:
   - Adjust values in application-prod.properties based on load:
     ```
     spring.datasource.hikari.maximum-pool-size=15
     spring.datasource.hikari.minimum-idle=5
     ```

3. **Caching**:
   - Adjust cache sizes in CacheConfig.java for your specific workload

### Monitoring

The application includes built-in monitoring capabilities:

- **Actuator endpoints**: `/actuator/health`, `/actuator/metrics`, `/actuator/info`
- **Logging**: Configure log aggregation to collect logs from `/logs` directory 
- **Metrics**: The application exports metrics that can be scraped by Prometheus

### Backup and Recovery

1. **Database backups**:
   ```bash
   # Daily backup script example
   pg_dump -U postgres -d School_db > school_db_$(date +%Y-%m-%d).sql
   ```

2. **Application data**:
   - Backup the uploaded files directory regularly
   - Consider versioning configuration files

## Troubleshooting

### Common Issues

1. **Application fails to start**:
   - Check database connectivity
   - Verify port availability
   - Check logs in `/logs/school-app.log`

2. **Performance issues**:
   - Check database query performance
   - Examine API performance metrics
   - Review JVM memory usage

3. **Authentication problems**:
   - Verify JWT secret configuration
   - Check user credentials in database

### Support

For technical support, please contact:
- Email: support@school-ms.com
- Issue tracker: https://github.com/your-organization/school-management-system/issues