import 'package:web_skin_dart/ui_components.dart';
import 'package:web_skin_dart/ui_core.dart';

@Factory()
UiFactory<RolloutStatusNavbarProps> RolloutStatusNavbar;

@Props()
class RolloutStatusNavbarProps extends UiProps {}

@Component()
class RolloutStatusNavbarComponent
    extends UiComponent<RolloutStatusNavbarProps> {
  @override
  render() {
    return (Navbar()
      ..location = NavbarLocation.STATIC_TOP
      ..brand = Dom.div()(
        (Dom.h4()..style = {'fontWeight': 'bold', 'marginTop': '0.8rem'})(
            'Rollout Status'),
      ))(
      (Nav()
        ..isInNavbar = true
        ..pullRight = true)(
        (NavItem()
          ..href = 'https://github.com/maxwellpeterson-wf'
          ..target = '_github')('Contribute on Github'),
      ),
    );
  }
}
