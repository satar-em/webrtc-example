import {Action, configureStore, ThunkAction} from "@reduxjs/toolkit";
import {appReducer} from './app'
import {modalReducer} from './modal'
import {basicMiddleware, listenerMiddleware} from "./middleware.ts";
import {roomReducer} from "./room";

const store = configureStore({
        reducer: {
            app: appReducer,
            modal: modalReducer,
            room: roomReducer,
        },
        middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(basicMiddleware, listenerMiddleware.middleware),
    }
)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, any, Action>
export default store