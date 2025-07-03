# Flight Booking System

A modern, microservices-based flight booking system built with Spring Boot, React, and PostgreSQL. The system features JWT authentication, role-based authorization, and a clean, responsive user interface.

## 🏗️ Architecture Overview

The system follows a microservices architecture with the following components:

```
booking/
├── api-gateway/          # API Gateway (Port: 8080)
├── discovery-server/     # Eureka Service Discovery (Port: 8761)
├── user-service/         # User Authentication Service (Port: 9091)
├── flight-service/       # Flight Management Service (Port: 9092)
└── frontend/             # React Frontend (Port: 5173)
```

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: ADMIN and USER roles with different permissions
- **Flight Management**: Search, view, and add flights (ADMIN only)
- **Microservices Architecture**: Scalable and maintainable service separation
- **Modern Frontend**: React with TypeScript, responsive design
- **API Gateway**: Centralized routing and request handling
- **Service Discovery**: Eureka server for service registration

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.0**
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database ORM
- **Spring Cloud Gateway** - API Gateway
- **JWT (jjwt 0.9.1)** - Token-based authentication
- **PostgreSQL** - Database
- **Lombok** - Code generation
- **ModelMapper** - Object mapping

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching
- **Lucide React** - Icons

## 📋 Prerequisites

- **Java 17+**
- **PostgreSQL** (running on port 5432)
- **Node.js 18+**
- **Maven**

## ⚙️ Setup & Installation

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE flight_app;
```

Update database credentials in both services' `application.yml` files if needed:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flight_app
    username: postgres
    password: 123456
```

### 2. Running Services

Start services in the following order:

#### Discovery Server (Optional - currently disabled)
```bash
cd discovery-server
./mvnw spring-boot:run
```

#### User Service
```bash
cd user-service
./mvnw spring-boot:run
```
- Runs on: `http://localhost:9091`

#### Flight Service
```bash
cd flight-service
./mvnw spring-boot:run
```
- Runs on: `http://localhost:9092`

#### API Gateway
```bash
cd api-gateway
./mvnw spring-boot:run
```
- Runs on: `http://localhost:8080`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs on: `http://localhost:5173`

## 📡 API Documentation

### User Service APIs

**Base URL**: `http://localhost:9091`

#### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/create` | Register new user | `UserRequestDto` | `JwtResponse` |
| POST | `/auth/login` | User login | `JwtRequest` | `JwtResponse` |
| POST | `/auth/refresh-token` | Refresh access token | `RefreshTokenRequest` | `JwtResponse` |
| GET | `/auth/logout` | Logout user | None | String message |
| DELETE | `/auth/delete` | Delete user account | Query: `email` | String message |

#### Request/Response Formats

**UserRequestDto** (Registration):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**JwtRequest** (Login):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**JwtResponse**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "refresh-token-here"
}
```

### Flight Service APIs

**Base URL**: `http://localhost:9092`

#### Flight Management Endpoints

| Method | Endpoint | Description | Required Role | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/flights/search` | Search flights | USER, ADMIN | Query params | `List<Flight>` |
| POST | `/api/flights/add` | Add new flight | ADMIN only | `Flight` | String message |
| GET | `/api/flights` | Get all flights | USER, ADMIN | None | `List<Flight>` |

#### Search Flights Query Parameters
- `source`: Departure city (string)
- `destination`: Arrival city (string)  
- `date`: Departure date (YYYY-MM-DD)

**Example**: `/api/flights/search?source=Mumbai&destination=Delhi&date=2024-01-15`

#### Flight Entity Format
```json
{
  "id": 1,
  "airline": "Air India",
  "source": "Mumbai",
  "destination": "Delhi",
  "departureDate": "2024-01-15",
  "departureTime": "09:30",
  "availableSeats": 150,
  "price": 5500.0
}
```

## 🔐 Security & Authentication

### JWT Token Configuration
- **Token Validity**: 5 hours
- **Algorithm**: HS512
- **Claims**: username (email), role

### Role-Based Access Control

#### User Roles
- **USER**: Can search and view flights
- **ADMIN**: Can perform all operations including adding flights

#### Protected Endpoints
- **Flight Search/View**: Requires USER or ADMIN role
- **Add Flight**: Requires ADMIN role only

### Authentication Flow

1. **Register/Login** → Receive JWT access token + refresh token
2. **Include JWT** in Authorization header: `Bearer <token>`
3. **Token Validation** → Services validate JWT and extract user role
4. **Access Control** → Grant/deny access based on role permissions

## 🗄️ Database Schema

### User Entity
```sql
Table: userDb
- id: BIGINT (Primary Key, Auto-generated)
- name: VARCHAR
- email: VARCHAR (Unique, Not Null)
- password: VARCHAR (Encrypted)
- role: VARCHAR (USER/ADMIN)
```

### Flight Entity
```sql
Table: flight
- id: BIGINT (Primary Key, Auto-generated)
- airline: VARCHAR
- source: VARCHAR
- destination: VARCHAR
- departure_date: DATE
- departure_time: VARCHAR
- available_seats: INTEGER
- price: DOUBLE
```

## 🌐 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Discovery Server | 8761 | Eureka Service Registry |
| API Gateway | 8080 | Request routing |
| User Service | 9091 | Authentication & user management |
| Flight Service | 9092 | Flight operations |
| Frontend | 5173 | React application |

## 🚦 API Gateway Routes

The API Gateway routes requests to appropriate microservices:

- `/api/users/**` → User Service (Port 9091)
- `/api/flights/**` → Flight Service (Port 9092)

## 🔧 Configuration

### Application Properties

Each service has its own `application.yml` with service-specific configurations:

```yaml
# Common database configuration
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flight_app
    username: postgres
    password: 123456
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

## 🧪 Testing the System

### 1. Create Admin User
```bash
curl -X POST http://localhost:9091/auth/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:9091/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. Add Flight (ADMIN only)
```bash
curl -X POST http://localhost:9092/api/flights/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "airline": "Air India",
    "source": "Mumbai",
    "destination": "Delhi",
    "departureDate": "2024-01-15",
    "departureTime": "09:30",
    "availableSeats": 150,
    "price": 5500.0
  }'
```

### 4. Search Flights
```bash
curl "http://localhost:9092/api/flights/search?source=Mumbai&destination=Delhi&date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

The system is designed for containerization and cloud deployment:

1. **Docker**: Each service can be containerized
2. **Kubernetes**: Supports orchestration with service discovery
3. **Cloud Platforms**: Compatible with AWS, Azure, GCP

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Happy Coding! ✈️**

Let me know if you'd like to:

Prevent duplicate cancellations

Add audit logs for cancellations

Or make the Flight update endpoint private for Booking Service only?









