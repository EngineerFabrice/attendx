import 'package:dio/dio.dart';

class MockInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final path = options.path;

    // ── Auth ────────────────────────────────────────────────────────────────
    if (path.contains('/auth/login')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'user': {
              'id': 'stu-001',
              'fullName': 'Fabrice NDAYISABA',
              'email': 'student@attendx.com',
              'role': 'student',
              'regNumber': '223008047',
              'isActive': true,
              'createdAt': '2024-09-01T00:00:00.000Z',
            },
            'tokens': {
              'accessToken': 'mock-jwt-access-token',
              'refreshToken': 'mock-jwt-refresh-token',
              'expiresIn': 3600,
            },
          },
        },
      ));
    }

    if (path.contains('/auth/logout')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {'success': true},
      ));
    }

    // ── Dashboard ────────────────────────────────────────────────────────────
    if (path.contains('/students/dashboard')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'profile': {
              'id': 'stu-001',
              'fullName': 'Fabrice NDAYISABA',
              'email': 'student@attendx.com',
              'role': 'student',
              'regNumber': '223008047',
              'enrolledCourses': 5,
              'attendanceRate': 82.4,
            },
            'overallAttendanceRate': 82.4,
            'todaySessions': [
              {
                'id': 'sess-001',
                'sessionCode': 'AB3X9K',
                'status': 'active',
                'checkinOpen': true,
                'course': {'id': 'c1', 'code': 'CS301', 'name': 'Advanced Databases'},
                'classroom': {
                  'name': 'LT-3',
                  'latitude': -1.9441,
                  'longitude': 30.0619,
                  'radiusM': 30.0,
                },
                'startedAt': DateTime.now().toIso8601String(),
                'expiresAt':
                    DateTime.now().add(const Duration(minutes: 90)).toIso8601String(),
              },
              {
                'id': 'sess-002',
                'sessionCode': 'ZK7M2P',
                'status': 'upcoming',
                'checkinOpen': false,
                'course': {'id': 'c2', 'code': 'CS201', 'name': 'Data Structures'},
                'classroom': {
                  'name': 'LT-1',
                  'latitude': -1.9450,
                  'longitude': 30.0625,
                  'radiusM': 30.0,
                },
                'startedAt':
                    DateTime.now().add(const Duration(hours: 2)).toIso8601String(),
                'expiresAt':
                    DateTime.now().add(const Duration(hours: 4)).toIso8601String(),
              },
            ],
          },
        },
      ));
    }

    // ── Check-in ─────────────────────────────────────────────────────────────
    if (path.contains('/checkin')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'status': 'checked_in',
            'distanceM': 18.4,
            'checkedInAt': DateTime.now().toIso8601String(),
            'message': 'Attendance recorded successfully.',
          },
        },
      ));
    }

    // ── Attendance History ────────────────────────────────────────────────────
    if (path.contains('/attendance/history')) {
      final now = DateTime.now();
      final records = <Map<String, dynamic>>[];

      final courses = [
        {'id': 'c1', 'code': 'CS301', 'name': 'Advanced Databases', 'room': 'LT-3'},
        {'id': 'c2', 'code': 'CS201', 'name': 'Data Structures', 'room': 'LT-1'},
        {'id': 'c3', 'code': 'CS401', 'name': 'Software Engineering', 'room': 'LT-5'},
        {'id': 'c4', 'code': 'MATH301', 'name': 'Numerical Methods', 'room': 'R-102'},
        {'id': 'c5', 'code': 'CS350', 'name': 'Computer Networks', 'room': 'LT-2'},
      ];

      // Present pattern: mostly present, some absences to create realistic data
      final sessionPattern = [
        {'daysAgo': 1, 'courseIdx': 0, 'status': 'present'},
        {'daysAgo': 2, 'courseIdx': 1, 'status': 'present'},
        {'daysAgo': 3, 'courseIdx': 2, 'status': 'present'},
        {'daysAgo': 4, 'courseIdx': 3, 'status': 'absent'},
        {'daysAgo': 5, 'courseIdx': 4, 'status': 'present'},
        {'daysAgo': 7, 'courseIdx': 0, 'status': 'present'},
        {'daysAgo': 8, 'courseIdx': 1, 'status': 'present'},
        {'daysAgo': 9, 'courseIdx': 2, 'status': 'absent'},
        {'daysAgo': 10, 'courseIdx': 3, 'status': 'present'},
        {'daysAgo': 11, 'courseIdx': 4, 'status': 'present'},
        {'daysAgo': 14, 'courseIdx': 0, 'status': 'present'},
        {'daysAgo': 15, 'courseIdx': 1, 'status': 'absent'},
        {'daysAgo': 16, 'courseIdx': 2, 'status': 'present'},
        {'daysAgo': 17, 'courseIdx': 3, 'status': 'present'},
        {'daysAgo': 18, 'courseIdx': 4, 'status': 'present'},
        {'daysAgo': 21, 'courseIdx': 0, 'status': 'present'},
        {'daysAgo': 22, 'courseIdx': 1, 'status': 'present'},
        {'daysAgo': 23, 'courseIdx': 2, 'status': 'absent'},
        {'daysAgo': 24, 'courseIdx': 3, 'status': 'present'},
        {'daysAgo': 25, 'courseIdx': 4, 'status': 'present'},
        {'daysAgo': 28, 'courseIdx': 0, 'status': 'present'},
        {'daysAgo': 29, 'courseIdx': 1, 'status': 'present'},
        {'daysAgo': 30, 'courseIdx': 2, 'status': 'present'},
        {'daysAgo': 31, 'courseIdx': 3, 'status': 'absent'},
        {'daysAgo': 32, 'courseIdx': 4, 'status': 'present'},
      ];

      for (var i = 0; i < sessionPattern.length; i++) {
        final p = sessionPattern[i];
        final daysAgo = p['daysAgo'] as int;
        final courseIdx = p['courseIdx'] as int;
        final status = p['status'] as String;
        final course = courses[courseIdx];
        final sessionDate = now.subtract(Duration(days: daysAgo));

        records.add({
          'id': 'att-${i + 1}',
          'status': status,
          'submissionMethod': status == 'present' ? 'app' : null,
          'geofencePassed': status == 'present' ? true : null,
          'markedAt': sessionDate.toIso8601String(),
          'session': {
            'id': 'sess-${100 + i}',
            'sessionCode': 'S${(1000 + i)}',
            'course': {'id': course['id'], 'code': course['code'], 'name': course['name']},
            'classroom': {'name': course['room']},
            'startedAt': sessionDate.toIso8601String(),
          },
        });
      }

      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': records,
          'meta': {'page': 1, 'limit': 50, 'total': records.length},
        },
      ));
    }

    // ── Analytics ────────────────────────────────────────────────────────────
    if (path.contains('/students/analytics')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': {
            'overallRate': 82.4,
            'currentStreak': 5,
            'longestStreak': 8,
            'courseStats': [
              {
                'id': 'c1',
                'code': 'CS301',
                'name': 'Advanced Databases',
                'attendanceRate': 85.7,
                'totalSessions': 14,
                'presentSessions': 12,
              },
              {
                'id': 'c2',
                'code': 'CS201',
                'name': 'Data Structures',
                'attendanceRate': 78.6,
                'totalSessions': 14,
                'presentSessions': 11,
              },
              {
                'id': 'c3',
                'code': 'CS401',
                'name': 'Software Engineering',
                'attendanceRate': 71.4,
                'totalSessions': 14,
                'presentSessions': 10,
              },
              {
                'id': 'c4',
                'code': 'MATH301',
                'name': 'Numerical Methods',
                'attendanceRate': 92.3,
                'totalSessions': 13,
                'presentSessions': 12,
              },
              {
                'id': 'c5',
                'code': 'CS350',
                'name': 'Computer Networks',
                'attendanceRate': 69.2,
                'totalSessions': 13,
                'presentSessions': 9,
              },
            ],
            'trendData': _buildTrendData(),
          },
        },
      ));
    }

    // ── Courses ───────────────────────────────────────────────────────────────
    if (path.contains('/students/courses')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': [
            {'id': 'c1', 'code': 'CS301', 'name': 'Advanced Databases', 'credits': 3},
            {'id': 'c2', 'code': 'CS201', 'name': 'Data Structures', 'credits': 3},
            {'id': 'c3', 'code': 'CS401', 'name': 'Software Engineering', 'credits': 3},
            {'id': 'c4', 'code': 'MATH301', 'name': 'Numerical Methods', 'credits': 2},
            {'id': 'c5', 'code': 'CS350', 'name': 'Computer Networks', 'credits': 3},
          ],
        },
      ));
    }

    // ── Active sessions ───────────────────────────────────────────────────────
    if (path.contains('/students/sessions/active')) {
      return handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {
          'success': true,
          'data': [
            {
              'id': 'sess-001',
              'sessionCode': 'AB3X9K',
              'status': 'active',
              'checkinOpen': true,
              'course': {'id': 'c1', 'code': 'CS301', 'name': 'Advanced Databases'},
              'classroom': {
                'name': 'LT-3',
                'latitude': -1.9441,
                'longitude': 30.0619,
                'radiusM': 30.0,
              },
              'startedAt': DateTime.now().toIso8601String(),
              'expiresAt':
                  DateTime.now().add(const Duration(minutes: 90)).toIso8601String(),
            },
          ],
        },
      ));
    }

    handler.next(options);
  }

  static List<Map<String, dynamic>> _buildTrendData() {
    final now = DateTime.now();
    final patterns = [
      {'days': 32, 'status': 'present'},
      {'days': 31, 'status': 'absent'},
      {'days': 30, 'status': 'present'},
      {'days': 29, 'status': 'present'},
      {'days': 28, 'status': 'present'},
      {'days': 25, 'status': 'present'},
      {'days': 24, 'status': 'present'},
      {'days': 23, 'status': 'absent'},
      {'days': 22, 'status': 'present'},
      {'days': 21, 'status': 'present'},
      {'days': 18, 'status': 'present'},
      {'days': 17, 'status': 'present'},
      {'days': 16, 'status': 'absent'},
      {'days': 15, 'status': 'present'},
      {'days': 14, 'status': 'present'},
      {'days': 11, 'status': 'present'},
      {'days': 10, 'status': 'present'},
      {'days': 9, 'status': 'absent'},
      {'days': 8, 'status': 'present'},
      {'days': 7, 'status': 'present'},
      {'days': 5, 'status': 'present'},
      {'days': 4, 'status': 'absent'},
      {'days': 3, 'status': 'present'},
      {'days': 2, 'status': 'present'},
      {'days': 1, 'status': 'present'},
    ];

    return patterns.map((p) {
      final date = now.subtract(Duration(days: p['days'] as int));
      return {
        'sessionDate': date.toIso8601String().substring(0, 10),
        'status': p['status'],
      };
    }).toList();
  }
}
