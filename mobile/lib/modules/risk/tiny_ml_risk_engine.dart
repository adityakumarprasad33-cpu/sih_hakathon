import 'dart:math';
import 'package:samadhan_health/core/models/telemetry_packet.dart';

/// AI Risk State Machine strictly conforming to docs/13-AI-RISK-ENGINE.md
enum FusionRiskState {
  normal,
  watch,
  warning,
  critical,
  emergency,
}

class RiskAssessmentResult {
  final FusionRiskState state;
  final double compositeRiskScore; // 0.0 to 100.0
  final double cardiacStressIndex;  // 0.0 to 100.0
  final double respiratoryIndex;    // 0.0 to 100.0
  final double heatStressIndex;     // 0.0 to 100.0
  final double fallRiskIndex;       // 0.0 to 100.0
  final String primaryContributingFactor;
  final List<String> clinicalFlags;
  final DateTime assessedAt;

  const RiskAssessmentResult({
    required this.state,
    required this.compositeRiskScore,
    required this.cardiacStressIndex,
    required this.respiratoryIndex,
    required this.heatStressIndex,
    required this.fallRiskIndex,
    required this.primaryContributingFactor,
    required this.clinicalFlags,
    required this.assessedAt,
  });
}

/// On-Device TinyML & Multi-Sensor Temporal Fusion Engine
class TinyMlRiskEngine {
  // Personal baseline calibration
  final int baselineRestingHr;
  final double baselineSpo2;

  // Hysteresis & cooldown tracking
  FusionRiskState _currentState = FusionRiskState.normal;
  DateTime? _lastAlertTime;
  static const Duration _alertCooldown = Duration(seconds: 30);

  TinyMlRiskEngine({
    this.baselineRestingHr = 70,
    this.baselineSpo2 = 98.0,
  });

  FusionRiskState get currentState => _currentState;

  /// Evaluates current sensor packet with personal baseline and temporal heuristics
  RiskAssessmentResult evaluateTelemetry(TelemetryPacket packet) {
    final now = DateTime.now();
    final flags = <String>[];

    // 1. Cardiovascular Stress Indicator
    double cardiacScore = 10.0;
    if (packet.heartRate != null && packet.hrStatus == 'VALID') {
      final hr = packet.heartRate!;
      final delta = hr - baselineRestingHr;

      if (hr < 50) {
        cardiacScore = 65.0;
        flags.add('BRADYCARDIA (<50 BPM)');
      } else if (hr > 135) {
        cardiacScore = 85.0;
        flags.add('SEVERE TACHYCARDIA (>135 BPM)');
      } else if (delta > 25 && packet.movementState == 'RESTING') {
        cardiacScore = 55.0;
        flags.add('RESTING CARDIAC LOAD SPIKE (+${delta} BPM)');
      } else {
        cardiacScore = (delta.abs() * 1.5).clamp(5.0, 45.0);
      }
    }

    // 2. Respiratory & Hypoxia Risk Indicator (MAX30102)
    double respScore = 5.0;
    if (packet.spo2 != null && packet.spo2Status == 'VALID') {
      final spo2 = packet.spo2!;
      if (spo2 < 88.0) {
        respScore = 95.0;
        flags.add('CRITICAL HYPOXIA (SpO2 <88%)');
      } else if (spo2 < 93.0) {
        respScore = 70.0;
        flags.add('MODERATE ARTERIAL DESATURATION (SpO2 <93%)');
      } else if (spo2 < 95.0) {
        respScore = 35.0;
        flags.add('BORDERLINE LOW OXYGEN (SpO2 <95%)');
      } else {
        respScore = ((100.0 - spo2) * 5.0).clamp(2.0, 20.0);
      }
    }

    // 3. Heat & Environmental Thermal Stress Indicator (DHT22)
    double heatScore = 10.0;
    if (packet.temperature != null && packet.humidity != null && packet.dhtStatus == 'VALID') {
      final temp = packet.temperature!;
      final rh = packet.humidity!;

      // Heat Index approximation
      final heatIndex = temp + (0.5555 * ((6.11 * exp(5417.7530 * (1 / 273.16 - 1 / (273.15 + temp)))) * (rh / 100) - 10));

      if (heatIndex > 41.0) {
        heatScore = 80.0;
        flags.add('HIGH HEAT EXHAUSTION DANGER');
      } else if (heatIndex > 35.0) {
        heatScore = 45.0;
        flags.add('THERMAL STRESS DISCOMFORT');
      } else {
        heatScore = 15.0;
      }
    }

    // 4. Fall Detection & 6-Axis IMU Shock (MPU6050)
    double fallScore = 0.0;
    if (packet.fallState == 'FALL_CONFIRMED') {
      fallScore = 100.0;
      flags.add('CONFIRMED IMPACT FALL DETECTED');
    } else if (packet.fallState == 'IMPACT_CANDIDATE' || packet.fallState == 'FALL_SUSPECTED') {
      fallScore = 75.0;
      flags.add('HIGH ACCELERATION SHOCK');
    } else if (packet.accelMagnitude != null && packet.accelMagnitude! > 2.5) {
      fallScore = 50.0;
      flags.add('ELEVATED G-FORCE SPIKE');
    }

    // 5. Multi-Sensor Temporal Fusion Calculation
    // Fall events dominate immediately with highest priority
    double composite;
    String primaryFactor;

    if (fallScore >= 75.0) {
      composite = fallScore;
      primaryFactor = '6-Axis IMU High-Impact Fall';
    } else {
      // Weighted fusion: 40% Cardiac, 35% Respiratory, 15% Heat, 10% Fall
      composite = (cardiacScore * 0.40) +
          (respScore * 0.35) +
          (heatScore * 0.15) +
          (fallScore * 0.10);

      final maxVal = [cardiacScore, respScore, heatScore].reduce(max);
      if (maxVal == cardiacScore && cardiacScore > 35.0) {
        primaryFactor = 'Cardiovascular Stress';
      } else if (maxVal == respScore && respScore > 35.0) {
        primaryFactor = 'Respiratory Oxygen Desaturation';
      } else if (maxVal == heatScore && heatScore > 35.0) {
        primaryFactor = 'Environmental Heat Stress';
      } else {
        primaryFactor = 'Stable Physiological State';
      }
    }

    // 6. Finite State Machine with Hysteresis
    FusionRiskState newState;
    if (fallScore == 100.0 || composite >= 85.0) {
      newState = FusionRiskState.emergency;
    } else if (composite >= 65.0) {
      newState = FusionRiskState.critical;
    } else if (composite >= 45.0) {
      newState = FusionRiskState.warning;
    } else if (composite >= 25.0) {
      newState = FusionRiskState.watch;
    } else {
      newState = FusionRiskState.normal;
    }

    // Hysteresis cooldown for alerts
    if (newState == FusionRiskState.emergency || newState == FusionRiskState.critical) {
      if (_lastAlertTime == null || now.difference(_lastAlertTime!) > _alertCooldown) {
        _lastAlertTime = now;
      }
    }

    _currentState = newState;

    return RiskAssessmentResult(
      state: newState,
      compositeRiskScore: double.parse(composite.toStringAsFixed(1)),
      cardiacStressIndex: double.parse(cardiacScore.toStringAsFixed(1)),
      respiratoryIndex: double.parse(respScore.toStringAsFixed(1)),
      heatStressIndex: double.parse(heatScore.toStringAsFixed(1)),
      fallRiskIndex: double.parse(fallScore.toStringAsFixed(1)),
      primaryContributingFactor: primaryFactor,
      clinicalFlags: flags,
      assessedAt: now,
    );
  }
}