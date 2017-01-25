import 'dart:html' show querySelector;

import 'package:react/react_dom.dart' as react_dom;
import 'package:react/react_client.dart' as react_client;
import 'package:rollout_status/rollout_status.dart';
import 'package:w_transport/browser.dart';

main() {
  configureWTransportForBrowser();
  react_client.setClientConfiguration();
  final container = querySelector('#app-container');

  List deployments = [
//    new DeployLocation('Bigsky Home', 'wk-dev', 'https://wk-dev.wdesk.org'),
//    new DeployLocation('Bigsky Home', 'sandbox', 'https://sandbox.wdesk.com'),
//    new DeployLocation('Bigsky Home', 'production', 'https://app.wdesk.com'),
    new DeployLocation('Docs', 'wk-dev', 'https://docs.wk-dev.wdesk.org'),
    new DeployLocation('Docs', 'sandbox', 'https://docs.sandbox.wdesk.com'),
    new DeployLocation('Graph App', 'wk-dev', 'https://g.wk-dev.wdesk.org'),
    new DeployLocation('Graph App', 'sandbox', 'https://g.sandbox.wdesk.com'),
    new DeployLocation('Graph App', 'production', 'https://g.app.wdesk.com'),
    new DeployLocation('Spreadsheets', 'wk-dev', 'https://datatables.wk-dev.wdesk.org'),
    new DeployLocation('Spreadsheets', 'sandbox', 'https://datatables.sandbox.wdesk.com'),
    new DeployLocation('Spreadsheets', 'production', 'https://datatables.app.wdesk.com'),
    new DeployLocation('Unified Wdesk', 'wk-dev', 'https://wdesk.wk-dev.wdesk.org'),
    new DeployLocation('Unified Wdesk', 'sandbox', 'https://wdesk.sandbox.wdesk.com'),
  ];
  RolloutModule rolloutModule = new RolloutModule(deployments);

  react_dom.render(rolloutModule.components.content(), container);
}
