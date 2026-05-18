import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/analytics_provider.dart';
import 'widgets/attendance_trend_chart.dart';
import '../../../../shared/widgets/main_bottom_nav.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(analyticsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      bottomNavigationBar: const MainBottomNav(currentIndex: 2),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(analyticsProvider.notifier).loadAnalytics(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Risk Alert Banner ────────────────────────────────
                    if (state.atRiskCourses.isNotEmpty)
                      _RiskAlertBanner(courses: state.atRiskCourses),

                    // ── Overall Rate ─────────────────────────────────────
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            const Text(
                              'Overall Attendance Rate',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${state.overallRate?.toInt() ?? 0}%',
                              style: TextStyle(
                                fontSize: 52,
                                fontWeight: FontWeight.bold,
                                color: _rateColor(state.overallRate ?? 0),
                              ),
                            ),
                            const SizedBox(height: 8),
                            LinearProgressIndicator(
                              value: (state.overallRate ?? 0) / 100,
                              backgroundColor: Colors.grey.shade200,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                _rateColor(state.overallRate ?? 0),
                              ),
                              minHeight: 8,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              (state.overallRate ?? 0) >= 75
                                  ? 'Good standing'
                                  : 'Below minimum threshold',
                              style: TextStyle(
                                fontSize: 12,
                                color: _rateColor(state.overallRate ?? 0),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ── Streak Cards ─────────────────────────────────────
                    Row(
                      children: [
                        Expanded(
                          child: _StreakCard(
                            label: 'Current Streak',
                            value: state.currentStreak,
                            icon: Icons.local_fire_department,
                            color: state.currentStreak >= 5
                                ? Colors.orange
                                : Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StreakCard(
                            label: 'Longest Streak',
                            value: state.longestStreak,
                            icon: Icons.emoji_events,
                            color: Colors.amber,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // ── Trend Chart ───────────────────────────────────────
                    const Text(
                      'Attendance Trend',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 200,
                      child: AttendanceTrendChart(data: state.trendData),
                    ),

                    const SizedBox(height: 24),

                    // ── Course Breakdown ──────────────────────────────────
                    const Text(
                      'Course Breakdown',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    ...state.courseStats.map((course) => Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            course.name,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            course.code,
                                            style: TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey.shade600),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (course.isAtRisk)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.red.shade50,
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          border: Border.all(
                                              color: Colors.red.shade300),
                                        ),
                                        child: Text(
                                          'At Risk',
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: Colors.red.shade700,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(4),
                                        child: LinearProgressIndicator(
                                          value: course.attendanceRate / 100,
                                          backgroundColor: Colors.grey.shade200,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                            _rateColor(course.attendanceRate),
                                          ),
                                          minHeight: 8,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${course.attendanceRate.toInt()}%',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        color: _rateColor(course.attendanceRate),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${course.presentSessions} / ${course.totalSessions} sessions attended',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ),
                        )),
                  ],
                ),
              ),
            ),
    );
  }

  Color _rateColor(double rate) {
    if (rate >= 80) return Colors.green;
    if (rate >= 75) return Colors.orange;
    return Colors.red;
  }
}

class _StreakCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color color;

  const _StreakCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              '$value',
              style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: color),
            ),
            Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            Text(
              value == 1 ? 'session' : 'sessions',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
          ],
        ),
      ),
    );
  }
}

class _RiskAlertBanner extends StatelessWidget {
  final List<CourseStat> courses;

  const _RiskAlertBanner({required this.courses});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_amber_rounded,
                  color: Colors.red.shade700, size: 20),
              const SizedBox(width: 8),
              Text(
                'Attendance Risk Alert',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.red.shade700),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ...courses.map((c) => Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  '• ${c.name} — ${c.attendanceRate.toInt()}% (below 75%)',
                  style: TextStyle(fontSize: 13, color: Colors.red.shade800),
                ),
              )),
        ],
      ),
    );
  }
}
