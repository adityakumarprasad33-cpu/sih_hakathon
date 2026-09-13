import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/user_session.dart';

class AuthService extends ChangeNotifier {
  UserSession? _currentUser;
  bool _isBusy = false;
  String? _errorMessage;

  UserSession? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isBusy => _isBusy;
  String? get errorMessage => _errorMessage;
  String? get idToken => _currentUser?.idToken;

  static const String _sessionKey = 'samadhan_user_session';

  AuthService() {
    loadSavedSession();
  }

  Future<void> loadSavedSession() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionData = prefs.getString(_sessionKey);
    if (sessionData != null) {
      try {
        final session = UserSession.fromJson(jsonDecode(sessionData));
        _currentUser = session;
        notifyListeners();

        // Refresh token if expired
        if (session.isTokenExpired && session.refreshToken != null) {
          await refreshToken();
        }
      } catch (e) {
        debugPrint('[AuthService] Error loading session: $e');
      }
    }
  }

  /// Real Firebase Authentication: Sign in with email and password
  Future<bool> signIn({required String email, required String password}) async {
    _isBusy = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final url = Uri.parse('${FirebaseConstants.authSignInUrl}?key=${FirebaseConstants.apiKey}');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email.trim(),
          'password': password,
          'returnSecureToken': true,
        }),
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final uid = data['localId'] as String;
        final idToken = data['idToken'] as String;
        final refreshToken = data['refreshToken'] as String;
        final expiresIn = int.tryParse(data['expiresIn'] as String? ?? '3600') ?? 3600;
        final expiresAt = DateTime.now().add(Duration(seconds: expiresIn)).millisecondsSinceEpoch;

        final user = UserSession(
          uid: uid,
          email: email.trim(),
          displayName: (data['displayName'] as String?) ?? email.split('@').first.toUpperCase(),
          role: 'patient',
          pairedDeviceId: _currentUser?.pairedDeviceId,
          idToken: idToken,
          refreshToken: refreshToken,
          tokenExpiresAt: expiresAt,
        );

        _currentUser = user;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_sessionKey, jsonEncode(user.toJson()));

        _isBusy = false;
        notifyListeners();
        return true;
      } else {
        final errorMsg = _parseFirebaseError(data);
        _errorMessage = errorMsg;
        _isBusy = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      debugPrint('[AuthService] Sign-in network exception: $e');
      // If network fails but local cached user exists for this email
      if (_currentUser != null && _currentUser!.email == email.trim()) {
        _isBusy = false;
        notifyListeners();
        return true;
      }
      _errorMessage = 'Connection failed. Please check internet access.';
      _isBusy = false;
      notifyListeners();
      return false;
    }
  }

  /// Real Firebase Authentication: Create new patient account
  Future<bool> signUp({required String email, required String password}) async {
    _isBusy = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final url = Uri.parse('${FirebaseConstants.authSignUpUrl}?key=${FirebaseConstants.apiKey}');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email.trim(),
          'password': password,
          'returnSecureToken': true,
        }),
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final uid = data['localId'] as String;
        final idToken = data['idToken'] as String;
        final refreshToken = data['refreshToken'] as String;
        final expiresIn = int.tryParse(data['expiresIn'] as String? ?? '3600') ?? 3600;
        final expiresAt = DateTime.now().add(Duration(seconds: expiresIn)).millisecondsSinceEpoch;

        final user = UserSession(
          uid: uid,
          email: email.trim(),
          displayName: email.split('@').first.toUpperCase(),
          role: 'patient',
          idToken: idToken,
          refreshToken: refreshToken,
          tokenExpiresAt: expiresAt,
        );

        _currentUser = user;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_sessionKey, jsonEncode(user.toJson()));

        _isBusy = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = _parseFirebaseError(data);
        _isBusy = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Registration network error: $e';
      _isBusy = false;
      notifyListeners();
      return false;
    }
  }

  /// Real Firebase token refresh
  Future<bool> refreshToken() async {
    if (_currentUser?.refreshToken == null) return false;

    try {
      final url = Uri.parse('${FirebaseConstants.tokenRefreshUrl}?key=${FirebaseConstants.apiKey}');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'grant_type=refresh_token&refresh_token=${_currentUser!.refreshToken}',
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final newIdToken = data['id_token'] as String;
        final newRefreshToken = data['refresh_token'] as String;
        final expiresIn = int.tryParse(data['expires_in'] as String? ?? '3600') ?? 3600;

        _currentUser = _currentUser!.copyWith(
          idToken: newIdToken,
          refreshToken: newRefreshToken,
          tokenExpiresAt: DateTime.now().add(Duration(seconds: expiresIn)).millisecondsSinceEpoch,
        );

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_sessionKey, jsonEncode(_currentUser!.toJson()));
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[AuthService] Token refresh error: $e');
    }
    return false;
  }

  Future<bool> signInDemo() async {
    return signIn(email: 'patient@samadhan.org', password: 'password123');
  }

  Future<void> signOut() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    notifyListeners();
  }

  String _parseFirebaseError(Map<String, dynamic> data) {
    final error = data['error'];
    if (error is Map && error['message'] != null) {
      final code = error['message'].toString();
      if (code.contains('EMAIL_NOT_FOUND')) return 'No account found with this email address.';
      if (code.contains('INVALID_PASSWORD')) return 'Incorrect password. Please try again.';
      if (code.contains('USER_DISABLED')) return 'This patient account has been deactivated.';
      if (code.contains('EMAIL_EXISTS')) return 'An account with this email address already exists.';
      if (code.contains('WEAK_PASSWORD')) return 'Password should be at least 6 characters.';
      return code;
    }
    return 'Authentication failed. Please verify credentials.';
  }
}
