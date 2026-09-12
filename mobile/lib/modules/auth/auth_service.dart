import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/models/user_session.dart';

class AuthService extends ChangeNotifier {
  UserSession? _currentUser;
  bool _isBusy = false;
  String? _errorMessage;

  UserSession? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isBusy => _isBusy;
  String? get errorMessage => _errorMessage;

  static const String _sessionKey = 'samadhan_user_session';

  AuthService() {
    loadSavedSession();
  }

  Future<void> loadSavedSession() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionData = prefs.getString(_sessionKey);
    if (sessionData != null) {
      try {
        _currentUser = UserSession.fromJson(jsonDecode(sessionData));
        notifyListeners();
      } catch (_) {}
    }
  }

  Future<bool> signIn({required String email, required String password}) async {
    _isBusy = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Simulate quick secure validation or integrate Firebase Auth REST
      await Future.delayed(const Duration(milliseconds: 600));

      final user = UserSession(
        uid: 'usr_',
        email: email,
        displayName: email.split('@').first.toUpperCase(),
        role: 'patient',
        pairedDeviceId: 'SAMADHAN-BAND-SIM',
      );

      _currentUser = user;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_sessionKey, jsonEncode(user.toJson()));

      _isBusy = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isBusy = false;
      notifyListeners();
      return false;
    }
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
}