import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/ui/widgets/pulse_wave_painter.dart';

class LiveVitalsScreen extends StatelessWidget {
  const LiveVitalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();
    final history = ble.telemetryHistory;
    final latest = ble.latestPacket;

    // Generate FlSpot points from history with null safety
    final hrSpots = <FlSpot>[];
    final spo2Spots = <FlSpot>[];

    for (int i = 0; i < history.length; i++) {
      final p = history[i];
      if (p.heartRate != null) {
        hrSpots.add(FlSpot(i.toDouble(), p.heartRate!.toDouble()));
      }
      if (p.spo2 != null) {
        spo2Spots.add(FlSpot(i.toDouble(), p.spo2!));
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('CLINICAL TELEMETRY STREAM'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Waveform Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PULSE WAVE CONTINUOUS MONITOR',
                      style: TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 12),
                    LivePulseWaveWidget(
                      heartRate: latest?.heartRate ?? 72,
                      isLive: ble.status.name == 'live',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Real-Time Heart Rate Chart
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'HEART RATE TREND (BPM)',
                          style: TextStyle(
                            color: AppTheme.danger,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          ' BPM',
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 160,
                      child: hrSpots.length > 2
                          ? LineChart(
                              LineChartData(
                                gridData: FlGridData(
                                  show: true,
                                  getDrawingHorizontalLine: (val) => FlLine(
                                    color: AppTheme.border.withOpacity(0.5),
                                    strokeWidth: 1,
                                  ),
                                  getDrawingVerticalLine: (val) => FlLine(
                                    color: AppTheme.border.withOpacity(0.5),
                                    strokeWidth: 1,
                                  ),
                                ),
                                titlesData: const FlTitlesData(show: false),
                                borderData: FlBorderData(show: false),
                                minY: 50,
                                maxY: 140,
                                lineBarsData: [
                                  LineChartBarData(
                                    spots: hrSpots,
                                    isCurved: true,
                                    color: AppTheme.danger,
                                    barWidth: 2.5,
                                    isStrokeCapRound: true,
                                    dotData: const FlDotData(show: false),
                                    belowBarData: BarAreaData(
                                      show: true,
                                      color: AppTheme.danger.withOpacity(0.12),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : const Center(
                              child: Text(
                                'Accumulating telemetry packets...',
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                              ),
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Diagnostic Metrics Table (Contract Section 4)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'HARDWARE TELEMETRY CONTRACT DATA',
                      style: TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _TelemetryRow(
                      label: 'MAX30102 Heart Rate',
                      value: ' BPM ()',
                      color: AppTheme.danger,
                    ),
                    _TelemetryRow(
                      label: 'MAX30102 SpO2 Oxygen',
                      value: ' % ()',
                      color: AppTheme.secondary,
                    ),
                    _TelemetryRow(
                      label: 'PPG Optical Quality',
                      value: latest?.ppgQuality ?? 'GOOD',
                      color: AppTheme.primary,
                    ),
                    _TelemetryRow(
                      label: 'DHT22 Ambient Temperature',
                      value: ' °C ()',
                      color: AppTheme.warning,
                    ),
                    _TelemetryRow(
                      label: 'DHT22 Ambient Humidity',
                      value: ' %',
                      color: AppTheme.textSecondary,
                    ),
                    _TelemetryRow(
                      label: 'MPU6050 Movement State',
                      value: latest?.movementState ?? 'RESTING',
                      color: AppTheme.success,
                    ),
                    _TelemetryRow(
                      label: 'MPU6050 Accel Magnitude',
                      value: ' g',
                      color: AppTheme.textPrimary,
                    ),
                    _TelemetryRow(
                      label: 'Fall Detection Subsystem',
                      value: latest?.fallState ?? 'IDLE',
                      color: latest?.fallDetected == true ? AppTheme.danger : AppTheme.success,
                    ),
                    _TelemetryRow(
                      label: 'Wearable Battery',
                      value: ' %',
                      color: AppTheme.textPrimary,
                    ),
                    _TelemetryRow(
                      label: 'Hardware Device ID',
                      value: latest?.deviceId ?? 'SAMADHAN-BAND-A7F39C',
                      color: AppTheme.primary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TelemetryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _TelemetryRow({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}