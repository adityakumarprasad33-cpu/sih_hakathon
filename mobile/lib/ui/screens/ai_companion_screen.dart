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
      backgroundColor: const Color(0xFF090C15),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121727),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SAMADHAN AI DOCTOR',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Colors.white,
              ),
            ),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryTeal,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'Connected to Clinical LLM API',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white54,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.cleaning_services_rounded, size: 20, color: Colors.white70),
            tooltip: 'Clear Chat History',
            onPressed: ai.clearHistory,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Live Telemetry Context Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF101524),
                border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sensors_rounded, color: AppTheme.primaryTeal, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      packet != null
                          ? '${packet.heartRate ?? "--"} BPM • SpO2 ${packet.spo2?.toStringAsFixed(1) ?? "--"}% • ${packet.temperature?.toStringAsFixed(1) ?? "--"}°C • Risk: ${packet.riskLevel.name.toUpperCase()}'
                          : 'Awaiting Wearable Telemetry Stream (Band Idle)',
                      style: GoogleFonts.jetBrainsMono(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Messages List
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                itemCount: ai.messages.length,
                itemBuilder: (context, index) {
                  final msg = ai.messages[index];

                  if (msg.isUser) {
                    return Align(
                      alignment: Alignment.centerRight,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.80,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryTeal,
                          borderRadius: BorderRadius.circular(18).copyWith(
                            bottomRight: const Radius.circular(2),
                          ),
                        ),
                        child: Text(
                          msg.text,
                          style: GoogleFonts.inter(
                            color: Colors.black,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            height: 1.35,
                          ),
                        ),
                      ),
                    );
                  }

                  // AI Response or Maintenance Notice
                  final isMaintenance = msg.isMaintenance;

                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.all(16),
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.85,
                      ),
                      decoration: BoxDecoration(
                        color: isMaintenance
                            ? Colors.amber.withValues(alpha: 0.10)
                            : const Color(0xFF131829),
                        borderRadius: BorderRadius.circular(18).copyWith(
                          bottomLeft: const Radius.circular(2),
                        ),
                        border: Border.all(
                          color: isMaintenance
                              ? Colors.amber.withValues(alpha: 0.4)
                              : (msg.urgency == 'CRITICAL'
                                  ? Colors.redAccent.withValues(alpha: 0.5)
                                  : Colors.white.withValues(alpha: 0.08)),
                          width: isMaintenance ? 1.5 : 1.0,
                        ),
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
                                    ? Colors.amber
                                    : (msg.urgency == 'CRITICAL' ? Colors.redAccent : AppTheme.primaryTeal),
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (isMaintenance
                                          ? Colors.amber
                                          : (msg.urgency == 'CRITICAL' ? Colors.redAccent : AppTheme.primaryTeal))
                                      .withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  isMaintenance ? 'MAINTENANCE IN PROGRESS' : (msg.urgency ?? 'CLINICAL AI'),
                                  style: GoogleFonts.jetBrainsMono(
                                    color: isMaintenance
                                        ? Colors.amber
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
                              color: isMaintenance ? const Color(0xFFFFF0D0) : Colors.white,
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
                      style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
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
              decoration: BoxDecoration(
                color: const Color(0xFF121727),
                border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      onSubmitted: (_) => _sendMessage(),
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Ask Samadhan AI Doctor...',
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                        filled: true,
                        fillColor: const Color(0xFF0C101D),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
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
                      icon: const Icon(Icons.arrow_upward_rounded, color: Colors.black, size: 20),
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
        labelStyle: GoogleFonts.inter(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
        backgroundColor: const Color(0xFF131829),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        onPressed: onTap,
      ),
    );
  }
}
