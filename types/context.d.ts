import React, { Reducer } from "react";
import { Store } from "redux";
declare type UnsubscribeFn = () => void;
export interface ReducerOptions {
    /**
     * When set to true, deletes the state from the reducer when the component/reducer is unmounted.
     * Defaults to false because not desirable when using StrictMode. May want to clean-up state in
     * production environments if a reducer has a lot of state.
     */
    teardownOnUnmount?: boolean;
}
export declare type EnhancedStore = Store & {
    registerHookedReducer: (reducer: Reducer<any, any>, initialState: any, reducerId: string | number, options: ReducerOptions) => UnsubscribeFn;
};
export declare const StateInspectorContext: React.Context<EnhancedStore | undefined>;
export {};
