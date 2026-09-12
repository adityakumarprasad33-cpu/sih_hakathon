import 'package:flutter_test/flutter_test.dart';
import 'package:samadhan_health/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SamadhanHealthApp());
    expect(find.byType(SamadhanHealthApp), findsOneWidget);
  });
}