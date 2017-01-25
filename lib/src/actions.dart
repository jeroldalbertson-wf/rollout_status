import 'package:w_flux/w_flux.dart';

class RolloutActions {
  /// Clear results to prepare for a new query.
  Action<Null> clearResults = new Action<Null>();

  /// Perform a new query.
  Action<String> query = new Action<String>();

  /// Fetch fresh data about dependencies from the server.
  Action<Null> refresh = new Action<Null>();
}
