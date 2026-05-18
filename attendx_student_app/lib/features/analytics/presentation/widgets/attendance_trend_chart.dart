import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/analytics_provider.dart';

class AttendanceTrendChart extends StatelessWidget {
  final List<TrendDataPoint> data;
  
  const AttendanceTrendChart({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: true),
        titlesData: const FlTitlesData(show: true),
        borderData: FlBorderData(show: true),
        lineBarsData: [
          LineChartBarData(
            spots: data.asMap().entries.map((entry) {
              return FlSpot(entry.key.toDouble(), entry.value.status == 'present' ? 1 : 0);
            }).toList(),
            isCurved: false,
            color: Colors.blue,
            barWidth: 3,
            belowBarData: BarAreaData(show: false),
            dotData: const FlDotData(show: true),
          ),
        ],
      ),
    );
  }
}