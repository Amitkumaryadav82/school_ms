# Permanent Maven Build Fix (PKIX / Flyway Dependency)

Your build fails with:
```
PKIX path building failed: SunCertPathBuilderException: unable to find valid certification path
```
This means Java (and therefore Maven) does not trust the TLS certificate presented when accessing Maven Central. Common causes:
- Corporate proxy / SSL interception (MITM) replacing certificates
- Missing root CA in the JDK truststore
- Security software filtering HTTPS traffic

## Goal
Enable `mvn clean package` (with Flyway dependency) to succeed locally without hacks. After this, you can deploy the jar to EC2 normally.

## 1. Identify JDK Used By Maven
```powershell
where java
java -XshowSettings:properties -version 2>&1 | findstr "java.home"
```
Note the `java.home` path (e.g. `C:\Program Files\Microsoft\jdk-17.0.10`).

## 2. Export Corporate / Proxy Root Certificate
Method A (Browser):
1. Visit `https://repo.maven.apache.org/maven2` in your browser.
2. View certificate chain; export the top (root/intermediate) custom CA as `corp-root.crt`.

Method B (OpenSSL):
```powershell
openssl s_client -showcerts -connect repo.maven.apache.org:443 <NUL > maven_certs.txt
# Manually copy the proxy/added root cert block (BEGIN CERTIFICATE ... END CERTIFICATE) into corp-root.crt
```

### If Browser & OpenSSL Fail
Sometimes corporate interception prevents a clean export, or OpenSSL is blocked. Use one of these alternatives:

Method C (PowerShell .NET TLS Grab):
```powershell
New-Item -ItemType Directory -Force -Path C:\certs | Out-Null
Add-Type -AssemblyName System.Net.Security, System.Security
$hostName = "repo.maven.apache.org"
$client = New-Object Net.Sockets.TcpClient($hostName,443)
$ssl = New-Object System.Net.Security.SslStream($client.GetStream(),$false,({$true}))
$ssl.AuthenticateAsClient($hostName)
$leaf = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $ssl.RemoteCertificate
$chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
$chain.Build($leaf) | Out-Null
foreach($elem in $chain.ChainElements){
  $name = ($elem.Certificate.Subject -replace 'CN=','').Split(',')[0].Trim() -replace '[^A-Za-z0-9_-]','_'
  $out = "C:\certs\$name.cer"
  [IO.File]::WriteAllBytes($out,$elem.Certificate.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))
  Write-Host "Exported: $out"
}
```
Identify which exported file is the corporate root (often last in chain or with company name). Import that one.

Method D (MMC GUI Export):
1. Run `mmc.exe` → File → Add/Remove Snap-in.
2. Add "Certificates" (choose *Computer account* → Local computer).
3. Navigate: `Trusted Root Certification Authorities > Certificates`.
4. Look for a certificate whose *Issuer* matches your company/proxy.
5. Right-click → All Tasks → Export → Base-64 encoded X.509 (.CER) → Save as `C:\certs\corp-root.crt`.

Method E (certutil chain dump):
```powershell
certutil -verify -urlfetch https://repo.maven.apache.org/maven2 > C:\certs\chain.txt 2>&1
```
Open `chain.txt`; locate BEGIN CERTIFICATE / END CERTIFICATE blocks added by proxy; copy one into `corp-root.crt`.

Method F (WSL OpenSSL):
If Windows OpenSSL unavailable:
```bash
# In WSL (Ubuntu)
sudo apt-get update && sudo apt-get install -y openssl
openssl s_client -showcerts -connect repo.maven.apache.org:443 </dev/null | tee maven_certs.txt
```
Then copy the correct certificate block to a file and move it to Windows path for import.

### Determining the Correct Certificate
- The corporate root often has a long validity (10+ years) and a Subject with company/proxy name.
- The leaf certificate typically has `repo.maven.apache.org` as CN; do NOT import just the leaf.
- If unsure, import the top 2 certificates from the chain; harmless duplicates will be ignored if already trusted.

### Still Stuck?
- Confirm if a local HTTPS inspection agent (ZScaler, BlueCoat, etc.) is installed; its root cert may already be in Windows but missing from JDK.
- Search Windows cert store: `certutil -store -user Root | findstr /I "ZScaler BlueCoat"` (replace with vendor name).
Export that matching certificate using MMC (Method D) and import into JDK.

## 3. Import Certificate into JDK Truststore
```powershell
$javaHome = (java -XshowSettings:properties -version 2>&1 | findstr "java.home" | ForEach-Object { $_.Split()[-1] })
$keytool = "$javaHome\bin\keytool.exe"
$certPath = "C:\certs\corp-root.crt"  # Adjust path
& $keytool -importcert -trustcacerts -alias corp-root -file $certPath -keystore "$javaHome\lib\security\cacerts" -storepass changeit -noprompt
```
Confirm:
```powershell
& $keytool -list -keystore "$javaHome\lib\security\cacerts" -storepass changeit | Select-String corp-root
```

## 4. Clear Any Corrupted / Partial Downloads
```powershell
Remove-Item "$env:USERPROFILE\.m2\repository\org\flywaydb" -Recurse -Force -ErrorAction SilentlyContinue
```

## 5. Re-run Build
```powershell
mvn -U -DskipTests clean package
```
Success criteria: build completes; jar appears at `backend/school-app/target/school-app-1.0.0.jar`.

## 6. (Optional) Pin a Current Flyway Version
If the parent BOM forces an older Flyway and you prefer latest:
```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
  <version>9.22.3</version>
</dependency>
```
(Only needed if you want features/fixes beyond BOM.)

## 7. Fallback Workarounds (Not Recommended Long-Term)
- Remote Build: Use GitHub Actions to build and download artifact (bypasses local proxy).
- Manual Install: Download `flyway-core-*.jar` + POM from a trusted machine; then:
```powershell
mvn install:install-file -Dfile=flyway-core-8.5.13.jar -DpomFile=flyway-core-8.5.13.pom
```
- Profile Toggle: Keep Flyway only in a profile (`-Pwith-flyway`) until truststore fixed (already temporarily used).

## 8. Verify Flyway Runtime
On EC2 after deployment (prod profile):
```bash
psql "$DB_URL" -U "$DB_USER" -c "SELECT version,success,script FROM flyway_schema_history ORDER BY installed_on DESC LIMIT 10;"
```
Expect latest migrations including `V20251122_04__create_students_table.sql`.

## 9. Clean Rollback (If Needed)
Remove certificate entry:
```powershell
& $keytool -delete -alias corp-root -keystore "$javaHome\lib\security\cacerts" -storepass changeit
```

## 10. Troubleshooting
| Symptom | Action |
|---------|--------|
| Still PKIX | Confirm correct cert imported; re-open browser and compare fingerprints |
| Different hostname mismatch | Ensure no forced HTTP proxy rewriting to another domain |
| Works for some deps but not Flyway | Possibly cached invalid cert; clear `.m2` for that groupId |
| Build slow | Use `mvn -T 1C` for parallel; trust fix does not affect performance |

## 11. Next Steps
After success:
1. Mark todo items (SSL fix, confirm Flyway build) as completed.
2. Deploy jar to EC2 and let Flyway create missing tables.
3. Retest `/api/staff`, `/api/students`, `/api/courses`.

---
Maintaining a trusted JDK certificate store ensures future dependency upgrades (security patches) without interruption.
