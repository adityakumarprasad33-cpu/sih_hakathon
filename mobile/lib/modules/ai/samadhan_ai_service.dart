import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? urgency;
  final bool isMaintenance;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.urgency,
    this.isMaintenance = false,
  });
}

class SamadhanAiService extends ChangeNotifier {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String _llmUrl = LlmConstants.defaultLlmUrl;

  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isLoading => _isLoading;
  String get llmUrl => _llmUrl;

  void setCustomLlmUrl(String url) {
    _llmUrl = url;
    notifyListeners();
  }

  SamadhanAiService() {
    _messages.add(
      ChatMessage(
        text:
            "Hello, I am your Samadhan AI Doctor. I am directly connected to our clinical LLM backend and your live wearable telemetry stream to provide real-time physiological explanations and wellness guidance. How can I assist you today?",
        isUser: false,
        timestamp: DateTime.now(),
        urgency: 'AI DOCTOR ONLINE',
      ),
    );
  }

  Future<void> askQuestion({
    required String query,
    TelemetryPacket? currentVitals,
  }) async {
    final cleanQuery = query.trim();
    if (cleanQuery.isEmpty) return;

    _messages.add(ChatMessage(
      text: cleanQuery,
      isUser: true,
      timestamp: DateTime.now(),
    ));
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Build authoritative health telemetry description from real sensor data
      final hr = currentVitals?.heartRate;
      final spo2 = currentVitals?.spo2;
      final temp = currentVitals?.temperature;
      final humidity = currentVitals?.humidity;
      final riskState = currentVitals?.riskLevel.name.toUpperCase() ?? 'NORMAL';
      final fallState = currentVitals?.fallState ?? 'IDLE';

      final telemetrySummary = [
        "Current Vitals: Heart Rate ${hr != null ? '$hr BPM' : 'N/A'}, SpO2 ${spo2 != null ? '${spo2.toStringAsFixed(1)}%' : 'N/A'}, Skin/Ambient Temp ${temp != null ? '${temp.toStringAsFixed(1)}°C' : 'N/A'}, Humidity ${humidity != null ? '${humidity.toStringAsFixed(0)}%' : 'N/A'}.",
        "Risk Assessment: State $riskState, Accel Magnitude: ${currentVitals?.accelMagnitude != null ? '${currentVitals!.accelMagnitude!.toStringAsFixed(2)}g' : '1.0g'}.",
        "Movement/Fall State: $fallState, Fall Alert Active: ${currentVitals?.fallDetected ?? false}.",
      ].join(" ");

      final systemPrompt = [
        "You are the Samadhan Health AI Doctor, an explanatory and guidance clinical assistant.",
        "INVARIANTS:",
        "1. You explain structured sensor evidence and risk metrics already measured by the wearable band.",
        "2. Do NOT invent diagnoses or clinical certainty (use 'risk indicator', 'elevated pattern', 'wellness guidance').",
        "3. Authoritative Risk State: $riskState. Authoritative Fall State: $fallState.",
        "4. Provide concise, clear, and reassuring explanation of the physiological pattern.",
      ].join("\n");

      // Build conversation history
      final conversationHistory = _messages
          .where((m) => !m.isMaintenance)
          .take(6)
          .map((m) => {
                'role': m.isUser ? 'user' : 'assistant',
                'text': m.text,
              })
          .toList();

      final payload = {
        'query': cleanQuery,
        'telemetry': telemetrySummary,
        'prompt': systemPrompt,
        'health_context': {
          'current': {
            'heartRate': hr,
            'spo2': spo2,
            'temperature': temp,
            'humidity': humidity,
            'activity': currentVitals?.movementState ?? 'RESTING',
          },
          'risk': {
            'state': riskState,
            'overall': (currentVitals?.riskScore ?? 15.0) / 100.0,
            'dominantRisk': currentVitals?.fallDetected == true ? 'FALL' : 'CARDIO',
          },
          'fall': {
            'state': fallState,
            'alertActive': currentVitals?.fallDetected ?? false,
          },
          'evidence': [
            hr != null && hr > 110 ? "Heart rate elevated ($hr BPM)" : "Heart rate nominal",
            spo2 != null && spo2 < 95.0 ? "Oxygen saturation suboptimal ($spo2%)" : "Oxygen saturation nominal",
            currentVitals?.fallDetected == true ? "Physical fall impact confirmed by IMU" : "No fall detected",
          ],
        },
        'conversation_history': conversationHistory,
      };

      // 2. Transmit real HTTP request to user's Modal LLM API endpoint with bounded timeout
      final response = await http
          .post(
            Uri.parse(_llmUrl),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode(payload),
          )
          .timeout(Duration(seconds: LlmConstants.requestTimeoutSeconds));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        String explanation = '';
        String urgency = riskState;

        if (data is Map<String, dynamic>) {
          if (data['explanation'] != null && data['explanation'].toString().trim().isNotEmpty) {
            explanation = data['explanation'].toString().trim();
          } else if (data['response'] != null && data['response'].toString().trim().isNotEmpty) {
            explanation = data['response'].toString().trim();
          } else if (data['text'] != null && data['text'].toString().trim().isNotEmpty) {
            explanation = data['text'].toString().trim();
          } else if (data['output'] != null && data['output'].toString().trim().isNotEmpty) {
            explanation = data['output'].toString().trim();
          }

          if (data['urgency'] != null) {
            urgency = data['urgency'].toString().toUpperCase();
          }

          if (data['guidance'] is List && (data['guidance'] as List).isNotEmpty) {
            final guidanceList = (data['guidance'] as List).map((g) => "• ${g.toString()}").join("\n");
            explanation += "\n\nClinical Guidance:\n$guidanceList";
          }
        } else if (data is String) {
          explanation = data;
        }

        if (explanation.isNotEmpty) {
          _messages.add(ChatMessage(
            text: explanation,
            isUser: false,
            timestamp: DateTime.now(),
            urgency: urgency,
          ));
          return;
        }
      }

      // If server returned non-200 or empty response -> State maintenance is going on
      _recordMaintenanceMessage();
    } catch (e) {
      debugPrint('[SamadhanAiService] Real LLM API connection error / timeout: $e');
      // Explicit requirement: if LLM is not responding, notify user that maintenance is in progress!
      _recordMaintenanceMessage();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _recordMaintenanceMessage() {
    _messages.add(ChatMessage(
      text: LlmConstants.maintenanceMessage,
      isUser: false,
      timestamp: DateTime.now(),
      urgency: 'MAINTENANCE',
      isMaintenance: true,
    ));
  }

  void clearHistory() {
    _messages.clear();
    notifyListeners();
  }
}
