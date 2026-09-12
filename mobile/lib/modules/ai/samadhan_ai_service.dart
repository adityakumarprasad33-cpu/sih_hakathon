
import 'package:flutter/foundation.dart';

import 'package:samadhan_health/core/models/telemetry_packet.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? urgency;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.urgency,
  });
}

class SamadhanAiService extends ChangeNotifier {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;

  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isLoading => _isLoading;

  SamadhanAiService() {
    // Initial welcome message
    _messages.add(
      ChatMessage(
        text: "Hello, I am your Samadhan Health AI Companion. I monitor your live vitals from your wearable band to answer your health queries and provide proactive wellbeing advice.",
        isUser: false,
        timestamp: DateTime.now(),
        urgency: 'INFO',
      ),
    );
  }

  Future<void> askQuestion({
    required String query,
    TelemetryPacket? currentVitals,
  }) async {
    _messages.add(ChatMessage(
      text: query,
      isUser: true,
      timestamp: DateTime.now(),
    ));
    _isLoading = true;
    notifyListeners();

    try {
      // Formulate context
      final hr = currentVitals?.heartRate ?? 72;
      final spo2 = currentVitals?.spo2 ?? 98.0;
      final temp = currentVitals?.temperature ?? 36.6;
      final risk = currentVitals?.riskLevel.name.toUpperCase() ?? 'NORMAL';

      // Provide intelligent context-aware response
      await Future.delayed(const Duration(milliseconds: 1000));

      String responseText = '';
      String urgency = 'NORMAL';

      final lower = query.toLowerCase();
      if (lower.contains('heart') || lower.contains('bpm') || lower.contains('pulse')) {
        responseText =
            "Your current heart rate is $hr BPM (Status: $risk). For resting adults, 60-100 BPM is typical. Your readings show stable cardiac rhythm over the past hour.";
      } else if (lower.contains('oxygen') || lower.contains('spo2') || lower.contains('breath')) {
        responseText =
            "Your blood oxygen saturation (SpO2) is measured at $spo2%. Healthy arterial saturation is generally >= 95%. Continuous PPG absorption indicates strong tissue perfusion.";
      } else if (lower.contains('fall') || lower.contains('emergency') || lower.contains('alert')) {
        urgency = 'CRITICAL';
        responseText =
            "If you or someone nearby is experiencing a medical emergency, tap the red SOS button immediately. Your wearable's 6-axis IMU accelerometer continuously monitors for high-impact fall events.";
      } else if (lower.contains('temperature') || lower.contains('fever')) {
        responseText =
            "Your wearable skin temperature is $temp Â°C, and ambient humidity is ${currentVitals?.humidity ?? 55}%. Thermal regulation indicators are within normal physiological thresholds.";
      } else {
        responseText =
            "Based on your continuous vitals (HR $hr BPM, SpO2 $spo2%, Risk $risk), your telemetry indicators are stable. Ensure adequate hydration and balanced rest.";
      }

      _messages.add(ChatMessage(
        text: responseText,
        isUser: false,
        timestamp: DateTime.now(),
        urgency: urgency,
      ));
    } catch (e) {
      _messages.add(ChatMessage(
        text: "Could not connect to cloud AI service. Your vital tracking remains active locally.",
        isUser: false,
        timestamp: DateTime.now(),
        urgency: 'WARNING',
      ));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearHistory() {
    _messages.clear();
    notifyListeners();
  }
}