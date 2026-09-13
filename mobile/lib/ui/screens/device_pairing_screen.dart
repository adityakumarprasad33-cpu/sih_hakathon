import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';

class DevicePairingScreen extends StatelessWidget {
  const DevicePairingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF131B2E),
        elevation: 0,
        title: Text(
          'WEARABLE DEVICE HUB',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              ble.isScanning ? Icons.stop_circle_outlined : Icons.refresh_rounded,
              color: AppTheme.primaryTeal,
            ),
            tooltip: ble.isScanning ? 'Stop Scan' : 'Scan for Devices',
            onPressed: ble.isScanning ? ble.stopScan : ble.startScan,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Bluetooth Disabled Warning Banner
            if (!ble.isBluetoothOn) ...[
              Container(
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.amber.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.bluetooth_disabled_rounded, color: Colors.amber, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'BLUETOOTH IS OFF',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Colors.amber,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Please enable Bluetooth on your phone to scan and pair with your Samadhan Band.',
                            style: TextStyle(fontSize: 11, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Active Connected Wearable Card
            if (ble.connectedDevice != null) ...[
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.primaryTeal.withOpacity(0.6), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryTeal.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.watch_rounded, color: AppTheme.primaryTeal, size: 28),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppTheme.primaryTeal,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    ble.isConnected ? 'CONNECTED & STREAMING' : 'CONNECTING...',
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryTeal,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                ble.connectedDevice!.platformName.isNotEmpty
                                    ? ble.connectedDevice!.platformName
                                    : 'SAMADHAN-BAND-ESP32',
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                'Hardware ID: ${ble.connectedDevice!.remoteId.str}',
                                style: GoogleFonts.jetBrainsMono(
                                  fontSize: 10,
                                  color: Colors.white54,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.signal_cellular_alt_rounded, size: 16, color: AppTheme.primaryTeal),
                            const SizedBox(width: 6),
                            Text(
                              '${ble.currentRssi} dBm',
                              style: GoogleFonts.jetBrainsMono(fontSize: 12, color: Colors.white70),
                            ),
                          ],
                        ),
                        OutlinedButton.icon(
                          onPressed: () => ble.disconnectDevice(),
                          icon: const Icon(Icons.link_off_rounded, size: 16),
                          label: const Text('DISCONNECT'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.redAccent,
                            side: const BorderSide(color: Colors.redAccent),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.bluetooth_searching_rounded, color: Colors.white54, size: 26),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'NO WEARABLE PAIRED',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Turn on your physical ESP32-S3 band. Tap Scan below to discover and pair.',
                            style: TextStyle(fontSize: 11, color: Colors.white54),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Discovery Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'DISCOVERED BLUETOOTH DEVICES',
                  style: GoogleFonts.outfit(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
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
                style: GoogleFonts.inter(fontWeight: FontWeight.bold, letterSpacing: 0.8),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: ble.isScanning ? Colors.redAccent : AppTheme.primaryTeal,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Discovered Results
            if (ble.scanResults.isEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.bluetooth_searching, size: 40, color: Colors.white30),
                    const SizedBox(height: 12),
                    Text(
                      ble.isScanning
                          ? 'Listening for BLE advertisement packets from SAMADHAN-BAND...'
                          : 'No devices found yet. Tap "SCAN FOR WEARABLES" above to discover nearby hardware.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
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
                    color: const Color(0xFF131B2E),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isPaired
                          ? AppTheme.primaryTeal
                          : (isSamadhanBand ? AppTheme.primaryTeal.withOpacity(0.4) : Colors.white12),
                      width: isPaired || isSamadhanBand ? 1.5 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSamadhanBand
                              ? AppTheme.primaryTeal.withOpacity(0.15)
                              : Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.watch_rounded,
                          color: isSamadhanBand ? AppTheme.primaryTeal : Colors.white54,
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
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
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
                                      color: AppTheme.primaryTeal.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'VERIFIED',
                                      style: GoogleFonts.jetBrainsMono(
                                        fontSize: 8,
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
                                color: Colors.white54,
                                fontSize: 10,
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
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          minimumSize: const Size(60, 34),
                        ),
                        child: Text(
                          isPaired ? 'DISCONNECT' : 'PAIR',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold),
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
