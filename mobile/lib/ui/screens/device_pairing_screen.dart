import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';

class DevicePairingScreen extends StatelessWidget {
  const DevicePairingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'BLE HARDWARE PAIRING',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            color: AppTheme.textPrimary,
          ),
        ),
        actions: [
          if (ble.isScanning)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryTeal),
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Status Banner
            if (ble.isConnected) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF99F6E4)),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.bluetooth_connected_rounded, color: AppTheme.primaryTeal, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'HARDWARE CONNECTED',
                            style: GoogleFonts.outfit(
                              color: const Color(0xFF0F766E),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            ble.connectedDevice?.platformName.isNotEmpty == true
                                ? ble.connectedDevice!.platformName
                                : 'Samadhan Clinical Band',
                            style: GoogleFonts.inter(
                              color: AppTheme.textPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          Text(
                            'ID: ${ble.connectedDevice?.remoteId.str ?? "N/A"}',
                            style: GoogleFonts.jetBrainsMono(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton(
                      onPressed: () => ble.disconnectDevice(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.redAccent,
                        side: const BorderSide(color: Colors.redAccent),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Disconnect', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ] else if (ble.lastPairedDeviceId != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceSubtle,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.history_rounded, color: AppTheme.textSecondary, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PREVIOUSLY PAIRED BAND',
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textSecondary,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            'ID: ${ble.lastPairedDeviceId}',
                            style: GoogleFonts.jetBrainsMono(fontSize: 12, color: AppTheme.textPrimary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => ble.autoReconnectIfConfigured(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                      child: const Text('Reconnect', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'NEARBY SENSOR DEVICES',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textSecondary,
                    letterSpacing: 1.0,
                  ),
                ),
                if (ble.isScanning)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryTeal),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Scan Action Trigger
            ElevatedButton.icon(
              onPressed: ble.isScanning ? ble.stopScan : ble.startScan,
              icon: Icon(ble.isScanning ? Icons.stop_rounded : Icons.search_rounded, size: 18),
              label: Text(
                ble.isScanning ? 'STOP SCANNING' : 'SCAN FOR WEARABLES',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600, letterSpacing: 0.8, fontSize: 13),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: ble.isScanning ? Colors.redAccent : AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            ),
            const SizedBox(height: 16),

            // Discovered Results
            if (ble.scanResults.isEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  children: [
                    const Icon(Icons.bluetooth_searching_rounded, size: 40, color: AppTheme.textSecondary),
                    const SizedBox(height: 12),
                    Text(
                      ble.isScanning
                          ? 'Listening for BLE advertisement packets from SAMADHAN-BAND...'
                          : 'No devices found yet. Tap "SCAN FOR WEARABLES" above to discover nearby hardware.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ] else ...[
              ...ble.scanResults.map((result) {
                final name = result.device.platformName.isNotEmpty
                    ? result.device.platformName
                    : 'Unknown BLE Device';
                final isPaired = ble.connectedDevice?.remoteId == result.device.remoteId;
                final isSamadhanBand = name.toUpperCase().contains('SAMADHAN') ||
                    name.toUpperCase().contains('BAND') ||
                    name.toUpperCase().contains('ESP32');

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isPaired
                          ? AppTheme.primaryTeal
                          : (isSamadhanBand ? AppTheme.primaryTeal.withValues(alpha: 0.4) : AppTheme.border),
                      width: isPaired || isSamadhanBand ? 1.5 : 1.0,
                    ),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isSamadhanBand
                              ? AppTheme.primaryTeal.withValues(alpha: 0.1)
                              : AppTheme.surfaceSubtle,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.watch_rounded,
                          color: isSamadhanBand ? AppTheme.primaryTeal : AppTheme.textSecondary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    name,
                                    style: GoogleFonts.inter(
                                      color: AppTheme.textPrimary,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (isSamadhanBand) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryTeal.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'VERIFIED',
                                      style: GoogleFonts.jetBrainsMono(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryTeal,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'RSSI: ${result.rssi} dBm • ID: ${result.device.remoteId.str}',
                              style: GoogleFonts.jetBrainsMono(
                                color: AppTheme.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          if (isPaired) {
                            ble.disconnectDevice();
                          } else {
                            ble.connectToDevice(result.device);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPaired ? Colors.redAccent : AppTheme.primaryTeal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                          minimumSize: const Size(60, 34),
                        ),
                        child: Text(
                          isPaired ? 'Disconnect' : 'Pair',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
