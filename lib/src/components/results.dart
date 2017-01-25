import 'package:web_skin_dart/ui_components.dart';
import 'package:web_skin_dart/ui_core.dart';

import 'package:rollout_status/src/models.dart';

@Factory()
UiFactory<ResultsProps> Results;

@Props()
class ResultsProps extends UiProps {
  List<QueryResult> results;
  String query;
}

@Component()
class ResultsComponents extends UiComponent<ResultsProps> {
  @override
  getDefaultProps() => (newProps()..results = []);

  @override
  render() {
    if (props.query == null) {
      return (EmptyView()
        ..header = 'Ready to Search'
        ..glyph = IconGlyph.SEARCH
        ..type = EmptyViewType.VBLOCK)();
    }

    final rows = [];

    for (QueryResult result in props.results) {
      rows.add((Dom.tr()..key = result.deployLocation.displayName)(
        Dom.td()(_getIconForResult(result)),
        Dom.td()(result.deployLocation.appName),
        Dom.td()(result.deployLocation.envName),
        Dom.td()(_getVersionForResult(result)),
      ));
    }

    return BlockContent()(
      Table()(
        Dom.thead()(
          Dom.tr()(
            (Dom.th()..scope = 'col')(),
            (Dom.th()..scope = 'col')('Application Name'),
            (Dom.th()..scope = 'col')('Deploy Location'),
            (Dom.th()..scope = 'col')('Actual Version'),
          ),
        ),
        Dom.tbody()(rows),
      ),
    );
  }

  _getIconForResult(QueryResult result) {
    var icon;
    if (result.status == QueryResultStatus.loading) {
      icon = (Dom.i()..className = 'progress-spinner progress-spinner-md')();
    } else if (result.status == QueryResultStatus.included) {
      icon = (Icon()
        ..className = 'text-success'
        ..glyph = IconGlyph.TWFR_CHECKMARK_SIGN_OUTLINE)();
    } else if (result.status == QueryResultStatus.notIncluded) {
      icon = Dom.strong()((Icon()
        ..className = 'text-danger'
        ..glyph = IconGlyph.TWFR_MINUS_SIGN_OUTLINE)());
    } else if (result.status == QueryResultStatus.noDependency) {
      icon = (Icon()..glyph = IconGlyph.TWFR_MINUS_SIGN_OUTLINE)();
    } else if (result.status == QueryResultStatus.queryRequestFailed) {
      icon = (Icon()..glyph = IconGlyph.TWFR_WARNING_SIGN_OUTLINE)();
    }
    return icon;
  }

  _getVersionForResult(QueryResult result) {
    var version;
    if (result.status == QueryResultStatus.loading) {
      version = '';
    } else if (result.status == QueryResultStatus.included) {
      version = result.actualVersion;
    } else if (result.status == QueryResultStatus.notIncluded) {
      version = (Dom.strong()..className = 'text-danger')(result.actualVersion);
    } else if (result.status == QueryResultStatus.noDependency) {
      version = 'No dependency on package';
    } else if (result.status == QueryResultStatus.queryRequestFailed) {
      version = (Dom.span()..className = 'text-gray text-muted')('Request for dependencies failed.');
    }
    return version;
  }
}
