import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    await _plugin.initialize(
      settings: const InitializationSettings(android: androidSettings),
    );
    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  static Future<void> showSessionStarted(
      String courseName, String room) async {
    await _plugin.show(
      id: 10,
      title: 'Session Started',
      body: '$courseName in $room — tap to check in',
      notificationDetails: _details(),
    );
  }

  static Future<void> showAttendanceConfirmed(String courseName) async {
    await _plugin.show(
      id: 11,
      title: 'Attendance Confirmed',
      body: 'You have been marked present for $courseName',
      notificationDetails: _details(),
    );
  }

  static Future<void> showAbsenceWarning(
      String courseName, double rate) async {
    await _plugin.show(
      id: 12,
      title: 'Absence Warning',
      body: '$courseName attendance ${rate.toInt()}% — below 75% threshold',
      notificationDetails: _details(),
    );
  }

  static NotificationDetails _details() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'attendx_main',
        'AttendX',
        channelDescription: 'Session and attendance notifications',
        importance: Importance.high,
        priority: Priority.high,
      ),
    );
  }
}
