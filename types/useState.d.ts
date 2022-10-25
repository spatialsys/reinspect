/// <reference types="react" />
import { ReducerOptions } from "./context";
export declare const useState: <S>(initialState: S | (() => S), id: string | number, options?: ReducerOptions) => [S, import("react").Dispatch<import("react").SetStateAction<S>>];
