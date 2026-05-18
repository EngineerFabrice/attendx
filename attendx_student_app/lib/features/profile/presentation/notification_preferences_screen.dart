import 'package:flutter/material.dart';

class NotificationPreferencesScreen extends StatelessWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: ListView(
        children: const [
          ListTile(
            leading: Icon(Icons.check_circle_outline),
            title: Text('Attendance Confirmation'),
            subtitle: Text('Get notified when attendance is marked'),
            trailing: Switch(value: true, onChanged: null),
          ),
          ListTile(
            leading: Icon(Icons.warning_amber_outlined),
            title: Text('Missed Attendance'),
            subtitle: Text('Get notified when marked absent'),
            trailing: Switch(value: true, onChanged: null),
          ),
          ListTile(
            leading: Icon(Icons.notifications_active_outlined),
            title: Text('Session Started'),
            subtitle: Text('Get notified when lecturer starts a session'),
            trailing: Switch(value: true, onChanged: null),
          ),
        ],
      ),
    );
  }
}