import {AppDispatch, RootState} from "../store.ts";
import * as axios from "axios";
import {createAsyncThunk} from "@reduxjs/toolkit";

export interface RequestApiArgsIF {
    method: "get" | "put" | "post",
    path: string
    data?: any
    onStatus200?: (data: any) => void
    onError?: (data: any) => void
}

export const createAppAsyncThunk = createAsyncThunk.withTypes<{ status: RootState, dispatch: AppDispatch }>()
export const handleRequestApi = createAppAsyncThunk<any, RequestApiArgsIF>("/api/request", async (params, thunkAPI) => {
    //console.log(thunkAPI.extra)
    if (thunkAPI.extra && (thunkAPI.extra as any).baseUrl) {
        params.path = (thunkAPI.extra as any).baseUrl + params.path
    }
    let responseData: any = undefined
    //const headers: any = {}
    try {
        /*if (params.needAuth) {
            const authentication = localStorage.getItem("authentication")
            if (authentication) {
                headers.Authentication = authentication
            }
        }*/
        const response = await (params.data ? axios.default[params.method]<any>(params.path, params.data) : axios.default[params.method]<any>(params.path))
        if (response.status == 200) {
            responseData = response.data
            params.onStatus200?.(responseData)
        }
    } catch (e) {
        params.onError?.(e)
    }
    return responseData
})