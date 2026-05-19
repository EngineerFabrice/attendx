# AttendX - Smart Hybrid Attendance Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Flutter](https://img.shields.io/badge/Flutter-3.22+-blue.svg)](https://flutter.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0.45-blue.svg)](https://mysql.com)

> A secure, real-time, and inclusive attendance system with geolocation verification, session-based codes, and hybrid submission methods (mobile app, SMS, offline sync).

## Project Information

**Academic Year:** 2025-2026 | **Year:** III | **Module:** Mobile Applications Systems and Design

**University of Rwanda** - College of Science & Technology - School of ICT - Department of Computer & Software Engineering

### Team Members

| Name              | Registration Number |
| ----------------- | ------------------- |
| Fabrice NDAYISABA | 223008047           |
| Silas HAKUZWIMANA | 223001019           |

## Features

### Core Capabilities

- ✅ **Session-Based Attendance** - Auto-expiring session codes eliminate congestion
- ✅ **Geolocation Verification** - Validates attendance within classroom boundaries (50-100m radius)
- ✅ **Hybrid Submission** - Mobile app, offline sync, and SMS support
- ✅ **Device Registration** - Reduces fraudulent submissions
- ✅ **Admin Dashboard** - Real-time analytics and reports
- ✅ **Room Check-in System** - Students actively check in when entering lecture halls

### 🎯 Innovation Points

- Classroom-aware attendance using geofencing
- Multi-device inclusivity (smartphones, offline, SMS)
- Fraud prevention (session codes, GPS, device tracking)
- Auto-expiring session codes with server-side validation

## 🏗️ System Architecture

<img width="1362" height="744" alt="image" src="https://github.com/user-attachments/assets/68bc8efb-6d01-4994-80e2-656aae9cc6a1" />


## 📁 Project Structure
```bash
├───attendx_admin
│   ├───public
│   └───src
│       ├───assets
│       ├───components
│       ├───context
│       ├───pages
│       └───services
├───attendx_backend
│   ├───database
│   ├───scripts
│   └───src
│       ├───config
│       ├───controllers
│       ├───middleware
│       ├───routes
│       ├───services
│       ├───socket
│       └───utils
├───attendx_lecturer
│   ├───public
│   └───src
│       ├───assets
│       ├───components
│       ├───context
│       ├───pages
│       └───services
└───attendx_student_app
    ├───.vscode
    ├───android
    │   ├───app
    │   │   └───src
    │   │       ├───debug
    │   │       ├───main
    │   │       │   ├───kotlin
    │   │       │   │   └───com
    │   │       │   │       └───example
    │   │       │   │           └───attendx_student_app
    │   │       │   └───res
    │   │       │       ├───drawable
    │   │       │       ├───drawable-v21
    │   │       │       ├───mipmap-hdpi
    │   │       │       ├───mipmap-mdpi
    │   │       │       ├───mipmap-xhdpi
    │   │       │       ├───mipmap-xxhdpi
    │   │       │       ├───mipmap-xxxhdpi
    │   │       │       ├───values
    │   │       │       └───values-night
    │   │       └───profile
    │   └───gradle
    │       └───wrapper
    ├───ios
    │   ├───Flutter
    │   ├───Runner
    │   │   ├───Assets.xcassets
    │   │   │   ├───AppIcon.appiconset
    │   │   │   └───LaunchImage.imageset
    │   │   └───Base.lproj
    │   ├───Runner.xcodeproj
    │   │   ├───project.xcworkspace
    │   │   │   └───xcshareddata
    │   │   └───xcshareddata
    │   │       └───xcschemes
    │   ├───Runner.xcworkspace
    │   │   └───xcshareddata
    │   └───RunnerTests
    ├───lib
    │   ├───app
    │   ├───core
    │   │   ├───constants
    │   │   ├───network
    │   │   ├───services
    │   │   ├───storage
    │   │   └───utils
    │   ├───features
    │   │   ├───analytics
    │   │   │   ├───data
    │   │   │   └───presentation
    │   │   │       ├───providers
    │   │   │       └───widgets
    │   │   ├───auth
    │   │   │   ├───data
    │   │   │   ├───domain
    │   │   │   └───presentation
    │   │   │       └───providers
    │   │   ├───checkin
    │   │   │   ├───data
    │   │   │   └───presentation
    │   │   │       └───providers
    │   │   ├───dashboard
    │   │   │   ├───data
    │   │   │   └───presentation
    │   │   │       ├───providers
    │   │   │       └───widgets
    │   │   ├───history
    │   │   │   ├───data
    │   │   │   └───presentation
    │   │   │       ├───providers
    │   │   │       └───widgets
    │   │   └───profile
    │   │       └───presentation
    │   │           └───widgets
    │   └───shared
    │       ├───theme
    │       └───widgets
    ├───linux
    │   ├───flutter
    │   └───runner
    ├───macos
    │   ├───Flutter
    │   ├───Runner
    │   │   ├───Assets.xcassets
    │   │   │   └───AppIcon.appiconset
    │   │   ├───Base.lproj
    │   │   └───Configs
    │   ├───Runner.xcodeproj
    │   │   ├───project.xcworkspace
    │   │   │   └───xcshareddata
    │   │   └───xcshareddata
    │   │       └───xcschemes
    │   ├───Runner.xcworkspace
    │   │   └───xcshareddata
    │   └───RunnerTests
    ├───test
    ├───web
    │   └───icons
    └───windows
        ├───flutter
        └───runner
            └───resources
```
### Database Schema

## Core Tables (12 tables)

Table	                   Purpose
users	                   Students, lecturers, admins with role-based access
device_tokens	           FCM push notification tokens per user
courses	                   Course information with lecturer assignment
enrollments	               Student-course relationships
classrooms	               Geofence coordinates (latitude, longitude, radius)
attendance_sessions	       Lecture sessions with auto-expiring check-in codes
attendance_records	       Final attendance status (present/absent)
attendance_warnings	       Log of absence warnings sent to students
notification_preferences   User notification settings
notifications	           Push notification logs
password_reset_tokens	   Password reset request tracking
refresh_tokens	          JWT refresh token storage
### Key Relationships

```sql
users ──< enrollments >── courses ──< attendance_sessions
  │                           │
  │                           └──< classrooms (geofence)
  │
  ├──< device_tokens
  ├──< notifications
  ├──< attendance_records
  └──< attendance_warnings
```
### Attendance Flow (Location-based Check-in)
```bash
1. Lecturer creates session
   └── attendance_sessions (status: 'active', generates unique code)

2. Student checks in via mobile app
   ├── Geofence validation (classroom.latitude, longitude, radius)
   └── attendance_records (status: 'present', geofence_passed: boolean)

3. Session expires or closed
   ├── Auto-mark absent students
   └── Send FCM notifications to absent students

4. Warning system for at-risk students
   ├── attendance_warnings (logged when attendance < 75%)
   └── FCM push notifications sent to device_tokens
```

### Important Fields
## users
```bash
id VARCHAR(36) PRIMARY KEY (UUID)
role ENUM('admin', 'lecturer', 'student')
reg_number VARCHAR(50) (students only)
attendance_sessions
status ENUM('active', 'closed')
session_code VARCHAR(6) (auto-generated, 90-minute expiry)
```
## classrooms
```bash
latitude DECIMAL(10,8)
longitude DECIMAL(11,8)
radius_m INT (geofence radius in meters)
attendance_warnings
status ENUM('sent', 'delivered', 'read')
Auto-generated UUID and timestamp
```
### Indexes for Performance

```sql
-- Optimized queries for reporting
CREATE INDEX idx_attendance_rate ON attendance_records(status);
CREATE INDEX idx_session_status ON attendance_sessions(status);
CREATE INDEX idx_warning_sent ON attendance_warnings(sent_at);
CREATE INDEX idx_user_role ON users(role, is_active);
Sample Queries

-- Get at-risk students (attendance < 75%)
SELECT u.full_name, u.reg_number, 
       ROUND(AVG(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) * 100, 1) as attendance_rate
FROM users u
JOIN enrollments e ON u.id = e.student_id
LEFT JOIN attendance_records ar ON u.id = ar.student_id
GROUP BY u.id
HAVING attendance_rate < 75;

-- Get active sessions with geofence data
SELECT s.*, c.name as course_name, cl.latitude, cl.longitude, cl.radius_m
FROM attendance_sessions s
JOIN courses c ON s.course_id = c.id
JOIN classrooms cl ON s.classroom_id = cl.id
WHERE s.status = 'active' AND s.expires_at > NOW();

-- Get warning history for a student
SELECT w.*, u.full_name, u.email
FROM attendance_warnings w
JOIN users u ON w.student_id = u.id
WHERE w.student_id = 'student-uuid'
ORDER BY w.sent_at DESC;
```
### Notes

All UUIDs are generated using MySQL's UUID() function
Timestamps use CURRENT_TIMESTAMP with automatic updates
Foreign keys use ON DELETE CASCADE for data integrity
Character set: utf8mb4 with utf8mb4_general_ci collation for emoji support

<img width="1713" height="4137" alt="image" src="https://github.com/user-attachments/assets/61f0c3bf-0843-4bde-b81d-63fdaf941f1c" />

### Tech Stack

## Frontend (Mobile)

Framework: Flutter 3.22+ (Dart)
State Management: Provider / Riverpod
Geolocation: geolocator package
Local Storage: Hive (offline sync)
HTTP Client: Dio

## Backend

Runtime: Node.js 20.x
Framework: Express.js
Authentication: JWT (jsonwebtoken)
Validation: Joi/Zod
Scheduling: node-cron (session expiry)
Geofencing: Haversine formula (server-side)

## Database

Primary: MySQL
SMS Gateway
Twilio

### Prerequisites

Flutter: 3.22+ (Installation Guide)
Node.js: 20.x or higher
MySQL
Android Studio (for emulator testing)
Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/EngineerFabrice/attendx.git
```
```bash
cd attendx
```
2. Backend Setup
```bash
cd attendx_backend
```
# Install dependencies
```bash
pnpm install
```
# Copy environment variables
```bash
cp .env.example .env
```
# Edit .env with your credentials
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, SMS_API_KEY, etc.

# Run database migrations
```bash
pnpm run migrate
```
# Seed initial data (classrooms, admin user)
```bash
npm run seed
```
# Start development server
```bsh
npm run dev
```
3. Student App Setup
```bash
cd ../attendx_student_app
```
# Get Flutter packages
```bash
flutter pub get
```
# Run the app
```bash
flutter run
```
4. Lecturer App Setup
```bash
cd ../attendx_lecturer
flutter pub get
flutter run
```
5. Admin Dashboard Setup
```bash
cd ../attendx_admin
npm install
npm run dev
```
## Android Emulator Configuration

# List available emulators
```bash
flutter emulators
```
# Create AVD (if needed)
```bash
avdmanager create avd -n attendx_device -k "system-images;android-35;google_apis;x86_64"
```
# Launch emulator
```bash
flutter emulators --launch attendx_device
```
# Run app on emulator
```bash
flutter run
```

### Environment Variables

Backend (.env)
```bash
env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=attendx_db

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Geofence
DEFAULT_RADIUS_M=50
SESSION_TTL_MINUTES=15

# SMS Gateway (Africa's Talking)
SMS_API_KEY=your_api_key
SMS_USERNAME=sandbox
SMS_WEBHOOK_SECRET=your_webhook_secret

# Push Notifications (FCM)
FCM_SERVER_KEY=your_fcm_server_key
```
### API Endpoints

## Authentication (/api/auth)

# Method	                                     Endpoint	                                  Description

POST	                                     /api/auth/login	                          User login (student/lecturer/admin)
POST	                                     /api/auth/refresh	                          Refresh JWT access token

## Lecturer Routes(/api/lecturer)

# Method	                                    Endpoint	                                      Description

GET	                                        /api/lecturer/dashboard	                          Lecturer dashboard statistics
GET	                                        /api/lecturer/sessions	                          Get all sessions (active & closed)
POST	                                    /api/lecturer/sessions/start	                  Start a new attendance session
POST	                                    /api/lecturer/sessions/:id/close	              Close an active session
GET	                                        /api/lecturer/sessions/:id/attendance	          Get attendance records for a session
GET	                                        /api/lecturer/sessions/:id/enrolled-students	  Get all enrolled students for a session
GET	                                        /api/lecturer/students	                          Get all students with attendance rates
POST	                                    /api/lecturer/students	                          Create a new student
GET	                                        /api/lecturer/courses	                          Get lecturer's courses
GET	                                        /api/lecturer/classrooms	                      Get available classrooms with geofence

## Student Routes (/api/student)

# Method	                  Endpoint	                                      Description

POST	                  /api/student/sessions/:code/checkin	          Student checks in with session code (GPS required)
GET	                      /api/student/sessions	                          Get student's session history
GET	                      /api/student/attendance	                      Get student's attendance records

## Notifications (/api/notifications)

# Method	                  Endpoint	                                     Description

POST	                  /api/notifications/send-warning	             Send absence warning to a single student
POST	                  /api/notifications/send-bulk-warnings	         Send warnings to multiple students
GET	                      /api/notifications/warnings/:studentId	     Get warning history for a student

## Admin Routes (/api/admin)

# Method	                        Endpoint	                     Description

GET	                            /api/admin/dashboard	         Admin dashboard statistics
GET	                            /api/admin/users	             Manage system users
GET	                            /api/admin/courses	             Manage courses
GET	                            /api/admin/classrooms	         Manage classrooms

## System

## Method	                        Endpoint	              Description

GET	                            /api/health	              Health check endpoint

## Real-time WebSocket Events (Socket.IO)

Events Emitted by Server

## Event	                                         Direction	        Description

session_started	                                 Server → Client	New session started for a course
session_closed	                                 Server → Client	Session has been closed
attendance_update	                             Server → Client	Real-time check-in notification

## Events  Received by Server

## Event	                        Direction	                 Description

join_session	                Client → Server	             Join a session room for live updates
join_course	                    Client → Server	             Join a course room for session notifications

## Attendance Flow Diagram

```bash
<img width="1228" height="1192" alt="image" src="https://github.com/user-attachments/assets/b98b9f53-1a9c-49cd-b422-15b92bb413a7" />

```

## Authentication

All protected routes require a Bearer token in the Authorization header:

```text
Authorization: Bearer <your_jwt_token>
Tokens are obtained via /api/auth/login and can be refreshed using /api/auth/refresh.
```
## Response Format

All API responses follow a consistent format:

Success:

```json
{
  "success": true,
  "data": { ... }
}
```
Error:

```json
{
  "success": false,
  "error": "Error message here"
}
```
### Testing

# Backend unit tests
```bash
cd attendx_backend
npm test
```
# Flutter widget tests
```bash
cd attendx_student_app
flutter test
```
# Integration tests
```bash
npm run test:integration
```
📊 Sample Geofence Data
```sql
INSERT INTO classrooms (name, latitude, longitude, radius_m) VALUES
('LT-1', -1.9441, 30.0619, 80),   -- Large theatre
('LT-3', -1.9455, 30.0631, 50),   -- Standard lecture hall
('Seminar A', -1.9460, 30.0640, 20), -- Small room
('Exam Tent', -1.9430, 30.0600, 100); -- Outdoor space
```
### Deployment
Backend (Render.com / Heroku)

### Push to production branch
```bash
git push production main
```
# Run migrations automatically
```bash
npm run migrate:prod
```

## Mobile Apps (Play Store / Internal Distribution)

# Build Android APK
```bash
cd attendx_student_app
flutter build apk --release
```
# Build iOS (requires macOS)
```bash
flutter build ios --release
```
### Contributing

Create a feature branch: 
```bash
git checkout -b feature/amazing-feature
```
Commit changes: 
```bash
git commit -m 'Add amazing feature'
```
Push: 
```bash
git push origin feature/amazing-feature
```
Open a Draft Pull Request on GitHub

Request review from team members

### License

This project is part of academic coursework at the University of Rwanda.
MIT License - see LICENSE file for details.

### Acknowledgments
Supervisor: Lect. Dieudonne UKURIKIYEYESU

University of Rwanda - Department of Computer & Software Engineering

Flutter & Node.js Open Source Communities

Twillio - SMS Gateway

### Support

For issues or questions:

## Create an Issue

Contact team members via university email [hakuzwimana_223001019@stud.ur.ac.rw](hakuzwimana_223001019@stud.ur.ac.rw) || [ndayisaba_223001019@stud.ur.ac.rw](ndayisaba_223001019@stud.ur.ac.rw)


