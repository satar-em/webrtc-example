import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {AppUserIF} from "../app";
import {handleRequestApi} from "../api/requestApi.ts";

export interface RoomIf {
    id: number
    name: string
    creator: AppUserIF
    createdAt: Date
    users: AppUserIF[]
}

interface RoomStateIf {
    rooms: RoomIf[],
    selectedRoom?: RoomIf
}

const initialState: RoomStateIf = {rooms: []}
let StaticSelectedRoom: RoomIf | undefined
export const GetStaticSelectedRoomData = (): RoomIf | undefined => {
    return StaticSelectedRoom
}
export const SetStaticSelectedRoomData = (room: RoomIf | undefined) => {
    StaticSelectedRoom = room
}

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        setRooms: (state, action: PayloadAction<RoomIf[]>) => {
            state.rooms = action.payload
        },
        setSelectedRoom: (state, action: PayloadAction<RoomIf | undefined>) => {
            SetStaticSelectedRoomData(action.payload)
            state.selectedRoom = action.payload
        }
    },
    extraReducers: builder => builder.addCase(handleRequestApi.fulfilled, (state, action) => {
        if (action.meta.arg.path === "/api/get-rooms") {
            state.rooms = action.payload
        }
    })
})

export const {setRooms, setSelectedRoom} = roomSlice.actions
export const roomReducer = roomSlice.reducer
