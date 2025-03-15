import {handleRequestApi} from "../api/requestApi.ts";

export const createRoomRequest = (
    {data, onStatus200, onError}: {
        data: any,
        onStatus200?: (data: any) => void,
        onError?: (data: any) => void
    }
) => handleRequestApi({
    path: "/api/create-room",
    method: "post",
    data,
    onStatus200,
    onError
})
export const getAllRoomRequest = (
    {onStatus200, onError}: {
        onStatus200?: (data: any) => void,
        onError?: (data: any) => void
    }
) => handleRequestApi({
    path: "/api/get-rooms",
    method: "get",
    onStatus200,
    onError
})

export const getRoomByIdRequest = (
    {onStatus200, onError, roomId}: {
        roomId: number,
        onStatus200?: (data: any) => void,
        onError?: (data: any) => void
    }
) => handleRequestApi({
    path: "/api/get-room/" + roomId,
    method: "get",
    onStatus200,
    onError
})

export const createRoomVideoConnectionRequest = (
    {onStatus200, onError, room, startUser, answerUser}: {
        room: number,
        startUser: number,
        answerUser: number,
        onStatus200?: (data: any) => void,
        onError?: (data: any) => void
    }
) => handleRequestApi({
    path: "/api/create-room-video-connection",
    method: "get",
    data: {
        room,
        startUser,
        answerUser,
    },
    onStatus200,
    onError
})


