import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';

class ConnectionBadge extends StatelessWidget {
  final ConnectionStatus status;

  const ConnectionBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    String label;

    switch (status) {
      case ConnectionStatus.live:
        badgeColor = AppTheme.success;
        label = 'LIVE GATEWAY';
        break;
      case ConnectionStatus.cached:
        badgeColor = AppTheme.warning;
        label = 'CACHED BUFFER';
        break;
      case ConnectionStatus.stale:
        badgeColor = AppTheme.warning;
        label = 'STALE';
        break;
      case ConnectionStatus.disconnected:
        badgeColor = AppTheme.textMuted;
        label = 'DISCONNECTED';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: badgeColor.withValues(alpha: 0.25), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: badgeColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.jetBrainsMono(
              color: badgeColor,
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}

class VitalCard extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final IconData icon;
  final Color accentColor;
  final String? subtitle;
  final bool isWarning;

  const VitalCard({
    super.key,
    required this.label,
    required this.value,
    required this.unit,
    required this.icon,
    required this.accentColor,
    this.subtitle,
    this.isWarning = false,
  });

  factory VitalCard.styled({
    Key? key,
    required String title,
    required String value,
    required String unit,
    required IconData icon,
    required Color color,
    String? subtitle,
    bool isWarning = false,
  }) {
    return VitalCard(
      key: key,
      label: title,
      value: value,
      unit: unit,
      icon: icon,
      accentColor: color,
      subtitle: subtitle,
      isWarning: isWarning,
    );
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = isWarning ? AppTheme.danger : accentColor;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isWarning ? AppTheme.danger.withValues(alpha: 0.4) : AppTheme.border,
          width: isWarning ? 1.5 : 1.0,
        ),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label.toUpperCase(),
                style: GoogleFonts.inter(
                  color: isWarning ? AppTheme.danger : AppTheme.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: effectiveColor.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: effectiveColor, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: GoogleFonts.outfit(
                  color: isWarning ? AppTheme.danger : AppTheme.textPrimary,
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                unit,
                style: GoogleFonts.inter(
                  color: effectiveColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: GoogleFonts.inter(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
