import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class AuthApi {
  final Dio _dio = ApiClient().dio;

  Future<Response> login(Map<String, dynamic> data) {
    return _dio.post(ApiEndpoints.login, data: data);
  }

  Future<Response> logout() {
    return _dio.post(ApiEndpoints.logout);
  }
}
