import 'package:flutter/material.dart';

class AttendanceBadge extends StatelessWidget {
  final String status;
  
  const AttendanceBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;
    
    switch (status.toLowerCase()) {
      case 'present':
        color = Colors.green;
        icon = Icons.check;
        break;
      case 'absent':
        color = Colors.red;
        icon = Icons.close;
        break;
      case 'excused':
        color = Colors.orange;
        icon = Icons.medical_services;
        break;
      case 'late':
        color = Colors.yellow;
        icon = Icons.access_time;
        break;
      default:
        color = Colors.grey;
        icon = Icons.help;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}