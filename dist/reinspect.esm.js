import React, { useEffect, useContext, useReducer as useReducer$1, useState as useState$1, useMemo } from 'react';
import { createStore } from 'redux';

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var StateInspectorContext = /*#__PURE__*/React.createContext(undefined);

var _excluded = ["name", "initialState", "actionsDenylist"],
    _excluded2 = ["children"];
// method on the window, it registers it with the extension. In Strict Mode, this will
// happen **twice** during development, regardless of if you use `useMemo` or `useState` or
// try and workaround it with a ref, showing two instances of your app in the extension.
// Using a module-scope variable requires that this component only be used once globally,
// otherwise it won't create the store.

var registered = false;
var store;

var omit = function omit(obj, keyToRemove) {
  return Object.keys(obj).filter(function (key) {
    return key !== keyToRemove;
  }).reduce(function (acc, key) {
    acc[key] = obj[key];
    return acc;
  }, {});
};

var createReinspectStore = function createReinspectStore(_ref) {
  var _ref$name = _ref.name,
      name = _ref$name === void 0 ? "React state" : _ref$name,
      _ref$initialState = _ref.initialState,
      initialState = _ref$initialState === void 0 ? {} : _ref$initialState,
      actionsDenylist = _ref.actionsDenylist,
      options = _objectWithoutPropertiesLoose(_ref, _excluded);

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

  var store = createStore(storeReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__(_extends({
    name: name,
    actionsDenylist: ["/_init", "/_teardown"].concat(actionsDenylist != null ? actionsDenylist : [])
  }, options)));

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
};

var StateInspector = function StateInspector(_ref2) {
  var children = _ref2.children,
      props = _objectWithoutPropertiesLoose(_ref2, _excluded2);

  if (!registered) {
    store = createReinspectStore(props);
    registered = true;
  }

  useEffect(function () {
    var _store;

    (_store = store) == null ? void 0 : _store.dispatch({
      type: "REINSPECT/@@INIT",
      payload: {}
    });
  }, []);
  return React.createElement(StateInspectorContext.Provider, {
    value: store
  }, children);
};

/* eslint-disable react-hooks/rules-of-hooks */
function useHookedReducer(reducer, initialState, store, reducerId) {
  var _useState = useState$1(function () {
    var initialStateInStore = store.getState()[reducerId];
    return initialStateInStore === undefined ? initialState : initialStateInStore;
  }),
      initialReducerState = _useState[0];

  var _useState2 = useState$1(initialReducerState),
      localState = _useState2[0],
      setState = _useState2[1];

  var _useState3 = useState$1(function () {
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

  var _useState4 = useState$1(function () {
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

  useEffect(function () {
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

  var store = useContext(StateInspectorContext);
  var initializedState = initializer ? initializer(initialState) : initialState;
  return store && id ? useHookedReducer(reducer, initializedState, store, id) : initializer ? useReducer$1(reducer, initialState, initializer) : useReducer$1(reducer, initialState);
}

/* eslint-disable react-hooks/rules-of-hooks */

function stateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}

var useState = function useState(initialState, id) {
  var inspectorStore = useContext(StateInspectorContext); // Keeping the first values

  var _useMemo = useMemo(function () {
    return [inspectorStore, id];
  }, []),
      store = _useMemo[0],
      reducerId = _useMemo[1];

  if (!store || !reducerId) {
    return useState$1(initialState);
  }

  var finalInitialState = useMemo(function () {
    return typeof initialState === "function" ? initialState() : initialState;
  }, []);
  return useHookedReducer(stateReducer, finalInitialState, store, reducerId);
};

export { StateInspector, useReducer, useState };
//# sourceMappingURL=reinspect.esm.js.map
