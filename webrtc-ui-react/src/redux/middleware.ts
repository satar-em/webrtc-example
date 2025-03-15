import {createListenerMiddleware, Middleware} from "@reduxjs/toolkit";
import {AppDispatch, RootState} from "./store.ts";
import {handleRequestApi} from "./api/requestApi.ts";
import * as axios from "axios";

export const listenerMiddleware = createListenerMiddleware()

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

startAppListening({
    actionCreator: handleRequestApi.pending,
    effect: async (_action, _api) => {
        //console.log({_api, _action})
    }
})

startAppListening({
    actionCreator: handleRequestApi.fulfilled,
    effect: (_action, _api) => {
        //console.log({_api, _action})
    }
})

export const basicMiddleware: Middleware<any, any, any> = storeAPI => next => async action => {
    if (typeof action === 'function') {
        let extraData: any = {baseUrl: ""}
        try {
            const {data} = await axios.default.get("/api/extra")
            extraData = {...extraData, data}
        } catch (e) { /* empty */ }
        return action(storeAPI.dispatch, storeAPI.getState, extraData)
        //return action(storeAPI.dispatch, storeAPI.getState)
    }
    return next(action)
}

