import {GrConnect} from "react-icons/gr";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks.ts";
import {useEffect, memo} from "react";
import {useNavigate} from "react-router";
import TitleCard from "../../../components/Cards/TitleCard.tsx";
import {openCallBackModal} from "../../../redux/modal";
import {TfiReload} from "react-icons/tfi";
import {FaRegTrashAlt} from "react-icons/fa";
import {createRoomRequest, getAllRoomRequest, RoomIf, setSelectedRoom} from "../../../redux/room";
import momentJalaali from "moment-jalaali"
import * as React from "react";
import { SubscribeTypedMessageWebsocketV2Subject } from '../../../tools/ws/EmaWebSoket';

const TopSideButtons = memo(() => {
    const dispatch = useAppDispatch()
    const appUser = useAppSelector(state => state.app.user)
    const openAddNewLeadModal = () => {
        dispatch(openCallBackModal({
            title: "Add New Room",
            bodyType: "form",
            onCloseModal: data => {
                if (!data.name) return
                dispatch(createRoomRequest({
                    data: {
                        name: data.name,
                        creator: appUser
                    },
                    onStatus200: _data => {

                    },
                    onError: _data => {

                    }
                }))
            }
        }))
    }
    const onReloadClick = () => {
        dispatch(getAllRoomRequest({
            onStatus200: _data => {


            },
            onError: _data => {

            }
        }))
    }
    return (
        <>
            <div className="inline-block float-right">
                <button className="btn px-6 ml-4 btn-sm normal-case btn-primary" onClick={openAddNewLeadModal}>Add New
                </button>
                <button className="btn ml-4 btn-sm btn-circle  btn-primary" onClick={onReloadClick}>
                    <TfiReload size={20}/>
                </button>
            </div>
        </>
    )
})

function Room() {
    const dispatch = useAppDispatch()
    const appUser = useAppSelector(state => state.app.user)
    const rooms = useAppSelector(state => state.room.rooms)
    const navigation = useNavigate()
    useEffect(() => {
        if (!appUser) {
            navigation("/user/register")
        }
    }, [appUser]);

    useEffect(() => {
        dispatch(getAllRoomRequest({}))
        const subscribeTypedMessageWebsocketV2Subject=SubscribeTypedMessageWebsocketV2Subject((value)=>{
            if(value.type!=="ui-action-toggle"||!value.data.appAction||value.data.appAction!=="room-list-refresh")return
            dispatch(getAllRoomRequest({}))
        })
        return () => {
            subscribeTypedMessageWebsocketV2Subject.unsubscribe()
        }
    }, []);

    const onBtnConnectRoom = (room: RoomIf) => (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        dispatch(setSelectedRoom(room))
        navigation("join/" + room.id)
    }
    const onBtnDeleteRoom = (_room: RoomIf) => (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        console.log("onBtnDeleteRoom")
        /*toast("not implemented yes", {
            type: "warning",
            autoClose: 3000,
            position: "bottom-right"
        })*/
    }
    return (
        <>
            <TitleCard title="Current Rooms" topMargin="mt-0" TopSideButtons={<TopSideButtons/>}>
                <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Creator</th>
                            <th>Created At</th>
                            <th>active User</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            rooms?.map((value, index) =>
                                <tr key={index} className={value.creator.id === appUser?.id ? "bg-blue-50" : ""}>
                                    <td>
                                        <div className="font-bold">{value.id}</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <div className="font-bold">{value.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold">{value.creator.name}</div>
                                        <div className="text-sm opacity-50">id = {value.creator.id}</div>
                                    </td>
                                    <td>
                                        {momentJalaali(value.createdAt).format("jYYYY/jM/jD HH:mm")}
                                    </td>
                                    <td>{value.users.length}</td>
                                    <td>

                                        <button className="btn ml-4 btn-sm btn-circle  btn-ghost"
                                                onClick={onBtnConnectRoom(value)}
                                        >
                                            <GrConnect size={20}/>
                                        </button>
                                        <button
                                            disabled={value.creator.id !== appUser?.id}
                                            className="btn ml-4 btn-sm btn-circle  btn-ghost"
                                            onClick={onBtnDeleteRoom(value)}
                                        >
                                            <FaRegTrashAlt size={20}/>
                                        </button>
                                    </td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </TitleCard>
        </>
    )
}

export default memo(Room)