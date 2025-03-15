import {AppDispatch, RootState} from "./store.ts";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch
export type AppDispatchType = ReturnType<typeof useAppDispatch>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector