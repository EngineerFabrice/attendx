import 'package:flutter/material.dart';
import '../providers/dashboard_provider.dart';

class ActiveSessionCard extends StatelessWidget {
  final TodaySession session;

  const ActiveSessionCard({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    final isActive = session.isActive;

    return Card(
      elevation: isActive ? 3 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isActive
            ? BorderSide(color: Colors.green.shade300, width: 1.5)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: isActive
            ? () {
                Navigator.pushNamed(
                  context,
                  '/checkin',
                  arguments: {
                    'sessionId': session.id,
                    'sessionCode': session.sessionCode,
                    'courseName': session.course.name,
                    'roomName': session.classroom.name,
                    'classroomLat': session.classroom.latitude,
                    'classroomLng': session.classroom.longitude,
                    'radiusM': session.classroom.radiusM,
                  },
                );
              }
            : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status badge + code
              Row(
                children: [
                  _StatusBadge(isActive: isActive),
                  const Spacer(),
                  Text(
                    session.sessionCode,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Course name
              Text(
                session.course.name,
                style: const TextStyle(
                    fontSize: 17, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                session.course.code,
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 8),
              // Room + time
              Row(
                children: [
                  Icon(Icons.location_on,
                      size: 15, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text(session.classroom.name,
                      style: TextStyle(
                          color: Colors.grey.shade600, fontSize: 13)),
                  const Spacer(),
                  Icon(Icons.access_time,
                      size: 15, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text(
                    isActive
                        ? 'Until ${_formatTime(session.expiresAt)}'
                        : 'Starts ${_formatTime(session.startedAt)}',
                    style: TextStyle(
                        color: Colors.grey.shade600, fontSize: 13),
                  ),
                ],
              ),
              if (isActive) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'Tap to Check In',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}

class _StatusBadge extends StatelessWidget {
  final bool isActive;

  const _StatusBadge({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.green.shade100 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        isActive ? 'LIVE' : 'UPCOMING',
        style: TextStyle(
          color: isActive ? Colors.green.shade700 : Colors.grey.shade600,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
