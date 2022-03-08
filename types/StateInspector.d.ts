import { EnhancerOptions } from "@redux-devtools/extension";
import React from "react";
interface StateInspectorProps extends EnhancerOptions {
    initialState?: any;
}
export declare const StateInspector: React.FC<StateInspectorProps>;
export {};
