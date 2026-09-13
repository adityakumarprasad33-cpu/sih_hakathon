import 'package:flutter_test/flutter_test.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/ai/samadhan_ai_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SamadhanAiService LLM Integration Tests', () {
    test('Initializes with welcome message and clinical context', () {
      final ai = SamadhanAiService();
      expect(ai.messages.length, 1);
      expect(ai.messages.first.isUser, isFalse);
      expect(ai.messages.first.text, contains('Samadhan AI Doctor'));
    });

    test('Falls back gracefully to maintenance notice when LLM is offline or times out', () async {
      final ai = SamadhanAiService();
      // Point to an unreachable mock port to trigger immediate connection exception
      ai.setCustomLlmUrl('http://127.0.0.1:54321/offline_llm');

      final packet = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: 82,
        spo2: 97.5,
        temperature: 36.8,
        humidity: 50.0,
      );

      await ai.askQuestion(
        query: 'What is my current cardiac rhythm?',
        currentVitals: packet,
      );

      expect(ai.messages.length, 3); // initial + user query + response
      final lastMsg = ai.messages.last;

      expect(lastMsg.isUser, isFalse);
      expect(lastMsg.isMaintenance, isTrue);
      expect(lastMsg.urgency, 'MAINTENANCE');
      expect(lastMsg.text, LlmConstants.maintenanceMessage);
      expect(lastMsg.text, contains('maintenance'));
    });
  });
}
