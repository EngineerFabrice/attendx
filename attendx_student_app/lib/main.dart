import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/app.dart';
import 'core/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await NotificationService.initialize();

  // Firebase.initializeApp() requires google-services.json — enable when deploying
  // await Firebase.initializeApp();

  runApp(
    const ProviderScope(
      child: AttendXApp(),
    ),
  );
}
