import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/checkin_api.dart';
import '../../../../core/services/socket_service.dart';
import '../../../../core/services/notification_service.dart';

final checkinProvider =
    StateNotifierProvider<CheckinNotifier, CheckinState>((ref) {
  return CheckinNotifier();
});

class CheckinState {
  final bool isCheckingIn;
  final String? error;

  CheckinState({this.isCheckingIn = false, this.error});

  CheckinState copyWith({bool? isCheckingIn, String? error}) {
    return CheckinState(
      isCheckingIn: isCheckingIn ?? this.isCheckingIn,
      error: error ?? this.error,
    );
  }
}

class CheckinNotifier extends StateNotifier<CheckinState> {
  final _api = CheckinApi();

  CheckinNotifier() : super(CheckinState());

  Future<bool> checkIn({
    required String sessionId,
    required double latitude,
    required double longitude,
    String courseName = '',
  }) async {
    state = state.copyWith(isCheckingIn: true, error: null);
    try {
      final response = await _api.checkIn(sessionId, {
        'latitude': latitude,
        'longitude': longitude,
      });

      final success = response.data['success'] as bool? ?? false;
      state = state.copyWith(isCheckingIn: false);

      if (success) {
        // Emit real-time check-in event
        SocketService().emitStudentCheckin({
          'sessionId': sessionId,
          'latitude': latitude,
          'longitude': longitude,
        });
        // Confirm with local notification
        if (courseName.isNotEmpty) {
          await NotificationService.showAttendanceConfirmed(courseName);
        }
      }

      return success;
    } catch (e) {
      state = state.copyWith(isCheckingIn: false, error: e.toString());
      return false;
    }
  }
}
