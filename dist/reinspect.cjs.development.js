'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var redux = require('redux');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var StateInspectorContext = /*#__PURE__*/React__default.createContext(undefined);

var omit = function omit(obj, keyToRemove) {
  return Object.keys(obj).filter(function (key) {
    return key !== keyToRemove;
  }).reduce(function (acc, key) {
    acc[key] = obj[key];
    return acc;
  }, {});
};

var StateInspector = function StateInspector(_ref) {
  var name = _ref.name,
      _ref$initialState = _ref.initialState,
      initialState = _ref$initialState === void 0 ? {} : _ref$initialState,
      children = _ref.children;
  var store = React.useMemo(function () {
    if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
      return undefined;
    }

    var registeredReducers = {};

    var storeReducer = function storeReducer(state, action) {
      var actionReducerId = action.type.split("/")[0];
      var isInitAction = /\/_init$/.test(action.type);
      var isTeardownAction = /\/_teardown$/.test(action.type);
      var currentState = isTeardownAction ? omit(state, actionReducerId) : _extends({}, state);
      return Object.keys(registeredReducers).reduce(function (acc, reducerId) {
        var reducer = registeredReducers[reducerId];
        var reducerState = state[reducerId];
        var reducerAction = action.payload;
        var isForCurrentReducer = actionReducerId === reducerId;

        if (isForCurrentReducer) {
          acc[reducerId] = isInitAction ? action.payload : reducer(reducerState, reducerAction);
        } else {
          acc[reducerId] = reducerState;
        }

        return acc;
      }, currentState);
    };

    var store = redux.createStore(storeReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__({
      name: name || "React state",
      actionsBlacklist: ["/_init", "/_teardown"]
    }));

    store.registerHookedReducer = function (reducer, initialState, reducerId) {
      registeredReducers[reducerId] = reducer;
      store.dispatch({
        type: reducerId + "/_init",
        payload: initialState
      });
      return function () {
        delete registeredReducers[reducerId];
        store.dispatch({
          type: reducerId + "/_teardown"
        });
      };
    };

    return store;
  }, []);
  React.useEffect(function () {
    store && store.dispatch({
      type: "REINSPECT/@@INIT",
      payload: {}
    });
  }, []);
  return React__default.createElement(StateInspectorContext.Provider, {
    value: store
  }, children);
};

/* eslint-disable react-hooks/rules-of-hooks */
function useHookedReducer(reducer, initialState, store, reducerId) {
  var _useState = React.useState(function () {
    var initialStateInStore = store.getState()[reducerId];
    return initialStateInStore === undefined ? initialState : initialStateInStore;
  }),
      initialReducerState = _useState[0];

  var _useState2 = React.useState(initialReducerState),
      localState = _useState2[0],
      setState = _useState2[1];

  var _useState3 = React.useState(function () {
    return function (action) {
      if (action && typeof action === "object" && typeof action.type === "string") {
        store.dispatch({
          type: reducerId + "/" + action.type,
          payload: action
        });
      } else {
        store.dispatch({
          type: reducerId,
          payload: action
        });
      }
    };
  }),
      dispatch = _useState3[0];

  var _useState4 = React.useState(function () {
    var teardown = store.registerHookedReducer(reducer, initialReducerState, reducerId);
    var lastReducerState = localState;
    var unsubscribe = store.subscribe(function () {
      var storeState = store.getState();
      var reducerState = storeState[reducerId];

      if (lastReducerState !== reducerState) {
        setState(reducerState);
      }

      lastReducerState = reducerState;
    });
    return function () {
      teardown();
      unsubscribe();
    };
  }),
      cleanup = _useState4[0];

  React.useEffect(function () {
    return cleanup;
  }, [cleanup]);
  return [localState, dispatch];
}
function useReducer(reducer, initialState) {
  var id;
  var initializer;

  if ((arguments.length <= 2 ? 0 : arguments.length - 2) === 2) {
    initializer = arguments.length <= 2 ? undefined : arguments[2];
    id = arguments.length <= 3 ? undefined : arguments[3];
  } else if (typeof (arguments.length <= 2 ? undefined : arguments[2]) === "string" || typeof (arguments.length <= 2 ? undefined : arguments[2]) === "number") {
    id = arguments.length <= 2 ? undefined : arguments[2];
  } else {
    initializer = arguments.length <= 2 ? undefined : arguments[2];
    id = arguments.length <= 3 ? undefined : arguments[3];
  }

  var store = React.useContext(StateInspectorContext);
  var initializedState = initializer ? initializer(initialState) : initialState;
  return store && id ? useHookedReducer(reducer, initializedState, store, id) : initializer ? React.useReducer(reducer, initialState, initializer) : React.useReducer(reducer, initialState);
}

/* eslint-disable react-hooks/rules-of-hooks */

function stateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}

var useState = function useState(initialState, id) {
  var inspectorStore = React.useContext(StateInspectorContext); // Keeping the first values

  var _useMemo = React.useMemo(function () {
    return [inspectorStore, id];
  }, []),
      store = _useMemo[0],
      reducerId = _useMemo[1];

  if (!store || !reducerId) {
    return React.useState(initialState);
  }

  var finalInitialState = React.useMemo(function () {
    return typeof initialState === "function" ? initialState() : initialState;
  }, []);
  return useHookedReducer(stateReducer, finalInitialState, store, reducerId);
};

exports.StateInspector = StateInspector;
exports.useReducer = useReducer;
exports.useState = useState;
//# sourceMappingURL=reinspect.cjs.development.js.map
