import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ai/samadhan_ai_service.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const SamadhanHealthApp());
}

class SamadhanHealthApp extends StatelessWidget {
  const SamadhanHealthApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => FirebaseSyncService()),
        ChangeNotifierProvider(create: (_) => WearableGuardianService()),
        ChangeNotifierProxyProvider2<FirebaseSyncService, WearableGuardianService, BleGatewayService>(
          create: (context) {
            final sync = Provider.of<FirebaseSyncService>(context, listen: false);
            final guardian = Provider.of<WearableGuardianService>(context, listen: false);
            final ble = BleGatewayService(sync);
            ble.setGuardianService(guardian);
            return ble;
          },
          update: (context, sync, guardian, previous) {
            if (previous != null) {
              previous.setGuardianService(guardian);
              return previous;
            }
            final ble = BleGatewayService(sync);
            ble.setGuardianService(guardian);
            return ble;
          },
        ),
        ChangeNotifierProvider(create: (_) => SamadhanAiService()),
      ],
      child: MaterialApp(
        title: 'Samadhan Health',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
