class UserSession {
  final String uid;
  final String email;
  final String displayName;
  final String role; // 'patient' or 'doctor'
  final String? pairedDeviceId;
  final List<String> emergencyContacts;
  final String? idToken; // Real Firebase Auth ID Token for RTDB ?auth= query
  final String? refreshToken;
  final int? tokenExpiresAt;

  UserSession({
    required this.uid,
    required this.email,
    required this.displayName,
    this.role = 'patient',
    this.pairedDeviceId,
    this.emergencyContacts = const ['+91 98765 43210'],
    this.idToken,
    this.refreshToken,
    this.tokenExpiresAt,
  });

  bool get isTokenExpired {
    if (tokenExpiresAt == null) return false;
    return DateTime.now().millisecondsSinceEpoch >= tokenExpiresAt!;
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'role': role,
      'pairedDeviceId': pairedDeviceId,
      'emergencyContacts': emergencyContacts,
      'idToken': idToken,
      'refreshToken': refreshToken,
      'tokenExpiresAt': tokenExpiresAt,
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      uid: json['uid'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String? ?? 'Samadhan Patient',
      role: json['role'] as String? ?? 'patient',
      pairedDeviceId: json['pairedDeviceId'] as String?,
      emergencyContacts: (json['emergencyContacts'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const ['+91 98765 43210'],
      idToken: json['idToken'] as String?,
      refreshToken: json['refreshToken'] as String?,
      tokenExpiresAt: json['tokenExpiresAt'] as int?,
    );
  }

  UserSession copyWith({
    String? pairedDeviceId,
    List<String>? emergencyContacts,
    String? idToken,
    String? refreshToken,
    int? tokenExpiresAt,
  }) {
    return UserSession(
      uid: uid,
      email: email,
      displayName: displayName,
      role: role,
      pairedDeviceId: pairedDeviceId ?? this.pairedDeviceId,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
      idToken: idToken ?? this.idToken,
      refreshToken: refreshToken ?? this.refreshToken,
      tokenExpiresAt: tokenExpiresAt ?? this.tokenExpiresAt,
    );
  }
}
