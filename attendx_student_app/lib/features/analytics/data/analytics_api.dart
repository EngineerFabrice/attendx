import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class AnalyticsApi {
  final Dio _dio = ApiClient().dio;

  Future<Response> getAnalytics() {
    return _dio.get(ApiEndpoints.studentAnalytics);
  }
}
