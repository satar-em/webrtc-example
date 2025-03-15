import {memo, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import TitleCard from "../../../components/Cards/TitleCard.tsx";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks.ts";
import {getRoomByIdRequest, setSelectedRoom} from "../../../redux/room";
import {TfiArrowRight} from "react-icons/tfi";
import {joinRoom,leaveRoom,SubscribeTypedMessageWebsocketV2Subject} from "../../../tools/ws/EmaWebSoket.ts";
import {setPageLoading} from "../../../redux/app";
import RoomVideos from "./RoomVideos/RoomVideos.tsx";

const TopSideButtons = memo(() => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const onBackClick = () => {
        navigate("..")
        dispatch(setSelectedRoom(undefined))
    }
    return (
        <>
            <div className="inline-block float-right">
                <button className="btn ml-4 btn-sm btn-circle  btn-primary" onClick={onBackClick}>
                    <TfiArrowRight size={20}/>
                </button>
            </div>
        </>
    )
})

function JoinRoom() {
    const [state, setState] = useState({pageInitialized:false})
    const selectedRoom = useAppSelector(state => state.room.selectedRoom)
    const webSoketStatus = useAppSelector(state => state.app.webSoketStatus)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const {roomId} = useParams()

    useEffect(() => {
        dispatch(setPageLoading({message:"please wait"}))
        dispatch(getRoomByIdRequest({
            roomId: Number(roomId),
            onStatus200: data => {
                dispatch(setSelectedRoom(data))
            },
            onError: data => {
                console.log(data)
                navigate("..")
            }
        })).finally(() => {
            state.pageInitialized=true
            setState({...state})
            dispatch(setPageLoading(undefined))
        })
        const subscribeTypedMessageWebsocketV2Subject=SubscribeTypedMessageWebsocketV2Subject((data)=> {
            if(data.type!=="ui-action-toggle"||!data.data.appAction||data.data.appAction!=="room-data-refresh-"+roomId)return
            dispatch(getRoomByIdRequest({
                roomId: Number(roomId),
                onStatus200: _data => {
                    dispatch(setSelectedRoom(_data))
                },
                onError: _data => {
                    console.log(_data)
                    navigate("..")
                }
            }))
        })
        return () => {
            subscribeTypedMessageWebsocketV2Subject.unsubscribe()
            dispatch(setSelectedRoom(undefined))
        }
    },[])

    useEffect(() => {
        if (webSoketStatus == "onopen") {
            joinRoom(Number(roomId))
        }
        return () => {
            if (webSoketStatus == "onopen") {
                leaveRoom(Number(roomId))
            }
        }
    }, [roomId, webSoketStatus])
    return (
        <div>
            {
                state.pageInitialized&&selectedRoom?
                    <TitleCard
                        title={selectedRoom.name}
                        middleHeader={<span>{selectedRoom.users.length} user In Room</span>}
                        topMargin="mt-0"
                        TopSideButtons={<TopSideButtons/>}
                    >
                        <RoomVideos />
                    </TitleCard>
                    :
                    ""
            }
        </div>
    )
}

export default memo(JoinRoom)