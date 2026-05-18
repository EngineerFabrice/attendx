import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class CheckinApi {
  final Dio _dio = ApiClient().dio;

  Future<Response> checkIn(String sessionId, Map<String, dynamic> data) {
    return _dio.post(ApiEndpoints.checkin, data: {
      'sessionId': sessionId,
      ...data,
    });
  }
}
