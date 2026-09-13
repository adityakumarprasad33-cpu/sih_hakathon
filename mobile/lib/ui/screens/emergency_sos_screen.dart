import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';

class EmergencySosScreen extends StatefulWidget {
  const EmergencySosScreen({super.key});

  @override
  State<EmergencySosScreen> createState() => _EmergencySosScreenState();
}

class _EmergencySosScreenState extends State<EmergencySosScreen> {
  int _countdown = 5;
  Timer? _timer;
  bool _alertSent = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 1) {
        setState(() {
          _countdown--;
        });
      } else {
        _timer?.cancel();
        _dispatchEmergencyAlert();
      }
    });
  }

  void _dispatchEmergencyAlert() async {
    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();
    final sync = context.read<FirebaseSyncService>();

    final uid = auth.currentUser?.uid ?? 'demo-patient';
    final deviceId = ble.latestPacket?.deviceId ?? 'SAMADHAN-BAND-A7F39C';

    await sync.triggerAlert(
      uid: uid,
      deviceId: deviceId,
      type: 'MANUAL_SOS_TRIGGERED',
      message: 'EMERGENCY: Patient manually dispatched SOS with live vitals! HR ${ble.latestPacket?.heartRate ?? 72} BPM',
    );

    if (mounted) {
      setState(() {
        _alertSent = true;
      });
    }
  }

  void _cancelAlert() {
    _timer?.cancel();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();
    final latest = ble.latestPacket;

    return Scaffold(
      backgroundColor: const Color(0xFF14080B),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('EMERGENCY SOS WORKFLOW'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Header
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.danger.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.warning_rounded,
                      color: AppTheme.danger,
                      size: 56,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _alertSent ? 'EMERGENCY ESCALATION DISPATCHED' : 'DISPATCHING SOS IN $_countdown SECONDS',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: _alertSent ? AppTheme.warning : AppTheme.danger,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Broadcasting telemetry snapshot and notification to paired doctor and primary emergency contacts.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                  ),
                ],
              ),

              // Vitals Snapshot
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.danger.withValues(alpha: 0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ATTACHED CLINICAL TELEMETRY SNAPSHOT',
                      style: TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _SnapshotPill(label: 'Heart Rate', value: '${latest?.heartRate ?? 72} BPM'),
                        _SnapshotPill(label: 'SpO2 Oxygen', value: '${latest?.spo2 ?? 98.2}%'),
                        _SnapshotPill(label: 'Temperature', value: '${latest?.temperature ?? 26.4}°C'),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Emergency Contacts: +91 98765 43210 (Family), Hospital Gateway',
                      style: TextStyle(color: AppTheme.textMuted.withValues(alpha: 0.8), fontSize: 12),
                    ),
                  ],
                ),
              ),

              // Action Buttons
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (!_alertSent) ...[
                    ElevatedButton(
                      onPressed: _cancelAlert,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.surfaceLight,
                        foregroundColor: AppTheme.textPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('CANCEL SOS (FALSE ALARM)'),
                    ),
                  ] else ...[
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('RETURN TO DASHBOARD'),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SnapshotPill extends StatelessWidget {
  final String label;
  final String value;

  const _SnapshotPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
      ],
    );
  }
}