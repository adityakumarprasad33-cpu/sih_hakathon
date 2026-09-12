import 'package:flutter/material.dart';
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
      appBar: AppBar(
        title: const Text('SAMADHAN AI COMPANION'),
        actions: [
          IconButton(
            icon: const Icon(Icons.cleaning_services_rounded, size: 20),
            tooltip: 'Clear Chat',
            onPressed: ai.clearHistory,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Context Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppTheme.surface,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.sensors, color: AppTheme.primary, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'Live Context: ${packet?.heartRate ?? 72} BPM • SpO2 ${packet?.spo2 ?? 98.2}% • ${packet?.temperature ?? 26.4}°C',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.success,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),

            // Messages List
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                itemCount: ai.messages.length,
                itemBuilder: (context, index) {
                  final msg = ai.messages[index];
                  return Align(
                    alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.all(14),
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.82,
                      ),
                      decoration: BoxDecoration(
                        color: msg.isUser ? AppTheme.primary : AppTheme.surface,
                        borderRadius: BorderRadius.circular(16).copyWith(
                          bottomRight: msg.isUser ? const Radius.circular(0) : const Radius.circular(16),
                          bottomLeft: !msg.isUser ? const Radius.circular(0) : const Radius.circular(16),
                        ),
                        border: Border.all(
                          color: msg.isUser
                              ? AppTheme.primary
                              : (msg.urgency == 'CRITICAL' ? AppTheme.danger : AppTheme.border),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (!msg.isUser && msg.urgency != null) ...[
                            Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: (msg.urgency == 'CRITICAL' ? AppTheme.danger : AppTheme.primary)
                                    .withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                msg.urgency!,
                                style: TextStyle(
                                  color: msg.urgency == 'CRITICAL' ? AppTheme.danger : AppTheme.primary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                          Text(
                            msg.text,
                            style: TextStyle(
                              color: msg.isUser ? Colors.black : AppTheme.textPrimary,
                              fontSize: 14,
                              height: 1.4,
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
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Analyzing clinical context...',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],

            // Suggestion Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              child: Row(
                children: [
                  _Chip(label: 'Explain heart rate', onTap: () => _sendMessage('Explain my heart rate')),
                  _Chip(label: 'Is SpO2 98% normal?', onTap: () => _sendMessage('Is my SpO2 level healthy?')),
                  _Chip(label: 'Check fall risk', onTap: () => _sendMessage('What is my fall detection risk?')),
                ],
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.all(12),
              color: AppTheme.surface,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(
                        hintText: 'Ask your health AI companion...',
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_upward_rounded, color: Colors.black),
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
        labelStyle: const TextStyle(color: AppTheme.textPrimary, fontSize: 12),
        backgroundColor: AppTheme.surfaceLight,
        side: const BorderSide(color: AppTheme.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onPressed: onTap,
      ),
    );
  }
}