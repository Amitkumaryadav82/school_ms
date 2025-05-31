# Connectivity Fixes

This document provides solutions to connectivity and dependency issues in the School Management System project.

## Maven Dependency Issues

### Apache POI and Commons CSV Dependencies

The backend build was failing with the following errors:

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0:compile (default-compile) on project school-app: Compilation failure: Compilation failure:
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/service/impl/TeacherAttendanceServiceImpl.java:[15,37] package org.apache.poi.xssf.usermodel does not exist
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/service/impl/TeacherAttendanceServiceImpl.java:[14,1] package org.apache.poi.ss.usermodel does not exist
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/util/CSVHelper.java:[5,30] package org.apache.commons.csv does not exist
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/util/CSVHelper.java:[6,30] package org.apache.commons.csv does not exist
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/util/CSVHelper.java:[7,30] package org.apache.commons.csv does not exist
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/util/CSVHelper.java:[8,30] package org.apache.commons.csv does not exist
```

**Solution**: Added the required dependencies to the `pom.xml` file:

```xml
<!-- Apache POI for Excel handling -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.3</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>

<!-- Apache Commons CSV for CSV file handling -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.10.0</version>
</dependency>
```

### Missing Class Import Issues

After adding the above dependencies, we encountered another issue:

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0:compile (default-compile) on project school-app: Compilation failure: Compilation failure:
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/service/impl/TeacherAttendanceServiceImpl.java:[390,13] cannot find symbol
[ERROR]   symbol:   class CellRangeAddressList
[ERROR]   location: class com.school.hrm.service.impl.TeacherAttendanceServiceImpl
[ERROR] :/Users/617062057/OneDrive - BT Plc/Desktop/School_MS/school-ms/backend/school-app/src/main/java/com/school/hrm/service/impl/TeacherAttendanceServiceImpl.java:[390,52] cannot find symbol
[ERROR]   symbol:   class CellRangeAddressList
[ERROR]   location: class com.school.hrm.service.impl.TeacherAttendanceServiceImpl
```

**Solution**: Added the missing import statement to the `TeacherAttendanceServiceImpl.java` file:

```java
import org.apache.poi.ss.util.CellRangeAddressList;
```

The class was available in the `poi-ooxml` dependency but needed the explicit import.

### How to Fix Similar Issues

1. Identify the missing package from the error message (e.g., `org.apache.poi.xssf.usermodel`)
2. Determine the Maven artifact needed (e.g., `poi-ooxml` for Excel)
3. Add the dependency to the `pom.xml` file with an appropriate version
4. Check if you need specific imports in your Java files (e.g., utility classes like `CellRangeAddressList`)
5. Run `mvn clean install` to rebuild the project

## Common Maven Dependencies

Here are some commonly used dependencies you might need to add:

```xml
<!-- JSON Processing -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version>
</dependency>

<!-- PDF Generation -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>

<!-- Excel Processing -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.3</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>

<!-- CSV Processing -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.10.0</version>
</dependency>
```

Remember to clean and rebuild your project after adding new dependencies:

```bash
mvn clean install
```