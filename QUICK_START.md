# Quick Start Guide - Java Backend

## 🚀 5-Minute Setup

### Step 1: Verify Prerequisites
```bash
java -version          # Should be Java 11 or higher
mvn -version          # Should be Maven 3.6 or higher
mysql --version       # MySQL should be running
```

### Step 2: Set Environment Variables
```bash
export MYSQL_HOST=localhost
export MYSQL_USER=root
export MYSQL_PASSWORD=your_mysql_password
export MYSQL_DB=voting_db
export SECRET_KEY=my-secret-key-123
```

### Step 3: Start the Java Backend

**Using the provided script (Recommended):**
```bash
cd /home/ratul/Projects/Decentralized-Voting-System-main
bash start_java_api.sh
```

**Or manually:**
```bash
cd VotingSystemAPI
mvn spring-boot:run
```

### Step 4: Test It
In another terminal:
```bash
curl http://localhost:8081/api/auth/health
```

You should see:
```json
{
  "status": "API is running"
}
```

## 📝 Test Login Endpoint

```bash
curl "http://localhost:8081/api/auth/login?voterId=voter1&password=pass123"
```

Expected response (if credentials exist in DB):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "voter"
}
```

## 🔧 Configuration

### Change Port
Edit `VotingSystemAPI/src/main/resources/application.properties`:
```properties
server.port=8082
```

### Database Configuration
The Java backend reads these environment variables:
- `MYSQL_HOST` - Database host (default: localhost)
- `MYSQL_USER` - Database user (default: root)
- `MYSQL_PASSWORD` - Database password
- `MYSQL_DB` - Database name (default: voting_db)
- `SECRET_KEY` - JWT signing key

### Development Mode
To enable debug logging:
```bash
cd VotingSystemAPI
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

## 📁 Project Files

### Key Files Created
- `VotingSystemAPI/pom.xml` - Maven configuration
- `VotingSystemAPI/src/main/java/com/voting/` - Java source code
- `VotingSystemAPI/src/main/resources/application.properties` - Configuration
- `start_java_api.sh` - Startup script
- `BACKEND_IMPLEMENTATION.md` - Full documentation
- `JAVA_BACKEND_MIGRATION.md` - Migration guide

### Original Files (Unchanged)
- All files in `Database_API/` 
- All files in `src/` (frontend)
- All files in `contracts/` (smart contracts)
- `index.js` (Node.js server)

## ✅ Common Tasks

### Build JAR File
```bash
cd VotingSystemAPI
mvn clean package
```

### Run Built JAR
```bash
java -jar VotingSystemAPI/target/voting-system-api-1.0.0.jar
```

### Check Logs
The application logs are printed to console. For file logging:
Edit `application.properties` and add:
```properties
logging.file.name=logs/application.log
```

### Database Connection Issues
Test MySQL connection:
```bash
mysql -h localhost -u root -p voting_db
```

Verify voters table:
```sql
SELECT * FROM voters;
```

## 🆘 Troubleshooting

### Error: Port already in use
```bash
# Find process using port 8081
lsof -i :8081
# Kill it and try again
```

### Error: Cannot connect to MySQL
- Verify MySQL is running
- Check credentials in application.properties
- Ensure voting_db database exists

### Error: JWT validation failed
- Verify SECRET_KEY environment variable is set
- Make sure SECRET_KEY is the same for all instances
- Clear browser cache and re-login

### Build fails with Maven
```bash
# Clean and rebuild
mvn clean install -U
```

## 📚 Documentation Files

Read these for more info:
1. `BACKEND_IMPLEMENTATION.md` - Complete overview
2. `JAVA_BACKEND_MIGRATION.md` - Python to Java mapping
3. `VotingSystemAPI/README.md` - Detailed setup

## 🎯 Next Steps

1. ✅ Run the Java backend
2. ✅ Test the health endpoint
3. ✅ Test login with valid credentials
4. ✅ Update frontend API URL (if switching backends)
5. ✅ Deploy to your server

## ✨ Features Ready to Use

- ✅ User authentication with JWT
- ✅ MySQL database integration
- ✅ CORS support for frontend
- ✅ Role-based access control
- ✅ Error handling with proper HTTP status codes
- ✅ Environment variable configuration
- ✅ Health check endpoint

---

**Status**: Ready to Run ✅

**Need Help?** Check the troubleshooting section above or read the full documentation in `BACKEND_IMPLEMENTATION.md`
