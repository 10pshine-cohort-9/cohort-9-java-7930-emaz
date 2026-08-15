# cohort-9-java-7930-emaz
Cohort 9 — JAVA Fullstack (JAVA+ReactJS) assignment for Emaz Ali Khan

# Contact Management System

A full-stack Contact Management System built with Spring Boot (backend) and React.js (frontend). This application allows users to register, login, and manage their contacts with full CRUD operations, search, pagination, export, and import features.

---

## Table of Contents

1. Features
2. Technology Stack
3. Project Structure
4. Setup Instructions
5. API Endpoints
6. Testing
7. SonarQube Integration
8. Contributing
9. License

---

## 1. Features

### Authentication
- User Registration with Email or Phone
- User Login with Email or Phone
- JWT Token Authentication
- Change Password Functionality
- Logout Functionality
- Protected Routes

### User Profile Management
- View User Profile with all details
- Edit or Update Profile Information (First Name, Last Name, Email, Phone)
- Change Password from Profile Screen
- User Profile Dropdown Menu in Navigation
- Session Management with Logout

### Contact Management
- Create, Read, Update, Delete Contacts
- Paginated Contact List (10 contacts per page)
- Search and Filter Contacts by Name, Email, Phone, and Title
- View Contact Details with all Emails and Phone Numbers
- Email Addresses with Labels (Work, Personal, Other)
- Phone Numbers with Labels (Work, Mobile, Home)
- Support for Multiple Emails and Phones per Contact

### Export and Import
- Export All Contacts to CSV File
- Import Contacts from CSV File
- Handle CSV with Quoted Fields

### Frontend
- Responsive Dark Theme UI
- Toast Notifications for Success and Error Messages
- Modals for Create, Edit, Delete, View, and Import Operations
- Search Bar with Clear Button
- Pagination Controls
- User Profile Dropdown Menu
- Profile Screen with Edit Profile and Change Password Modals
- Loading States

### Backend
- Global Exception Handling
- Application Logging (SLF4J/Logback)
- Input Validation
- JWT Authentication Filter
- CORS Configuration
- BCrypt Password Encoding

### Testing
- Unit Tests for Controllers
- Unit Tests for Services
- Unit Tests for Repositories
- Test Coverage with JaCoCo

### Code Quality
- SonarQube Configuration
- Logback Configuration
- Git Version Control
- Feature Branch Strategy

---

## 2. Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming Language |
| Spring Boot | 3.5.4 | Application Framework |
| Spring Data JPA | 3.5.4 | Database Access |
| Spring Security | 6.5.2 | Authentication and Authorization |
| MySQL | 8.x | Relational Database |
| JWT | 0.11.5 | Token Authentication |
| Lombok | 1.18.38 | Boilerplate Code Reduction |
| JUnit | 5.12.2 | Unit Testing Framework |
| Mockito | 5.17.0 | Mocking Framework |
| SLF4J/Logback | Latest | Logging |
| Maven | 3.8+ | Build Tool |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.8 | Build Tool |
| React Router DOM | 6.20.0 | Routing |
| Bootstrap | 5.3.2 | Styling Framework |
| Axios | 1.6.0 | HTTP Client |
| Lucide React | 0.294.0 | Icons Library |

### DevOps and Quality Tools

| Technology | Purpose |
|------------|---------|
| Git | Version Control |
| SonarQube | Code Quality Analysis |
| JaCoCo | Test Coverage Reporting |

---

## 3. Project Structure

The project follows a standard Maven structure for the backend and a React structure for the frontend.

### Backend Structure

backend/
├── src/
│   ├── main/
│   │   ├── java/com/contactmanagement/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── enums/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   └── test/
│       └── java/com/contactmanagement/
│           ├── controller/
│           ├── repository/
│           └── service/
├── pom.xml
└── sonar-project.properties

### Frontend Structure

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js

---

## 4. Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 17 |
| Node.js | 16  |
| npm | 8  |
| MySQL | 8.x |
| Maven | 3.8 |

### Step 1: Clone the Repository

Clone the repository from GitHub to your local machine.

### Step 2: Backend Setup

#### Database Configuration

Create a MySQL database named contact_management_db.

Configure the database connection in application.properties file located at:
backend/src/main/resources/application.properties

Update the following properties with your database credentials:
- spring.datasource.url
- spring.datasource.username
- spring.datasource.password

#### Run the Backend Application

Navigate to the backend directory:
cd backend/contact-management-backend

Build the application using Maven:
mvn clean install

Run the Spring Boot application:
mvn spring-boot:run

The backend server will start on: http://localhost:8081

### Step 3: Frontend Setup

#### Configure Environment Variables

Create a .env file in the frontend directory with the following content:
VITE_API_URL=http://localhost:8081/api

#### Install Dependencies

Navigate to the frontend directory:
cd frontend

Install all required npm packages:
npm install

#### Run the Frontend Application

Start the development server:
npm run dev

The frontend application will be available at: http://localhost:5173

---

## 5. API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | /api/auth/register | Register a new user | firstName, lastName, email, phone, password |
| POST | /api/auth/login | Login with email or phone | emailOrPhone, password |

### User Profile Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|--------------------------|
| GET | /api/users/profile | Get current user profile | Yes |
| PUT | /api/users/profile | Update user profile | Yes |
| POST | /api/users/change-password | Change user password | Yes |
| POST | /api/users/logout | Logout user | Yes |

### Contact Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|--------------------------|
| GET | /api/contacts | Get all contacts with pagination | Yes |
| GET | /api/contacts/{id} | Get contact by ID | Yes |
| POST | /api/contacts | Create a new contact | Yes |
| PUT | /api/contacts/{id} | Update an existing contact | Yes |
| DELETE | /api/contacts/{id} | Delete a contact | Yes |
| GET | /api/contacts/search | Search contacts by query parameter | Yes |
| GET | /api/contacts/export | Export all contacts to CSV | Yes |
| POST | /api/contacts/import | Import contacts from CSV file | Yes |

### Request and Response Examples

#### Register User

Request:
- Method: POST
- Endpoint: /api/auth/register
- Body:
    - firstName: Emaz
    - lastName: Ali
    - email: emaz@example.com
    - phone: 0300-1234567
    - password: password123

Response (201 Created):
- id: 1
- firstName: Emaz
- lastName: Ali
- email: emaz@example.com
- phone: 0300-1234567
- success: true
- message: Registration successful! Please login.

#### Login User

Request:
- Method: POST
- Endpoint: /api/auth/login
- Body:
    - emailOrPhone: emaz@example.com
    - password: password123

Response (200 OK):
- id: 1
- firstName: Emaz
- lastName: Ali
- email: emaz@example.com
- phone: 0300-1234567
- token: jwt-token-string
- success: true
- message: Login successful!

#### Create Contact

Request:
- Method: POST
- Endpoint: /api/contacts
- Headers: Authorization: Bearer YOUR_TOKEN
- Body:
    - firstName: Ahmed
    - lastName: Khan
    - title: Software Engineer
    - emails:
        - label: work, value: ahmed@company.com
        - label: personal, value: ahmed@gmail.com
    - phones:
        - label: work, value: 0300-1234567
        - label: mobile, value: 0311-9876543

Response (201 Created):
- id: 1
- firstName: Ahmed
- lastName: Khan
- title: Software Engineer
- emails:
    - id: 1, label: work, value: ahmed@company.com
    - id: 2, label: personal, value: ahmed@gmail.com
- phones:
    - id: 1, label: work, value: 0300-1234567
    - id: 2, label: mobile, value: 0311-9876543

#### Export Contacts

Request:
- Method: GET
- Endpoint: /api/contacts/export
- Headers: Authorization: Bearer YOUR_TOKEN

Response: CSV file download with all contacts.

#### Import Contacts

Request:
- Method: POST
- Endpoint: /api/contacts/import
- Headers: Authorization: Bearer YOUR_TOKEN
- Body: Multipart form data with file field containing CSV file

Response (200 OK):
- successCount: 5
- failureCount: 0
- errors: []

---

## 6. Testing

### Running Backend Tests

Navigate to the backend directory and run:
mvn test

### Generating Test Coverage Report

Run the following command to generate a JaCoCo coverage report:
mvn jacoco:report

The coverage report will be available at:
target/site/jacoco/index.html

### Test Summary

| Test Class | Number of Tests | Status |
|------------|-----------------|--------|
| AuthControllerTest | 6               | All Passing |
| AuthServiceTest | 10              | All Passing |
| UserControllerTest | 8               | All Passing |
| UserServiceTest | 10              | All Passing |
| ContactControllerTest | 9               | All Passing |
| ContactServiceTest | 13              | All Passing |
| UserRepositoryTest | 11              | All Passing |
| ContactRepositoryTest | 1               | All Passing |
| Total | 68              | All Passing |

---

## 7. SonarQube Integration

### Configuration

SonarQube is configured with the following:
- sonar-project.properties file for project configuration
- SonarQube Maven plugin for integration
- JaCoCo for test coverage reporting
- Rules for Java code quality

### Running SonarQube Analysis

Start SonarQube using Docker:
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

Access the SonarQube dashboard:
http://localhost:9000
Default username: admin
Default password: admin

Generate a token and run the analysis:
mvn clean verify sonar:sonar -Dsonar.login=YOUR_TOKEN

### Quality Metrics Analyzed

- Code Coverage
- Code Duplications
- Code Smells
- Bugs
- Vulnerabilities
- Security Hotspots
- Technical Debt

---

## 8. Contributing

### Branch Strategy

The project follows a feature branch workflow:

main
├── feature/setup
├── feature/auth
├── feature/contact
└── feature/optional-feature

### How to Contribute

1. Fork the repository
2. Create a feature branch with a descriptive name
3. Commit your changes with clear commit messages
4. Push to the branch
5. Open a Pull Request for review
6. Address any review comments
7. Merge after approval

---

## Acknowledgments

- Spring Boot Team for the excellent backend framework
- React Team for the frontend library
- All Open Source Libraries and Tools used in this project

---

## Contact Information

- Author: EMAZ CMS
- Project Link:https://github.com/EmazAliKhan/cohort-9-java-7930-emaz.git

---

## Project Status

| Component | Status |
|-----------|--------|
| Backend APIs | Complete |
| Frontend UI | Complete |
| Authentication | Complete |
| Contact CRUD Operations | Complete |
| Export and Import Features | Complete |
| Unit Tests | Complete |
| Logging | Complete |
| Exception Handling | Complete |
| SonarQube | Configured |
| Documentation | Complete |
| Git Version Control | Complete |

---

## Quick Start Commands

Start Backend Application:
Navigate to backend/contact-management-backend and run: mvn spring-boot:run

Start Frontend Application:
Navigate to frontend and run: npm run dev

Run All Tests:
Navigate to backend/contact-management-backend and run: mvn test

Build Frontend for Production:
Navigate to frontend and run: npm run build

---

## Contact Management System is Ready

The application is now ready for use. Access the frontend at http://localhost:5173 and the backend API at http://localhost:8081.
EOF
