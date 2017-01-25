import 'package:web_skin_dart/ui_components.dart';
import 'package:web_skin_dart/ui_core.dart';

@Factory()
UiFactory<QueryInputProps> QueryInput;

@Props()
class QueryInputProps extends UiProps {
  String initialQuery;
  Callback onClearResults;
  Callback1Arg<String> onQuery;
}

@State()
class QueryInputState extends UiState {
  String queryValue;
  bool submitted;
}

@Component()
class QueryInputComponent
    extends UiStatefulComponent<QueryInputProps, QueryInputState> {
  final RegExp _queryRegex = new RegExp(r'\w+ (\d+\.\d+\.\d+)');

  @override
  getDefaultProps() => (newProps()..initialQuery = '');

  @override
  getInitialState() => (newState()
    ..submitted = props.initialQuery != '' ? true : false
    ..queryValue = props.initialQuery);

  @override
  render() {
    return (Form()..onSubmit = _onSubmit)(
      (TextInput()
        ..help = _getHelpLabel()
        ..hideLabel = true
        ..placeholder = 'Enter dependency name and version'
        ..size = InputSize.LARGE
        ..onChange = _onChange
        ..skin = _getInputSkin()
        ..value = state.queryValue)(),
    );
  }

  _getHelpLabel() {
    if (state.queryValue == null || state.queryValue == '') return '';
    if (_isValidInput()) return '';
    return 'Must input the dependency\'s package name and version separated '
        'by a space, e.g. wdesk_sdk 1.0.1';
  }

  _getInputSkin() {
    if (state.queryValue == null || state.queryValue == '' || state.submitted) {
      return InputSkin.DEFAULT;
    } else if (_isValidInput())
      return InputSkin.SUCCESS;
    else
      return InputSkin.ERROR;
  }

  _isValidInput() {
    if (state.queryValue == null || state.queryValue == '')
      return true;
    else {
      if (_queryRegex.hasMatch(state.queryValue)) {
        return true;
      } else {
        return false;
      }
    }
  }

  _onChange(event) {
    if (state.submitted) {
      props.onClearResults();
    }
    setState(newState()
      ..submitted = false
      ..queryValue = event.target.value);
  }

  _onSubmit(_) {
    if (_isValidInput()) {
      props.onQuery(state.queryValue);
      setState(newState()..submitted = true);
    } else {
      return false;
    }
  }
}
