import 'dart:async';
import 'dart:html' show window;

import 'package:semver/semver.dart';
import 'package:w_flux/w_flux.dart';
import 'package:w_transport/w_transport.dart';

import 'package:rollout_status/src/actions.dart';
import 'package:rollout_status/src/models.dart';

class RolloutStore extends Store {
  RolloutActions _actions;
  HttpClient _client;
  String _currentQuery;
  Map<DeployLocation, Map<String, String>> _dependenciesByDeployLocation = {};
  Iterable<DeployLocation> _deployLocations;
  DateTime _previousFetchTime;
  List<QueryResult> _queryResults = [];

  RolloutStore(RolloutActions actions, Iterable<DeployLocation> deployLocations)
      : _actions = actions,
        _deployLocations = deployLocations {
    _client = new HttpClient()
      ..baseUri = Uri.parse('https://rollout-status.appspot-preview.com');
    _initializeData();
    manageActionSubscription(_actions.clearResults.listen(_onClearResults));
    manageActionSubscription(_actions.query.listen(_onQuery));
    manageActionSubscription(_actions.refresh.listen(_onRefresh));

    // Setup potential initial query from URL.
    final windowUri = Uri.parse(window.location.toString());
    if (windowUri.queryParameters.containsKey('q')) {
      _onQuery(windowUri.queryParameters['q']);
    }
  }

  /// The search query entered by the user.
  ///
  /// In the form of "<dependency_name> <version_string>".
  String get currentQuery => _currentQuery;

  /// List of result objects used to render the results table.
  Iterable<QueryResult> get queryResults => _queryResults;

  /// Populate _queryResults with [QueryResult] objects with the given query.
  _buildQueryResults(String query) {
    final queryParts = query.split(' ');
    final packageName = queryParts[0];
    final interestingVersion = queryParts[1];

    _queryResults = [];
    for (DeployLocation location in _deployLocations) {
      final queryResult =
          new QueryResult(location, packageName, interestingVersion);
      if (_dependenciesByDeployLocation.isNotEmpty &&
          _dependenciesByDeployLocation.containsKey(location)) {
        final versions = _dependenciesByDeployLocation[location];
        final actualVersion = versions[packageName];
        if (actualVersion == null) {
          queryResult.status = QueryResultStatus.noDependency;
          _queryResults.add(queryResult);
          continue;
        }
        final actualVersionSV = new SemanticVersion.fromString(actualVersion);
        final interestingVersionSV =
            new SemanticVersion.fromString(interestingVersion);

        if (actualVersionSV == interestingVersionSV ||
            actualVersionSV > interestingVersionSV) {
          queryResult.status = QueryResultStatus.included;
        } else {
          queryResult.status = QueryResultStatus.notIncluded;
        }
        queryResult.actualVersion = actualVersion;
      }
      _queryResults.add(queryResult);
    }
  }

  /// Fetches environment_settings.js from each deploy location.
  Future<Null> _initializeData() async {
    for (DeployLocation location in _deployLocations) {
      _requestDependencies(location);
    }
    _previousFetchTime = new DateTime.now();
  }

  /// Handler for the `clearResults` action.
  _onClearResults(_) {
    _currentQuery = null;
    _queryResults = [];
    trigger();
  }

  /// Handler for the `query` action.
  _onQuery(String query) {
    if (query == null || query == '') {
      return;
    }
    _currentQuery = query;

    // Update URL with new query.
    window.history.pushState(query, 'Rollout Status: $query', '?q=$query');

    // Check to see when the last data was fetched; fetch fresh data if
    // it has been more than 10 minutes since it was last fetched.
    final now = new DateTime.now();
    if (_previousFetchTime != null &&
        _previousFetchTime.difference(now) > new Duration(minutes: 10)) {
      _onRefresh();
    }

    _buildQueryResults(query);
    trigger();
  }

  /// Handler for the `refresh` action.
  _onRefresh([_]) {
    _dependenciesByDeployLocation = {};
    _initializeData();
  }

  /// Sends request to server to get the map of dependency versions for
  /// the given deploy location.
  _requestDependencies(DeployLocation location) async {
    final request = _client.newJsonRequest()
      ..path = '/get_deps'
      ..queryParameters = {'deploy': location.url.toString()};
    final response = await request.get();
    _dependenciesByDeployLocation[location] = response.body.asJson();
    // Rebuild queries
    if (_currentQuery != null) {
      _buildQueryResults(_currentQuery);
      trigger();
    }
  }
}
