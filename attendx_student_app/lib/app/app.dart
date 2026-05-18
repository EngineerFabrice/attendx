import 'package:flutter/material.dart';
import '../shared/theme/app_theme.dart';
import '../features/auth/presentation/splash_screen.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/history/presentation/history_screen.dart';
import '../features/analytics/presentation/analytics_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/profile/presentation/notification_preferences_screen.dart';
import '../features/checkin/presentation/checkin_screen.dart';

class AttendXApp extends StatelessWidget {
  const AttendXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AttendX',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/history': (context) => const HistoryScreen(),
        '/analytics': (context) => const AnalyticsScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/notification-preferences': (context) =>
            const NotificationPreferencesScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/checkin') {
          return MaterialPageRoute(
            builder: (context) => const CheckinScreen(),
            settings: settings,
          );
        }
        return null;
      },
    );
  }
}