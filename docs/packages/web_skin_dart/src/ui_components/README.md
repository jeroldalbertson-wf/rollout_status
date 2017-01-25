# Web Skin Dart Component Architecture

This section outlines some of the architectural decisions and best practices used to create this repo's reusable UI components.

To keep APIs and functionality consistent, all components that are part of Web Skin Dart should follow these guidelines.

* __[Prop namespacing](#prop-namespacing)__
* __[Prop forwarding](#prop-forwarding)__

    * [CSS class merging](#css-class-merging)

* __[Component control and behavior](#component-control-and-behavior)__

    * [Primitive components](#primitive-components)
    * [Smart components](#smart-components)
    * [Component naming](#component-naming)

* __[Component callbacks](#component-callbacks)__

    * [Primitive component callbacks](#primitive-component-callbacks)
    * [Smart component callbacks](#smart-component-callbacks)


For details on strongly-typed components, fluent-style component consumption, or other core functionality, see the [core Web Skin Dart framework documentation][ui-core].


[](#__START_EMBEDDED_README__)


## Prop namespacing

By default, all components built with Web Skin Dart namespace the keys of their props. Namespacing is done under-the-hood by the `web_skin_dart` [transformer]. (See [transformer props and state].) This helps prevent prop collisions that could occur when forwarding props to child components.

To demonstrate this necessity it is easiest to think about a component that accepts multiple types of children.

```dart

class LargifierComponent ... {
  JsObject render() {
    var singleChild = children.single;

    var propsToAdd = {};
    Button(propsToAdd).size = ButtonSize.LARGE;
    TextInput(propsToAdd).size = InputSize.LARGE;

    return cloneElement(singleChild, propsToAdd);
  }
}

```

In this case, a `Largifier` accepts a single child that can have a `size` prop set. Though `ButtonProps` and `TextInputProps` both declare a size prop, namespacing ensures that their values are stored in different keys.

```dart

/// Pseudocode props declaration
abstract class ButtonProps extends UiProps with ... {
  ...

  ButtonSize size;
  ...
}

/// Pseudocode props declaration
abstract class TextInputProps extends UiProps ... {
  ...

  InputSize size;
  ...
}

```

In the case of `ButtonProps`, `size` is typed as `ButtonSize`, but in `TextInputProps` it's typed as `InputSize`. Without namespacing, `singleChild` could be passed a prop with a key of `'size'`, which would prevent any static type-checking.

The namespacing also prevents us from setting a prop with a given name using one component's typed setter and then trying to read it with another component's typed getter, which would result in type errors that could also not be caught by static analysis.

Rather than risking this or other potentially breaking behavior, the namespacing provided by the `web_skin_dart` [transformer] declares the prop keys as `'ButtonProps.size'` and `'TextInputProps.size'`.

Each prop is namespaced to the class in which it was defined. This makes it impossible for components to unintentionally read props meant for a different component.

Based on this, any cloned child of `Largifier` will be rendered with the following props added.

```dart

{
 'ButtonProps.size': ButtonSize.LARGE,
 'TextInputProps.size': InputSize.LARGE
}

```

Now, consider the following example usages:

```dart

/// Example 1
Largifier()(
 (TextInput()..defaultValue = 'Large input')()
)

/// Example 2
Largifier()(
 Button()('Large button')
)

/// Example 3
Largifier()(
 Dialog()('Default-sized Dialog')
)

```

In the above example, each child ignores the `size` prop that wasn't meant to be consumed by it and makes use of the `size` prop it can consume.

* The TextInput ignores `'ButtonProps.size'`.
* The Button ignores `'TextInputProps.size'`.
* The Dialog ignores both `'ButtonProps.size'` and `'TextInputProps.size'`.

## Prop forwarding

All Web Skin Dart components consume props meant for the component, and pass along any extra props to the rendered components.

This is functionally equivalent to the standard React prop transferring strategy of using a [destructuring assignment (`...`)](http://facebook.github.io/react/docs/transferring-props.html#transferring-with-...-in-jsx) along with JSX spread attributes, to transfer props.

This is especially useful when for adding props that will eventually make their way to the rendered DOM:

For example:
```dart
(ListGroup()
  ..addProp('data-foo', 'bar')
  ..id = 'my_list_group'
  ..style = {'cursor': 'move'}
)('content')
```
will render:
```html
<div class="list-group" id="my_list_group" style="cursor: move;" data-foo="bar">
  content
</div>
```

You can get this behavior by using [`copyUnconsumedProps()`](https://docs.workiva.org/web_skin_dart/latest/api/web_skin_dart.ui_core/UiComponent/copyUnconsumedProps.html) in your own components. When forwarding props to DOM elements use [`copyUnconsumedDomProps()`](https://docs.workiva.org/web_skin_dart/latest/api/web_skin_dart.ui_core/UiComponent/copyUnconsumedDomProps.html) instead. See how it's done in the component [examples].

### CSS class merging

All Web Skin Dart components accept the `className` and `classNameBlacklist` props, which are used, along with `ClassNameBuilder`, to determine the classNames to render to the DOM.

* `className` can be used, like in React JS, to specify additional classes to be added.

* `classNameBlacklist`, on the other hand, allows consumers to prevent classes from be added, even by the component internals.

For example, given a component that, without any props, renders:
```html
<div class="class1 class2 class3"></div>
```

setting `className = 'added classes'` would render:
```html
<div class="class1 class2 class3 added classes"></div>
```

and  setting `classNameBlacklist = 'class1 class3'` would render:
```html
<div class="class2"></div>
```

## Component control and behavior

In In [Web Skin React](https://github.com/Workiva/web-skin-react/), _primitive_ (`props`-only) and _smart_ (`state`ful) behavior lived in the same component.

This resulted in monolithic components with complex `state`/`props` overriding logic, and left portions of display and behavioral logic inaccessible to the component consumers.

In Web Skin Dart, we've decided to split these behaviors into separate components—_primitive_ and _smart_—in order to:

* Enforce better component organization and separation of concerns between display and controller logic.
* Make it easier for consumers to extend and override component behavior.

### Primitive components

__Primitive components__ simply render the data and config passed into them via props, and generally have no `state` (with a few exceptions such as using `state` to animate prop transitions).

Most of the time, these components ___are not___ intended for general-purpose use by consumers, and just serve as the basis for corresponding smart components.

They're here to keep component display and behavior separated, and also for the edge cases where consumers want to completely reimplement their behavior.

### Smart components

Sometimes, components have expected default behaviors that require controller logic to implement. Instead of requiring the library's consumer to reimplement that logic for every usage of a component, we want to provide it out of the box.

__Smart components__ provide this default behavior by wrapping their corresponding _primitive_ components and implementing the necessary controller/view logic. They respond to user input (and possibly API calls) autonomously, passing `props` to the _primitive_ component based on forwarded `props` and the autonomous `state`.

Smart components should have similar `props` to their corresponding _primitive_ components, and should at least forward props to the wrapped component. They should also generally proxy callbacks in some way from the _smart_ component (more on this in the ["Smart component callbacks"](#smart-component-callbacks) section).


#### Simple primitive/smart example:

Primitive:
```dart
// A selectable item "primitive". Takes in props and that's it.
@Component()
class SelectItemPrimitiveComponent extends UiComponent<...> {
  getDefaultProps() => (newProps()
    ..isSelected = false
    ..onClick = null
  );

  render() {
    return (Dom.div()
      ..className = props.isSelected ? 'selected' : ''
      ..onClick = props.onClick
    )(props.children);
  }
}
```

Smart:
```dart
// A "smart" selectable item that maintains its own selected state.
// This component "wraps" SelectItemPrimitive by forwarding and consuming its props and callbacks.
@Component()
class SelectItemComponent extends UiComponent<...> {
  getDefaultProps() => (newProps()
    ..onSelect = null
  );

  getInitialState() => (newState()
    ..isSelected = false
  );

  _handleClick(event) {
    // Naively call callback (more on this in the "Smart component callbacks" section)
    props.onSelect(event);

    // Toggle state
    setState(newState()
      ..isSelected = !state.isSelected
    );
  }

  render() {
    Map propsToForward = copyProps(keysToOmit: [/* key for 'onSelect' */]);

    // Render the primitive component.
    return (SelectItemPrimitive()
      ..addProps(propsToForward)
      ..isSelected = state.isSelected
      ..onClick = this._handleClick
    )(props.children);
  }
}
```


### Component naming

In general, components we intend for consumer use should have friendly names.

* For components with that are only _primitive_, an unpostfixed name is acceptable:

    * `Button`
    * `ListGroup`

* For components with both _primitive_ and _smart_ parts, the _primitive_ one should be postfixed with `Primitive`:

    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>prop</th>
          <th>prop key</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>built-in `React.DOM` components (`DomProps`)</td>
          <td>`type`</td>
          <td>`'type'`</td>
        </tr>
        <tr>
          <td>`Button`</td>
          <td>`type`</td>
          <td>`'uip_Button.type'`</td>
        </tr>
        <tr>
          <td>`ListGroup`</td>
          <td>`type`</td>
          <td>`'uip_ListGroup.type'`</td>
        </tr>
      </tbody>
    </table>

* Filenames should also reflect this:

    * `DatepickerPrimitive`: `datepicker_primitive.dart`
    * `Datepicker`: `datepicker.dart`

## Component callbacks

* Components that deal with external interactions (user input, API calls, etc.) should provide `props` for each corresponding action.

* Callback props should _always_ be typedef'd to the appropriate set of arguments—`Function` isn't good enough.  
_Note: to keep callback consumption lightweight, while also accommodating cancelling via returning `false` (mentioned in ["Smart component callbacks"](#smart-component-callbacks)), typedefs should generally not specify an explicit return type._

* Multiplexing callbacks should be named so as to indicate that behavior.

    Consider the following example, with a `Dropdown` component that multiplexes selection callbacks from multiple `MenuItem` children:
    ```dart
    @Props()
    class MenuItemProps extends UiProps {
      SelectionCallback onSelect;
    }
    ```

    ```dart
    @Props()
    class DropdownProps extends UiProps {
      // good; it's clear from the name what this callback represents
      SelectionCallback onItemSelect;

      // bad; using the same name as the multiplexed callback can lead to confusion
      SelectionCallback onSelect;
    }
    ```

* Multiplexing callbacks should not overwrite callbacks on their children. The callbacks should be chained, with the child's callback being executed first.

    Utility functions are provided for chaining all callback types in `ui_core`.



### Primitive component callbacks

Callbacks in _primitive_ components generally just proxy DOM events from the appropriate rendered elements, but may also multiplex several handlers or perform additional processing.

### Smart component callbacks
* Callbacks in _smart_ components should be specific, and should generally correspond to actions that result in state changes. These action-related callbacks will often be based on callbacks from the _primitive_ component, but it's important to expose those raw events to the consumer, so _smart_ components may want to proxy those events.

* Depending on the component, it may make sense to have more general callbacks as well, multiplexing state-change-related callback.

* `-Will-` and `-Did-` callbacks for before and after default behavior should also be provided when appropriate. In this case, the `-Will-` callback should be cancellable, and the `-Did-` one should not (since there's nothing left to do that could be cancelled).

* To keep consumption flexible and overrideable, _smart_ behavior should generally be cancellable from callbacks by returning `false`:

For example, consider a list group that lets you select items by clicking on them:

* Specific callbacks:
    ```dart
    // Callback typedefs
    typedef Callback();
    typedef DomEventCallback(react.SyntheticEvent event);
    typedef SelectionCallback(Object itemKey);
    typedef SelectionExpandCallback(bool retainExistingSelection);
    //...

    @Props()
    class SelectableListGroupProps extends UiProps {
      // Action-based callbacks
      SelectionCallback       onItemSelect;
      SelectionCallback       onItemDeselect;
      SelectionCallback       onToggleSelection;
      Callback                onSelectAll;
      SelectionExpandCallback onSelectNext;
      SelectionExpandCallback onSelectPrevious;

      // Pass-through/proxy callback
      DomEventCallback        onSelectableItemClick; // callback on the primitive component

      //...
    }
    ```

* Cancellation from a callback:
    ```dart
    void _handleSelect(Object itemKey) {
      SelectionCallback callback = props.onSelect;
      if (callback != null && callback(itemKey) == false) {
        // Short-circuit default behavior if the callback cancelled this action by returning 'false'.
        return;
      }

      // Proceed with default behavior.
      //...
    }
    ```

* General/multiplexing callbacks relating to state change:
    ```dart
    // Callback typedefs
    //...
    typedef SelectionChangeCallback(List<Object> selectedItemKeys);

    @Props()
    class SelectableListGroupProps extends UiProps {
      //...

      // General state change callbacks
      SelectionChangeCallback onSelectionChange;
    }
    ```

* `-Will-` and `-Did-` callbacks:
    ```dart
      // General state change callbacks
      SelectionChangeCallback onSelectionWillChange; // before change; is cancellable
      SelectionChangeCallback onSelectionDidChange;  // after change; is NOT cancellable
    ```

## Using Refs

There are a few use cases for obtaining a 'reference' to a component; you might want to access the `DOM` node of a
`<div>` your component renders, or use the public API methods available on many Web Skin Dart components. The best way
to do this is to use a [callback ref](#callback-refs). To learn more about refs beyond the documentation provided here,
you can read [the `ReactJS` article on the subject](https://facebook.github.io/react/docs/more-about-refs.html).

### Callback Refs

The `ref` prop is available on every component, and when you set it to a callback function, the callback will be invoked
immediately after the component is mounted. The component you attached the callback to will be passed in as a parameter.
You can then use the reference to the component immediately, or save it for later use.

When using a callback ref on a `DOM` component, it'll be called with the `DOM` node. Here's an example of using a
callback ref on a `Dom.input`:

```dart
@override
render() {
  return (Dom.input()
    ..ref = (InputElement input) {
      if (input != null) {
        input.focus();
      }
    }
  )();
}
```

When using a callback ref on a `Web Skin Dart` component (either one we've made, or one you've made), it'll be called
with the instance of the component. Here's an example of using a callback ref on a WSD `TextInput` by storing the
reference to the component in a variable:

```dart
TextInputComponent textInputRef;

@override
render() {
  return (TextInput()
    ..ref = (TextInputComponent ref) { textInputRef = ref; }
  )();
}

@override
componentDidMount() {
  textInputRef.focus();
}
```

#### Caveats

When the referenced component is unmounted, and whenever the ref changes, the old ref will be called with `null` as the
argument. It's important to note that if you're using an inline function, like in the examples above, `ReactJS` will
treat it as a different ref on each render. `ReactJS` does this to prevent memory leaks.


## String Refs

The `ref` prop can also be set to a `String`, but this is considered a legacy feature by `ReactJS`. If you choose to use
it (not recommended), you can access the ref using the `ref()` function.

```dart
@override
render() {
  return (Dom.input()
    ..ref = 'input'
  )();
}

@override
componentDidMount() {
  ref('input').focus();
}
```


[ui-core]: /lib/src/ui_core/README.md
[transformer]: /lib/src/transformer/README.md
[transformer props and state]: /lib/src/transformer/README.md#props-and-state-getterssetters
[examples]: /example/component_declaration/
