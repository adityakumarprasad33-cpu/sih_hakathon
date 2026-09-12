import 'dart:math';
import 'package:flutter/material.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';

class LivePulseWaveWidget extends StatefulWidget {
  final int heartRate;
  final bool isLive;

  const LivePulseWaveWidget({
    Key? key,
    required this.heartRate,
    this.isLive = true,
  }) : super(key: key);

  @override
  State<LivePulseWaveWidget> createState() => _LivePulseWaveWidgetState();
}

class _LivePulseWaveWidgetState extends State<LivePulseWaveWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();
  }

  @override
  void didUpdateWidget(covariant LivePulseWaveWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Speed up animation with higher heart rate
    if (widget.heartRate > 0) {
      final periodMs = (60000 / widget.heartRate).round().clamp(500, 2000);
      _controller.duration = Duration(milliseconds: periodMs);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          size: const Size(double.infinity, 80),
          painter: _PulseWavePainter(
            progress: _controller.value,
            color: widget.isLive ? AppTheme.primary : AppTheme.textMuted,
          ),
        );
      },
    );
  }
}

class _PulseWavePainter extends CustomPainter {
  final double progress;
  final Color color;

  _PulseWavePainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final glowPaint = Paint()
      ..color = color.withOpacity(0.35)
      ..strokeWidth = 6.0
      ..style = PaintingStyle.stroke
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);

    final path = Path();
    final midY = size.height / 2;
    final width = size.width;

    path.moveTo(0, midY);

    final points = 80;
    for (int i = 0; i <= points; i++) {
      final x = (i / points) * width;
      // Synthesize classic P-Q-R-S-T cardiac waveform
      final phase = ((i / points) + progress) % 1.0;
      double y = midY;

      if (phase > 0.40 && phase < 0.44) {
        // P wave
        y -= sin((phase - 0.40) / 0.04 * pi) * 6;
      } else if (phase >= 0.44 && phase < 0.48) {
        // Q wave
        y += sin((phase - 0.44) / 0.04 * pi) * 4;
      } else if (phase >= 0.48 && phase < 0.54) {
        // R wave (peak spike)
        y -= sin((phase - 0.48) / 0.06 * pi) * 28;
      } else if (phase >= 0.54 && phase < 0.58) {
        // S wave
        y += sin((phase - 0.54) / 0.04 * pi) * 8;
      } else if (phase >= 0.62 && phase < 0.70) {
        // T wave
        y -= sin((phase - 0.62) / 0.08 * pi) * 10;
      }

      path.lineTo(x, y);
    }

    canvas.drawPath(path, glowPaint);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _PulseWavePainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}