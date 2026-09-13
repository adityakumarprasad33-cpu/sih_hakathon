import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ai/samadhan_ai_service.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/auth_screen.dart';
import 'package:samadhan_health/ui/screens/register_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('App smoke test and auth screen rendering', (WidgetTester tester) async {
    final auth = AuthService();
    final sync = FirebaseSyncService();
    final guardian = WearableGuardianService(checkPermissionsOnInit: false);
    final ble = BleGatewayService(sync);

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: auth),
          ChangeNotifierProvider.value(value: sync),
          ChangeNotifierProvider.value(value: guardian),
          ChangeNotifierProvider.value(value: ble),
          ChangeNotifierProvider(create: (_) => SamadhanAiService()),
        ],
        child: MaterialApp(
          theme: AppTheme.darkTheme,
          home: const AuthScreen(),
        ),
      ),
    );

    expect(find.byType(AuthScreen), findsOneWidget);
    expect(find.text('SAMADHAN HEALTH'), findsOneWidget);
    expect(find.text('CLINICAL WEARABLE GATEWAY'), findsOneWidget);
    expect(find.text('Register Band'), findsOneWidget);

    await tester.pumpAndSettle();
  });

  testWidgets('RegisterScreen renders clinical enrollment fields', (WidgetTester tester) async {
    final auth = AuthService();
    final sync = FirebaseSyncService();
    final guardian = WearableGuardianService(checkPermissionsOnInit: false);
    final ble = BleGatewayService(sync);

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: auth),
          ChangeNotifierProvider.value(value: sync),
          ChangeNotifierProvider.value(value: guardian),
          ChangeNotifierProvider.value(value: ble),
          ChangeNotifierProvider(create: (_) => SamadhanAiService()),
        ],
        child: MaterialApp(
          theme: AppTheme.darkTheme,
          home: const RegisterScreen(),
        ),
      ),
    );

    expect(find.byType(RegisterScreen), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);
    expect(find.text('CLINICAL ENROLLMENT'), findsOneWidget);
    expect(find.text('COMPLETE REGISTRATION'), findsOneWidget);

    await tester.pumpAndSettle();
  });
}
