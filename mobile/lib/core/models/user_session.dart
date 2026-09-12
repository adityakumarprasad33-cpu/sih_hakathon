class UserSession {
  final String uid;
  final String email;
  final String displayName;
  final String role; // 'patient' or 'doctor'
  final String? pairedDeviceId;
  final List<String> emergencyContacts;

  UserSession({
    required this.uid,
    required this.email,
    required this.displayName,
    this.role = 'patient',
    this.pairedDeviceId,
    this.emergencyContacts = const ['+91 98765 43210'],
  });

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'role': role,
      'pairedDeviceId': pairedDeviceId,
      'emergencyContacts': emergencyContacts,
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
    );
  }

  UserSession copyWith({
    String? pairedDeviceId,
    List<String>? emergencyContacts,
  }) {
    return UserSession(
      uid: uid,
      email: email,
      displayName: displayName,
      role: role,
      pairedDeviceId: pairedDeviceId ?? this.pairedDeviceId,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
    );
  }
}