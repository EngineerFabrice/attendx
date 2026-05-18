# AttendX API Specifications

## Overview

AttendX is a student attendance management system API. This document outlines the API endpoints, request/response formats, and authentication mechanisms.

**Base URL:** `https://api.attendx.ac.rw/v1`

**Authentication:** Bearer token (JWT) in Authorization header

## Authentication Endpoints

### POST /auth/login
Authenticate a user and return access tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "deviceFingerprint": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "role": "student|lecturer",
      "regNumber": "string",
      "isActive": true,
      "createdAt": "ISO8601"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "expiresIn": 3600
  }
}
```

### POST /auth/logout
Logout user and invalidate tokens.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### POST /auth/change-password
Change user password.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Student Endpoints

### GET /students/dashboard
Get student dashboard data.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "role": "student",
      "regNumber": "string",
      "enrolledCourses": 5,
      "attendanceRate": 87.5
    },
    "overallAttendanceRate": 87.5,
    "todaySessions": [
      {
        "id": "string",
        "sessionCode": "string",
        "status": "active|inactive",
        "checkinOpen": true,
        "course": {
          "code": "string",
          "name": "string"
        },
        "classroom": {
          "name": "string",
          "latitude": number,
          "longitude": number,
          "radiusM": number
        },
        "startedAt": "ISO8601",
        "expiresAt": "ISO8601"
      }
    ],
    "recentAttendance": []
  }
}
```

### GET /students/attendance/history
Get student's attendance history.

**Headers:**
- Authorization: Bearer {accessToken}

**Query Parameters:**
- page: number (optional)
- limit: number (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "sessionId": "string",
      "courseCode": "string",
      "courseName": "string",
      "classroom": "string",
      "checkedInAt": "ISO8601",
      "distanceM": number,
      "status": "present|late|absent"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### GET /students/attendance/trends
Get attendance trends for student.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "monthly": [
      {
        "month": "2024-01",
        "attendanceRate": 85.0,
        "totalSessions": 20,
        "present": 17
      }
    ],
    "weekly": [],
    "courseWise": [
      {
        "courseCode": "CS301",
        "courseName": "Advanced Databases",
        "attendanceRate": 90.0,
        "totalSessions": 10,
        "present": 9
      }
    ]
  }
}
```

### GET /students/courses
Get enrolled courses.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "lecturer": "string",
      "schedule": "string",
      "attendanceRate": 87.5
    }
  ]
}
```

### GET /students/sessions/active
Get active check-in sessions.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "sessionCode": "string",
      "course": {
        "code": "string",
        "name": "string"
      },
      "classroom": {
        "name": "string",
        "latitude": number,
        "longitude": number,
        "radiusM": number
      },
      "startedAt": "ISO8601",
      "expiresAt": "ISO8601"
    }
  ]
}
```

## Check-in Endpoints

### POST /sessions/{sessionId}/checkin
Check in to a session.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "latitude": number,
  "longitude": number
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "checked_in",
    "distanceM": number,
    "checkedInAt": "ISO8601",
    "message": "You have been checked in successfully."
  }
}
```

## Session Endpoints

### GET /sessions
Get all sessions (lecturer only).

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "sessionCode": "string",
      "courseId": "string",
      "status": "active|closed",
      "startedAt": "ISO8601",
      "closedAt": "ISO8601",
      "checkinsCount": number
    }
  ]
}
```

### GET /sessions/{sessionId}
Get session details.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "sessionCode": "string",
    "course": {
      "id": "string",
      "code": "string",
      "name": "string"
    },
    "classroom": {
      "name": "string",
      "latitude": number,
      "longitude": number,
      "radiusM": number
    },
    "startedAt": "ISO8601",
    "expiresAt": "ISO8601",
    "status": "active|closed"
  }
}
```

### POST /sessions/{sessionId}/close
Close a session (lecturer only).

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "message": "Session closed successfully"
}
```

### GET /sessions/{sessionId}/checkins
Get check-ins for a session (lecturer only).

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "studentId": "string",
      "studentName": "string",
      "regNumber": "string",
      "checkedInAt": "ISO8601",
      "distanceM": number,
      "latitude": number,
      "longitude": number
    }
  ]
}
```

## Analytics Endpoints

### GET /analytics/courses/{courseId}/summary
Get course attendance summary (lecturer only).

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseCode": "string",
    "courseName": "string",
    "totalSessions": number,
    "totalStudents": number,
    "averageAttendance": number,
    "sessions": [
      {
        "date": "ISO8601",
        "present": number,
        "total": number,
        "attendanceRate": number
      }
    ]
  }
}
```

### GET /analytics/courses/{courseId}/students
Get student attendance for a course (lecturer only).

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "string",
      "studentName": "string",
      "regNumber": "string",
      "attendanceRate": number,
      "totalSessions": number,
      "present": number,
      "late": number,
      "absent": number
    }
  ]
}
```

### GET /analytics/at-risk
Get students at risk of low attendance.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "string",
      "studentName": "string",
      "regNumber": "string",
      "attendanceRate": number,
      "courses": [
        {
          "courseCode": "string",
          "attendanceRate": number
        }
      ]
    }
  ]
}
```

### GET /analytics/lecturer/dashboard
Get lecturer dashboard analytics.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCourses": number,
    "totalSessions": number,
    "averageAttendance": number,
    "atRiskStudents": number,
    "recentSessions": [
      {
        "id": "string",
        "courseCode": "string",
        "courseName": "string",
        "date": "ISO8601",
        "attendanceRate": number,
        "present": number,
        "total": number
      }
    ]
  }
}
```

## Profile Endpoints

### GET /users/me
Get current user profile.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "student|lecturer",
    "regNumber": "string",
    "phone": "string",
    "isActive": true,
    "createdAt": "ISO8601"
  }
}
```

### PUT /users/me
Update user profile.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string"
  }
}
```

### GET /users/me/notification-preferences
Get notification preferences.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "pushNotifications": true,
    "sessionReminders": true
  }
}
```

### PUT /users/me/notification-preferences
Update notification preferences.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "sessionReminders": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Preferences updated successfully"
}
```

## Device Management

### GET /devices
Get registered devices.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "fingerprint": "string",
      "lastUsed": "ISO8601",
      "isCurrent": true
    }
  ]
}
```

### DELETE /devices/{deviceId}
Remove a device.

**Headers:**
- Authorization: Bearer {accessToken}

**Response (200):**
```json
{
  "success": true,
  "message": "Device removed successfully"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- 100 requests per minute for authenticated endpoints
- 10 requests per minute for authentication endpoints

## Data Types

- All dates are in ISO 8601 format
- Coordinates are in decimal degrees (latitude, longitude)
- Distances are in meters
- Attendance rates are percentages (0-100)