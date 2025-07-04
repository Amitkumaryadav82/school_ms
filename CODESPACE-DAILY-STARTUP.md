# Daily Codespace Startup Guide

## Quick Start (One Command)
```bash
/workspaces/school_ms/start-dev.sh
```

## Manual Steps (if needed)
1. **Check Java Version**
   ```bash
   java -version
   ```
   (Should show Java 17)

2. **Start Application**
   ```bash
   cd /workspaces/school_ms/school-ms/backend/school-app
   mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081
   ```

## Access Points

### H2 Database Console
- **URL**: `http://localhost:8081/h2-console`
- **JDBC URL**: `jdbc:h2:mem:school_db`
- **Username**: `sa`
- **Password**: (leave blank)

### Application
- **Main URL**: `http://localhost:8081`
- **API Base**: `http://localhost:8081/api`

## What Happens Daily

### ✅ Preserved (Survives Codespace Restart)
- All source code files
- Configuration files (`application-dev.properties`, `pom.xml`, etc.)
- Maven dependencies cache
- Your development environment setup

### ❌ Lost (Needs Restart)
- H2 in-memory database data
- Running processes
- Application state

### 🔄 Data Persistence Strategy
Since H2 is in-memory, data is lost daily. For development:

1. **Use SQL scripts** for test data (put in `src/main/resources/data.sql`)
2. **Use @DataJpaTest** for unit testing with sample data
3. **Export/import data** when needed via H2 console
4. **Consider H2 file-based** for longer persistence (if needed)

## Troubleshooting

### If Application Won't Start
1. Check if port 8081 is in use: `netstat -tulpn | grep 8081`
2. Kill existing processes: `pkill -f spring-boot`
3. Try different port: `-Dserver.port=8082`

### If H2 Console Won't Load
1. Ensure application is fully started (check logs)
2. Try: `http://localhost:8081/h2-console`
3. Check console logs for errors

### If Schema Issues
- H2 recreates schema automatically with `spring.jpa.hibernate.ddl-auto=create-drop`
- Check entity annotations for issues
- Review application startup logs
