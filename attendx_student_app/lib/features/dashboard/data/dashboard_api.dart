import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class DashboardApi {
  final Dio _dio = ApiClient().dio;

  Future<Response> getDashboard() {
    return _dio.get(ApiEndpoints.studentDashboard);
  }

  Future<Response> getActiveSessions() {
    return _dio.get(ApiEndpoints.activeSessions);
  }

  Future<Response> getCourses() {
    return _dio.get(ApiEndpoints.studentCourses);
  }
}