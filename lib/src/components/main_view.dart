import 'package:web_skin_dart/ui_components.dart';
import 'package:web_skin_dart/ui_core.dart';

import 'package:rollout_status/src/actions.dart';
import 'package:rollout_status/src/components/query_input.dart';
import 'package:rollout_status/src/components/results.dart';
import 'package:rollout_status/src/components/rollout_status_navbar.dart';
import 'package:rollout_status/src/store.dart';

@Factory()
UiFactory<MainViewProps> MainView;

@Props()
class MainViewProps extends FluxUiProps<RolloutActions, RolloutStore> {
  bool useWideViewport;
}

@Component()
class MainViewComponent extends FluxUiComponent<MainViewProps> {
  @override
  Map getDefaultProps() {
    return newProps()..useWideViewport = false;
  }

  @override
  render() {
    int gridWidth = props.useWideViewport ? 12 : 8;
    return GridFrame()(
      (VBlock()
        ..isNested = false
        ..size = 12)(
        RolloutStatusNavbar()(),
        Block()(
          Block()(),
          (Block()..size = gridWidth)(
            VBlock()(
              (Block()..shrink = true)(
                BlockContent()(
                  (QueryInput()
                    ..initialQuery = props.store.currentQuery
                    ..onClearResults = props.actions.clearResults
                    ..onQuery = props.actions.query)(),
                ),
              ),
              Block()(
                (Results()
                  ..results = props.store.queryResults
                  ..query = props.store.currentQuery)(),
              ),
            ),
          ),
          Block()(),
        ),
      ),
    );
  }
}
