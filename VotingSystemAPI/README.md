# Voting System API - Java Backend

This is a Java Spring Boot implementation of the Voting System backend API, replacing the original Python FastAPI implementation.

## Features

- ✅ User authentication with JWT tokens
- ✅ MySQL database integration
- ✅ CORS support for multiple origins
- ✅ Same functionality as Python backend
- ✅ RESTful API endpoints
- ✅ Environment variable configuration

## Prerequisites

- Java 11 or higher
- Maven 3.6+
- MySQL Server
- Environment variables configured

## Setup Instructions

### 1. Environment Variables

Create a `.env` file or set the following environment variables:

```bash
export MYSQL_HOST=localhost
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
export MYSQL_DB=voting_db
export SECRET_KEY=your_jwt_secret_key
```

### 2. Build the Project

```bash
cd VotingSystemAPI
mvn clean package
```

### 3. Run the Application

#### Option A: Using Maven
```bash
mvn spring-boot:run
```

#### Option B: Using JAR file
```bash
java -jar target/voting-system-api-1.0.0.jar
```

The API will start on `http://localhost:8081`

## API Endpoints

### 1. Login Endpoint
**GET** `/api/auth/login`

Parameters:
- `voterId` (query parameter): Voter ID
- `password` (query parameter): Password
- `Authorization` (header, optional): Bearer token for verification

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "voter"
}
```

Error Response (401):
```json
{
  "error": "Invalid voter id or password"
}
```

### 2. Health Check
**GET** `/api/auth/health`

Response:
```json
{
  "status": "API is running"
}
```

## Project Structure

```
VotingSystemAPI/
├── src/
│   ├── main/
│   │   ├── java/com/voting/
│   │   │   ├── VotingSystemApiApplication.java     # Main Spring Boot class
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java                 # CORS Configuration
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java             # Authentication endpoints
│   │   │   ├── service/
│   │   │   │   └── AuthenticationService.java      # Authentication logic
│   │   │   ├── security/
│   │   │   │   ├── JwtUtils.java                   # JWT token handling
│   │   │   │   └── AuthenticationService.java      # Auth service
│   │   │   └── dto/
│   │   │       ├── LoginRequest.java               # Login request DTO
│   │   │       └── LoginResponse.java              # Login response DTO
│   │   └── resources/
│   │       └── application.properties              # Application configuration
│   └── test/
├── pom.xml                                           # Maven configuration
└── README.md
```

## Database Schema

The application expects the following database table:

```sql
CREATE TABLE voters (
    voter_id VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);
```

## CORS Configuration

The following origins are allowed:
- `http://localhost:8080`
- `http://127.0.0.1:8080`
- `http://10.0.0.99:8080`
- `http://vote.ratul.fun`
- `https://vote.ratul.fun`

## Migration from Python Backend

This Java backend is a direct replacement for `Database_API/main.py`. All endpoints maintain the same functionality:

| Python FastAPI | Java Spring Boot |
|---|---|
| `/login` | `/api/auth/login` |
| JWT Encoding | JWT Token Generation |
| MySQL Connection | Spring Data JDBC |
| CORS Middleware | CORS Configuration |

## Dependencies

- **Spring Boot 3.2.0**: Web framework
- **MySQL Connector 8.0.33**: Database driver
- **JJWT 0.12.3**: JWT token handling
- **Lombok**: Reducing boilerplate code

## Troubleshooting

### Database Connection Error
Ensure MySQL is running and credentials in `application.properties` are correct.

### JWT Token Error
Verify `SECRET_KEY` environment variable matches between frontend and backend.

### Port Already in Use
Change `server.port` in `application.properties` to an available port.

## License

ISC License - Same as the parent project
