import { EnhancerOptions } from "@redux-devtools/extension"
import React, { Reducer, ReducerAction, useEffect } from "react"
import { createStore } from "redux"
import { EnhancedStore, StateInspectorContext } from "./context"

interface StateInspectorProps extends EnhancerOptions {
  initialState?: any
}

interface StoreReducerAction {
  type: string
  payload: any
}

// This hack is required because creating the store is an impure effect. When it calls the
// method on the window, it registers it with the extension. In Strict Mode, this will
// happen **twice** during development, regardless of if you use `useMemo` or `useState` or
// try and workaround it with a ref, showing two instances of your app in the extension.
// Using a module-scope variable requires that this component only be used once globally,
// otherwise it won't create the store.
let registered = false
let store: EnhancedStore | undefined

const omit = (obj: Record<string, any>, keyToRemove: string) =>
  Object.keys(obj)
    .filter(key => key !== keyToRemove)
    .reduce<Record<string, any>>((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})

const createReinspectStore = ({
  name = "React state",
  initialState = {},
  actionsDenylist,
  ...options
}: StateInspectorProps): EnhancedStore | undefined => {
  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return undefined
  }

  const registeredReducers: Record<
    string | number,
    Reducer<any, ReducerAction<any>>
  > = {}

  const storeReducer: Reducer<any, StoreReducerAction> = (state, action) => {
    const actionReducerId = action.type.split("/")[0]
    const isInitAction = /\/_init$/.test(action.type)
    const isTeardownAction = /\/_teardown$/.test(action.type)

    const currentState = isTeardownAction
      ? omit(state, actionReducerId)
      : { ...state }

    return Object.keys(registeredReducers).reduce((acc, reducerId) => {
      const reducer = registeredReducers[reducerId]
      const reducerState = state[reducerId]
      const reducerAction = action.payload
      const isForCurrentReducer = actionReducerId === reducerId

      if (isForCurrentReducer) {
        acc[reducerId] = isInitAction
          ? action.payload
          : reducer(reducerState, reducerAction)
      } else {
        acc[reducerId] = reducerState
      }

      return acc
    }, currentState)
  }

  const store = (createStore(
    storeReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__({
      name,
      actionsDenylist: ["/_init", "/_teardown"].concat(actionsDenylist ?? []),
      ...options
    })
  ) as any) as EnhancedStore

  store.registerHookedReducer = (reducer, initialState, reducerId, options) => {
    registeredReducers[reducerId] = reducer

    store.dispatch({
      type: `${reducerId}/_init`,
      payload: initialState
    })

    return () => {
      delete registeredReducers[reducerId]

      if (options.teardownOnUnmount) {
        store.dispatch({
          type: `${reducerId}/_teardown`
        })
      }
    }
  }

  return store
}

export const StateInspector: React.FC<React.PropsWithChildren<
  StateInspectorProps
>> = ({ children, ...props }) => {
  if (!registered) {
    store = createReinspectStore(props)
    registered = true
  }

  useEffect(() => {
    store?.dispatch({ type: "REINSPECT/@@INIT", payload: {} })
  }, [])

  return (
    <StateInspectorContext.Provider value={store}>
      {children}
    </StateInspectorContext.Provider>
  )
}
