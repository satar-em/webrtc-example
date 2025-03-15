import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {closeWebsocket, closeWebSocketV2, setupNewWebSocket, setupNewWebSocketV2} from "../../tools/ws/EmaWebSoket.ts";

export interface AppUserIF {
    id: number
    name: string
}

export interface PageLoadingIF {
    message: string
}

interface AppStateIF {
    user?: AppUserIF
    webSoketStatus: string,
    pageLoading?: PageLoadingIF
}

const initialState: AppStateIF = {webSoketStatus: "close"}

const appSlice = createSlice({
    name: "appSlice",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AppUserIF | undefined>) => {
            if (action.payload){
                //setupNewWebSocket(action.payload)
                setupNewWebSocketV2(action.payload)
                localStorage.setItem("localUserData", JSON.stringify(action.payload))
            }else {
                localStorage.removeItem("localUserData")
                closeWebSocketV2()
            }
            state.user = action.payload
        },
        setWebSoketStatus: (state, action: PayloadAction<string>) => {
            state.webSoketStatus = action.payload
        },
        setPageLoading: (state, action: PayloadAction<PageLoadingIF | undefined>) => {
            state.pageLoading = action.payload
        },
    }
})

export const {setUser, setWebSoketStatus, setPageLoading} = appSlice.actions
export const appReducer = appSlice.reducer