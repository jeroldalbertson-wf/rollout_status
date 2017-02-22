import 'dart:html' show querySelector;

import 'package:react/react_dom.dart' as react_dom;
import 'package:react/react_client.dart' as react_client;
import 'package:rollout_status/rollout_status.dart';
import 'package:w_transport/browser.dart';

void main() {
  configureWTransportForBrowser();
  react_client.setClientConfiguration();
  final container = querySelector('#app-container');

  List<DeployLocation> deployments = [
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
    new DeployLocation('wComments', 'wk-dev', 'https://comments-experience.wk-dev.wdesk.org'),
    new DeployLocation('wComments', 'sandbox', 'https://comments-experience.sandbox.wdesk.com'),
    new DeployLocation('wOutline', 'wk-dev', 'https://outline.wk-dev.wdesk.org'),
    new DeployLocation('wOutline', 'sandbox', 'https://outline.sandbox.wdesk.com/'),
  ];
  RolloutModule rolloutModule = new RolloutModule(deployments, useWideViewport: true);

  react_dom.render(rolloutModule.components.content(), container);
}