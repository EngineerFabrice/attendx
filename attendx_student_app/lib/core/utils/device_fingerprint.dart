import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';

class DeviceFingerprint {
  static Future<String> generate() async {
    final deviceInfo = DeviceInfoPlugin();
    
    if (defaultTargetPlatform == TargetPlatform.android) {
      final androidInfo = await deviceInfo.androidInfo;
      final raw = '${androidInfo.id}|${androidInfo.model}|${androidInfo.device}';
      return _hashString(raw);
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      final iosInfo = await deviceInfo.iosInfo;
      final raw = '${iosInfo.identifierForVendor}|${iosInfo.model}|${iosInfo.systemVersion}';
      return _hashString(raw);
    }
    
    return _hashString('${DateTime.now().millisecondsSinceEpoch}');
  }
  
  static String _hashString(String input) {
    return input.hashCode.toRadixString(16);
  }
}