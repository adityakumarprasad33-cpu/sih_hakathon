import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ai/samadhan_ai_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';

class AiCompanionScreen extends StatefulWidget {
  const AiCompanionScreen({super.key});

  @override
  State<AiCompanionScreen> createState() => _AiCompanionScreenState();
}

class _AiCompanionScreenState extends State<AiCompanionScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage([String? text]) {
    final query = text ?? _controller.text.trim();
    if (query.isEmpty) return;

    _controller.clear();
    final ble = context.read<BleGatewayService>();
    context.read<SamadhanAiService>().askQuestion(
          query: query,
          currentVitals: ble.latestPacket,
        );

    Future.delayed(const Duration(milliseconds: 200), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ai = context.watch<SamadhanAiService>();
    final ble = context.watch<BleGatewayService>();
    final packet = ble.latestPacket;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        shape: const Border(
          bottom: BorderSide(color: AppTheme.border),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SAMADHAN AI DOCTOR',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
                color: AppTheme.textPrimary,
              ),
            ),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.primaryTeal,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'Connected to Modal Serverless LLM',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (packet != null) ...[
            Center(
              child: Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceSubtle,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.favorite_rounded, color: Colors.redAccent, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      '${packet.heartRate ?? "--"} BPM',
                      style: GoogleFonts.jetBrainsMono(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Chat Message Thread
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                itemCount: ai.messages.length,
                itemBuilder: (context, index) {
                  final msg = ai.messages[index];
                  final isUser = msg.isUser;
                  final isMaintenance = msg.isMaintenance;

                  if (isUser) {
                    return Align(
                      alignment: Alignment.centerRight,
                      child: Container(
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.78,
                        ),
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryTeal,
                          borderRadius: BorderRadius.circular(18).copyWith(
                            bottomRight: const Radius.circular(2),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryTeal.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          msg.text,
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                          ),
                        ),
                      ),
                    );
                  }

                  // AI Response Bubble
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.85,
                      ),
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isMaintenance ? const Color(0xFFFFFBEB) : AppTheme.surface,
                        borderRadius: BorderRadius.circular(18).copyWith(
                          bottomLeft: const Radius.circular(2),
                        ),
                        border: Border.all(
                          color: isMaintenance
                              ? const Color(0xFFFCD34D)
                              : (msg.urgency == 'CRITICAL'
                                  ? Colors.redAccent.withValues(alpha: 0.5)
                                  : AppTheme.border),
                          width: isMaintenance ? 1.5 : 1.0,
                        ),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isMaintenance
                                    ? Icons.build_circle_outlined
                                    : (msg.urgency == 'CRITICAL'
                                        ? Icons.warning_amber_rounded
                                        : Icons.psychology_rounded),
                                color: isMaintenance
                                    ? const Color(0xFFB45309)
                                    : (msg.urgency == 'CRITICAL' ? Colors.redAccent : AppTheme.primaryTeal),
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (isMaintenance
                                          ? const Color(0xFFB45309)
                                          : (msg.urgency == 'CRITICAL' ? Colors.redAccent : AppTheme.primaryTeal))
                                      .withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  isMaintenance ? 'MAINTENANCE IN PROGRESS' : (msg.urgency ?? 'CLINICAL AI'),
                                  style: GoogleFonts.jetBrainsMono(
                                    color: isMaintenance
                                        ? const Color(0xFFB45309)
                                        : (msg.urgency == 'CRITICAL' ? Colors.redAccent : AppTheme.primaryTeal),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            msg.text,
                            style: GoogleFonts.inter(
                              color: isMaintenance ? const Color(0xFF92400E) : AppTheme.textPrimary,
                              fontSize: 13.5,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            if (ai.isLoading) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryTeal),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Querying Modal clinical LLM API...',
                      style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],

            // Clinical Suggestion Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Row(
                children: [
                  _Chip(label: 'Explain heart rate', onTap: () => _sendMessage('Explain my current heart rate and rhythm')),
                  _Chip(label: 'Analyze SpO2 level', onTap: () => _sendMessage('Is my blood oxygen saturation normal?')),
                  _Chip(label: 'Assess fall risk', onTap: () => _sendMessage('What is my current fall detection and IMU status?')),
                ],
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: AppTheme.surface,
                border: Border(top: BorderSide(color: AppTheme.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      onSubmitted: (_) => _sendMessage(),
                      style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Ask Samadhan AI Doctor...',
                        hintStyle: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                        filled: true,
                        fillColor: AppTheme.surfaceSubtle,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppTheme.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.primaryTeal,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_upward_rounded, color: Colors.white, size: 20),
                      onPressed: () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _Chip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(label),
        labelStyle: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w500),
        backgroundColor: AppTheme.surface,
        side: const BorderSide(color: AppTheme.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        onPressed: onTap,
      ),
    );
  }
}
