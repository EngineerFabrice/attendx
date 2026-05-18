import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/history_api.dart';

class CourseInfo {
  final String id;
  final String code;
  final String name;

  CourseInfo({required this.id, required this.code, required this.name});

  factory CourseInfo.fromJson(Map<String, dynamic> j) => CourseInfo(
        id: j['id'] as String? ?? '',
        code: j['code'] as String,
        name: j['name'] as String,
      );
}

class ClassroomInfo {
  final String name;

  ClassroomInfo({required this.name});

  factory ClassroomInfo.fromJson(Map<String, dynamic> j) =>
      ClassroomInfo(name: j['name'] as String);
}

class SessionInfo {
  final String sessionCode;
  final CourseInfo course;
  final ClassroomInfo classroom;
  final DateTime startedAt;

  SessionInfo({
    required this.sessionCode,
    required this.course,
    required this.classroom,
    required this.startedAt,
  });

  factory SessionInfo.fromJson(Map<String, dynamic> j) => SessionInfo(
        sessionCode: j['sessionCode'] as String,
        course: CourseInfo.fromJson(j['course'] as Map<String, dynamic>),
        classroom: ClassroomInfo.fromJson(j['classroom'] as Map<String, dynamic>),
        startedAt: DateTime.parse(j['startedAt'] as String),
      );
}

class AttendanceRecord {
  final String id;
  final String status;
  final String? submissionMethod;
  final bool? geofencePassed;
  final DateTime markedAt;
  final SessionInfo session;

  AttendanceRecord({
    required this.id,
    required this.status,
    this.submissionMethod,
    this.geofencePassed,
    required this.markedAt,
    required this.session,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> j) => AttendanceRecord(
        id: j['id'] as String,
        status: j['status'] as String,
        submissionMethod: j['submissionMethod'] as String?,
        geofencePassed: j['geofencePassed'] as bool?,
        markedAt: DateTime.parse(j['markedAt'] as String),
        session: SessionInfo.fromJson(j['session'] as Map<String, dynamic>),
      );
}

class HistoryState {
  final List<AttendanceRecord> allRecords;
  final List<CourseInfo> courses;
  final String? selectedCourseId;
  final DateTime? selectedDay;
  final DateTime focusedDay;
  final Map<DateTime, List<AttendanceRecord>> eventsMap;
  final bool isLoading;

  HistoryState({
    this.allRecords = const [],
    this.courses = const [],
    this.selectedCourseId,
    this.selectedDay,
    DateTime? focusedDay,
    this.eventsMap = const {},
    this.isLoading = false,
  }) : focusedDay = focusedDay ?? DateTime.now();

  List<AttendanceRecord> get filteredRecords {
    var records = allRecords;
    if (selectedCourseId != null) {
      records = records
          .where((r) => r.session.course.id == selectedCourseId)
          .toList();
    }
    if (selectedDay != null) {
      final d = _normalizeDate(selectedDay!);
      records = records
          .where((r) => _normalizeDate(r.markedAt) == d)
          .toList();
    }
    return records;
  }

  HistoryState copyWith({
    List<AttendanceRecord>? allRecords,
    List<CourseInfo>? courses,
    String? selectedCourseId,
    DateTime? selectedDay,
    DateTime? focusedDay,
    Map<DateTime, List<AttendanceRecord>>? eventsMap,
    bool? isLoading,
    bool clearSelectedDay = false,
    bool clearSelectedCourse = false,
  }) {
    return HistoryState(
      allRecords: allRecords ?? this.allRecords,
      courses: courses ?? this.courses,
      selectedCourseId: clearSelectedCourse ? null : (selectedCourseId ?? this.selectedCourseId),
      selectedDay: clearSelectedDay ? null : (selectedDay ?? this.selectedDay),
      focusedDay: focusedDay ?? this.focusedDay,
      eventsMap: eventsMap ?? this.eventsMap,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

DateTime _normalizeDate(DateTime d) => DateTime.utc(d.year, d.month, d.day);

final historyProvider =
    StateNotifierProvider<HistoryNotifier, HistoryState>((ref) {
  return HistoryNotifier();
});

class HistoryNotifier extends StateNotifier<HistoryState> {
  final _api = HistoryApi();

  HistoryNotifier() : super(HistoryState()) {
    loadHistory();
  }

  Future<void> loadHistory() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.getHistory(),
        _api.getCourses(),
      ]);

      final historyResp = results[0];
      final coursesResp = results[1];

      final records = (historyResp.data['data'] as List)
          .map((j) => AttendanceRecord.fromJson(j as Map<String, dynamic>))
          .toList();

      final courses = (coursesResp.data['data'] as List)
          .map((j) => CourseInfo.fromJson(j as Map<String, dynamic>))
          .toList();

      final eventsMap = <DateTime, List<AttendanceRecord>>{};
      for (final r in records) {
        final day = _normalizeDate(r.markedAt);
        eventsMap.putIfAbsent(day, () => []).add(r);
      }

      state = HistoryState(
        allRecords: records,
        courses: courses,
        eventsMap: eventsMap,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  void selectDay(DateTime day) {
    final norm = _normalizeDate(day);
    if (state.selectedDay != null && _normalizeDate(state.selectedDay!) == norm) {
      // Tap again to deselect
      state = state.copyWith(clearSelectedDay: true, focusedDay: day);
    } else {
      state = state.copyWith(selectedDay: day, focusedDay: day);
    }
  }

  void selectCourse(String? courseId) {
    if (courseId == null) {
      state = state.copyWith(clearSelectedCourse: true);
    } else {
      state = state.copyWith(selectedCourseId: courseId);
    }
  }
}
