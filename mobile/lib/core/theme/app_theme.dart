import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Pure Clean & Minimal Medical Palette (Apple Health / Linear Light)
  static const Color background = Color(0xFFF8FAFC); // Clean Slate 50
  static const Color surface = Color(0xFFFFFFFF); // Pure Crisp White
  static const Color surfaceElevated = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFF1F5F9); // Slate 100
  static const Color border = Color(0xFFE2E8F0); // Slate 200 Hairline Border
  static const Color borderLight = Color(0xFFF1F5F9);

  // Clinical Accents
  static const Color primary = Color(0xFF0D9488); // Clinical Emerald Teal (Teal 600)
  static const Color primaryTeal = Color(0xFF0D9488);
  static const Color primaryDark = Color(0xFF0F766E); // Teal 700
  static const Color primaryLight = Color(0xFFCCFBF1); // Teal 100
  static const Color secondary = Color(0xFF2563EB); // Royal Clinical Blue (Blue 600)
  static const Color accentBlue = Color(0xFF2563EB);
  static const Color success = Color(0xFF16A34A); // Health Green (Green 600)
  static const Color warning = Color(0xFFD97706); // Amber Warning (Amber 600)
  static const Color danger = Color(0xFFDC2626); // Emergency Crimson (Red 600)

  // Typography Palette (High-contrast, razor-sharp on white)
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Minimalist Card BoxShadow
  static List<BoxShadow> get cardShadow => [
        const BoxShadow(
          color: Color(0x0A0F172A),
          blurRadius: 12,
          offset: Offset(0, 3),
          spreadRadius: 0,
        ),
      ];

  static List<BoxShadow> get elevatedShadow => [
        const BoxShadow(
          color: Color(0x0F0F172A),
          blurRadius: 20,
          offset: Offset(0, 8),
          spreadRadius: 0,
        ),
      ];

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      cardColor: surface,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surface,
        error: danger,
        onPrimary: Colors.white,
        onSurface: textPrimary,
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.light().textTheme,
      ).apply(
        bodyColor: textPrimary,
        displayColor: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        iconTheme: IconThemeData(color: textPrimary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14),
      ),
    );
  }

  // Alias for backward compatibility
  static ThemeData get darkTheme => lightTheme;
}
