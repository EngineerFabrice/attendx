import 'dart:math';

class Haversine {
  static const double earthRadiusM = 6371000; // Earth radius in meters
  
  static double calculateDistance(
    double lat1, double lon1,
    double lat2, double lon2,
  ) {
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    
    final a = pow(sin(dLat / 2), 2) +
        cos(_toRadians(lat1)) * cos(_toRadians(lat2)) *
        pow(sin(dLon / 2), 2);
    
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    
    return earthRadiusM * c;
  }
  
  static double _toRadians(double degree) {
    return degree * pi / 180;
  }
}