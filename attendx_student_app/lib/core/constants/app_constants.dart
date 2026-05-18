class AppConstants {
  static const String appName = 'AttendX';
  static const String apiBaseUrl = 'https://api.attendx.ac.rw/v1';
  static const int sessionTimeoutMinutes = 90;
  static const double defaultGeofenceRadius = 30.0;
  static const int attendanceWarningThreshold = 2;
  
  // Shared Preferences Keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUser = 'user';
  static const String keyDeviceFingerprint = 'device_fingerprint';
}