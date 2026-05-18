# 📱 AttendX - Smart Hybrid Attendance Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Flutter](https://img.shields.io/badge/Flutter-3.22+-blue.svg)](https://flutter.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://postgresql.org)

> A secure, real-time, and inclusive attendance system with geolocation verification, session-based codes, and hybrid submission methods (mobile app, SMS, offline sync).

## 🎓 Project Information

**Academic Year:** 2025-2026 | **Year:** III | **Module:** Mobile Applications Systems and Design

**University of Rwanda** - College of Science & Technology - School of ICT - Department of Computer & Software Engineering

### 👥 Team Members

| Name              | Registration Number |
| ----------------- | ------------------- |
| Fabrice NDAYISABA | 223008047           |
| Silas HAKUZWIMANA | 223001019           |

## 🚀 Features

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

┌─────────────────────────────────────────────────────────────┐
│ AttendX System │
├─────────────────────────────────────────────────────────────┤
│ Frontend (Flutter) Backend (Node.js) Database │
│ ├─ Student App ←→ Express REST API PostgreSQL │
│ ├─ Lecturer App ←→ JWT Auth 15 tables │
│ └─ Admin Web Dashboard ←→ Geofencing │
├─────────────────────────────────────────────────────────────┤
│ External Services: SMS Gateway (Africa's Talking/Twilio) │
└─────────────────────────────────────────────────────────────┘

text

## 📁 Project Structure

attendx/
├── attendx_student_app/ # Flutter student mobile app
│ ├── lib/
│ │ ├── screens/
│ │ │ ├── checkin_screen.dart
│ │ │ ├── attendance_history.dart
│ │ │ └── profile_screen.dart
│ │ ├── services/
│ │ │ ├── api_service.dart
│ │ │ ├── geolocation_service.dart
│ │ │ └── local_storage.dart (offline sync)
│ │ └── models/
│ └── pubspec.yaml
│
├── attendx_lecturer/ # Flutter lecturer app
│ ├── lib/
│ │ ├── screens/
│ │ │ ├── start_session.dart
│ │ │ ├── live_dashboard.dart
│ │ │ └── reports_screen.dart
│ │ └── services/
│ └── pubspec.yaml
│
├── attendx_admin/ # React/Flutter web admin dashboard
│ ├── src/
│ │ ├── pages/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── ManageCourses.jsx
│ │ │ ├── ManageUsers.jsx
│ │ │ └── Analytics.jsx
│ │ └── components/
│ └── package.json
│
├── attendx_backend/ # Node.js + Express backend
│ ├── src/
│ │ ├── modules/
│ │ │ ├── auth/ # JWT authentication
│ │ │ ├── users/ # User management
│ │ │ ├── courses/ # Course management
│ │ │ ├── sessions/ # Session & check-in logic
│ │ │ ├── attendance/ # Attendance records
│ │ │ ├── devices/ # Device registration
│ │ │ ├── sms/ # SMS webhook handler
│ │ │ └── analytics/ # Reports & insights
│ │ ├── config/
│ │ │ ├── db.js # PostgreSQL pool
│ │ │ └── constants.js # Geofence radius, code TTL
│ │ ├── shared/
│ │ │ ├── utils/
│ │ │ │ └── geofence.util.js # Haversine formula
│ │ │ └── middlewares/
│ │ └── app.js
│ ├── migrations/ # SQL schema files
│ ├── .env
│ └── package.json
│
└── docs/ # Documentation
├── API_REFERENCE.md
├── DATABASE_SCHEMA.md
└── DEPLOYMENT_GUIDE.md

text

## 🗄️ Database Schema

### Core Tables (15 tables)

| Table                | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `users`              | Students, lecturers, admins                    |
| `devices`            | Registered devices per user (fraud prevention) |
| `courses`            | Course information                             |
| `enrollments`        | Student-course relationships                   |
| `classrooms`         | Geofence coordinates (lat, lng, radius)        |
| `sessions`           | Lecture sessions with auto-expiring codes      |
| `room_checkins`      | Student check-ins (GPS at entry)               |
| `attendance_records` | Final attendance (present/absent)              |
| `offline_queue`      | Offline submissions awaiting sync              |
| `sms_logs`           | Incoming SMS audit trail                       |
| `notifications`      | Push notification logs                         |
| `notification_logs`  | Check-in notification eligibility              |

### Key Relationships

```sql
users ──< enrollments >── courses ──< sessions
users ──< devices
sessions ──< room_checkins >── users
sessions ──── classrooms (geofence)
room_checkins ──> attendance_records (on session close)
🔄 Attendance Flow (Room Check-in Method)














🛠️ Tech Stack
Frontend (Mobile)
Framework: Flutter 3.22+ (Dart)

State Management: Provider / Riverpod

Geolocation: geolocator package

Local Storage: Hive (offline sync)

HTTP Client: Dio

Backend
Runtime: Node.js 20.x

Framework: Express.js

Authentication: JWT (jsonwebtoken)

Validation: Joi/Zod

Scheduling: node-cron (session expiry)

Geofencing: Haversine formula (server-side)

Database
Primary: PostgreSQL 15+

Migrations: node-pg-migrate

Driver: pg (node-postgres)

SMS Gateway
Africa's Talking / Twilio (webhook integration)

📋 Prerequisites
Flutter: 3.22+ (Installation Guide)

Node.js: 20.x or higher

PostgreSQL: 15 or higher

Android Studio (for emulator testing)

Git

🔧 Installation
1. Clone the repository
bash
git clone https://github.com/EngineerFabrice/attendx.git
cd attendx
2. Backend Setup
bash
cd attendx_backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, SMS_API_KEY, etc.

# Run database migrations
npm run migrate

# Seed initial data (classrooms, admin user)
npm run seed

# Start development server
npm run dev
3. Student App Setup
bash
cd ../attendx_student_app

# Get Flutter packages
flutter pub get

# Run the app
flutter run
4. Lecturer App Setup
bash
cd ../attendx_lecturer
flutter pub get
flutter run
5. Admin Dashboard Setup
bash
cd ../attendx_admin
npm install
npm run dev
📱 Android Emulator Configuration
System Requirements (Your Setup)
CPU: Intel Core i7-1255U ✅

RAM: 16GB ✅

Graphics: Intel Iris Xe ✅

Storage: 243GB free ✅

Emulator Setup
bash
# List available emulators
flutter emulators

# Create AVD (if needed)
avdmanager create avd -n attendx_device -k "system-images;android-35;google_apis;x86_64"

# Launch emulator
flutter emulators --launch attendx_device

# Run app on emulator
flutter run
Enable Hardware Acceleration (Intel HAXM)
bash
# Check if virtualization is enabled
# Task Manager → Performance → CPU → Virtualization: Enabled

# If disabled, enable in BIOS:
# Reboot → Press F2/Del → Enable Intel VT-x → Save & Exit
🔐 Environment Variables
Backend (.env)
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
📡 API Endpoints (Key Examples)
Method	Endpoint	Description
POST	/api/auth/login	User login (student/lecturer/admin)
POST	/api/sessions/start	Lecturer starts session
POST	/api/sessions/:id/checkin	Student checks in (GPS required)
GET	/api/sessions/:id/checkins	Live dashboard (who's in room)
POST	/api/sessions/:id/close	Lecturer ends session
POST	/api/attendance/sync	Offline sync endpoint
POST	/api/sms/webhook	SMS gateway callback
GET	/api/analytics/reports	Attendance reports
🧪 Testing
bash
# Backend unit tests
cd attendx_backend
npm test

# Flutter widget tests
cd attendx_student_app
flutter test

# Integration tests
npm run test:integration
📊 Sample Geofence Data
sql
INSERT INTO classrooms (name, latitude, longitude, radius_m) VALUES
('LT-1', -1.9441, 30.0619, 80),   -- Large theatre
('LT-3', -1.9455, 30.0631, 50),   -- Standard lecture hall
('Seminar A', -1.9460, 30.0640, 20), -- Small room
('Exam Tent', -1.9430, 30.0600, 100); -- Outdoor space
🚢 Deployment
Backend (Render.com / Heroku)
bash
# Push to production branch
git push production main

# Run migrations automatically
npm run migrate:prod
Mobile Apps (Play Store / Internal Distribution)
bash
# Build Android APK
cd attendx_student_app
flutter build apk --release

# Build iOS (requires macOS)
flutter build ios --release
🤝 Contributing
Create a feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push: git push origin feature/amazing-feature

Open a Draft Pull Request on GitHub

Request review from team members

📄 License
This project is part of academic coursework at the University of Rwanda.
MIT License - see LICENSE file for details.

🙏 Acknowledgments
Supervisor: [Lecturer Name]

University of Rwanda - Department of Computer & Software Engineering

Flutter & Node.js Open Source Communities

Africa's Talking - SMS Gateway

📞 Support
For issues or questions:

Create an Issue

Contact team members via university email

Documentation: /docs folder
```
