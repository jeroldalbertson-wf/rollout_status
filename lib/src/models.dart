/// Object representing a deploy location.
class DeployLocation {
  final String appName;
  final String envName;
  final Uri url;

  DeployLocation(this.appName, this.envName, String url)
      : this.url = Uri.parse(url);

  String get displayName => '$appName, $envName';
}

enum QueryResultStatus {
  /// Still loading data for this deploy location.
  loading,

  /// The queried version is included in this deploy.
  included,

  /// The queried version is not included in this deploy.
  notIncluded,

  /// The queried package is not depended on in this deploy.
  noDependency,

  /// Failed to query for information from this deploy.
  queryRequestFailed,
}

/// Object representing the result of the query for a given [DeployLocation].
class QueryResult {
  final DeployLocation deployLocation;
  final String packageName;
  final String queriedVersion;

  String actualVersion = '';
  QueryResultStatus status = QueryResultStatus.loading;

  QueryResult(this.deployLocation, this.packageName, this.queriedVersion);
}
