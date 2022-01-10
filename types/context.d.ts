import React, { Reducer } from "react";
import { Store } from "redux";
declare type UnsubscribeFn = () => void;
export declare type EnhancedStore = Store & {
    registerHookedReducer: (reducer: Reducer<any, any>, initialState: any, reducerId: string | number) => UnsubscribeFn;
};
export declare const StateInspectorContext: React.Context<EnhancedStore | undefined>;
export {};
