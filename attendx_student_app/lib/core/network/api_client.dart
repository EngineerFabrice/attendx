import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  // Android emulator → use 10.0.2.2 to reach host machine localhost.
  // Physical device  → replace with your machine's LAN IP (e.g. 192.168.1.x).
  // iOS simulator    → use localhost.
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  late Dio _dio;
  final SecureStorage _storage = SecureStorage();

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    // Inject JWT Bearer token on every request
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (err, handler) {
        // 401 handled per-feature (auth_provider clears storage)
        handler.next(err);
      },
    ));
  }

  Dio get dio => _dio;
}
