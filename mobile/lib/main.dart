import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ai/samadhan_ai_service.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/auth_screen.dart';
import 'package:samadhan_health/ui/screens/home_dashboard_screen.dart';

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
        ChangeNotifierProxyProvider<FirebaseSyncService, BleGatewayService>(
          create: (context) => BleGatewayService(
            Provider.of<FirebaseSyncService>(context, listen: false),
          ),
          update: (context, sync, previous) => previous ?? BleGatewayService(sync),
        ),
        ChangeNotifierProvider(create: (_) => SamadhanAiService()),
      ],
      child: Consumer<AuthService>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'Samadhan Health',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.darkTheme,
            home: auth.isAuthenticated ? const HomeDashboardScreen() : const AuthScreen(),
          );
        },
      ),
    );
  }
}