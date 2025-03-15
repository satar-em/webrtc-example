import {memo, Ref, useEffect, useRef, useState} from "react";
import {sendMessageToRoom, SubscribeTypedMessageWebsocketV2Subject} from "../../../../tools/ws/EmaWebSoket.ts";
import {AppUserIF} from "../../../../redux/app";
import {GetStaticSelectedRoomData, RoomIf} from "../../../../redux/room";
import * as AxiosObservable from "../../../../tools/observable-api/AxiosObservable"
import * as _ from "lodash"
import * as RX from "rxjs"

interface RoomVideoState {
    userCameras: AppUserIF[]
    userInRoom: AppUserIF[]
    compiling: boolean
}

interface UserCameraIF {
    user: AppUserIF,
    connectionId: number
    mediaProvider?: MediaProvider,
    peerConnection?: RTCPeerConnection
}

let userCamerasState: UserCameraIF[] = []

const userCamerasStateSubject = new RX.Subject<{ type: "add" | "remove", userCamera: UserCameraIF }>()


function RoomVideos() {
    const selectedRoom: RoomIf = GetStaticSelectedRoomData()!
    const appUser: AppUserIF = JSON.parse(localStorage.getItem("localUserData")!)
    const [state, setState] = useState<RoomVideoState>({
        userCameras: [],
        userInRoom: selectedRoom.users,
        compiling: false
    });
    //console.log("*logem",state.userCameras)
    const userVideo = useRef<HTMLVideoElement>(null);
    const userStream = useRef<MediaStream>(null);
    const openCamera = async () => {
        if (userStream.current) return
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        userVideo.current!.srcObject = stream;
        userStream.current = stream;
    };

    useEffect(() => {
        const userCamerasStateSubjectSub = userCamerasStateSubject.subscribe(value => {
            
            //console.log({value})
            if (value.type === "add") {
                state.userCameras = _.sortBy(_.concat(state.userCameras, value.userCamera.user), "id")
                setState({...state})
            }
            if (value.type === "remove") {
                state.userCameras = state.userCameras.filter(value1 => value1.id!==value.userCamera.user.id)
                setState({...state})
            }
        })

        return () => {
            userCamerasStateSubjectSub.unsubscribe()
            //subscribeAllTypeWebSocket.unsubscribe()
        }
    })

    const onCameraInit = () => {

    }

    const createRoomVideoConnection = (startUser: number, answerUser: number, room: number) => {
        
        if (answerUser === appUser.id || _.find(state.userCameras, {id: answerUser}) || _.find(userCamerasState.map(value => value.user), {id: answerUser})) return
        AxiosObservable.post("/api/create-room-video-connection", {startUser, answerUser, room}).subscribe({
            next: async (value) => {
                
                await openCamera()
                //console.log(value.data)
                const userCamera: UserCameraIF = {
                    user: value.data.answerUser,
                    connectionId: value.data.id,
                }
                userCamera.peerConnection = createPeer(userCamera)
                userCamerasState.push(userCamera)
                userCamerasStateSubject.next({userCamera, type: "add"})
                userStream.current!.getTracks().forEach((track) => {
                    userCamera.peerConnection!.addTrack(track, userStream.current!);
                });
            },
            complete: () => {

            },
            error: (_err) => {
                //console.log(err.response.data.emamiData)
            }
        })
    }

    const setStartCallUserOfferData = (idRoomVideoConnection: number, startCallUserOfferData: string) => {
        
        AxiosObservable.post("/api/set-start-call-user-offer-data", {
            idRoomVideoConnection,
            startCallUserOfferData
        }).subscribe({
            next: (_value) => {
                
                //console.log(value)
            },
            complete: () => {

            },
            error: (err) => {
                
                console.log(err.response.data)
            }
        })
    }
    const setAnswerUserAnswerData = (idRoomVideoConnection: number, answerUserAnswerData: string) => {
        
        AxiosObservable.post("/api/set-answer-user-answer-data", {
            idRoomVideoConnection,
            answerUserAnswerData
        }).subscribe({
            next: (_value) => {
                
                //console.log(value)
            },
            complete: () => {

            },
            error: (err) => {
                
                console.log(err.response.data)
            }
        })
    }

    const createPeer = (user: UserCameraIF) => {
        
        const peer = new RTCPeerConnection({
            //iceServers: [{urls: "stun:stun.l.google.com:19302"}],
        });
        peer.onnegotiationneeded = handleNegotiationNeeded(user);
        peer.onicecandidate = handleIceCandidateEvent(user);
        peer.ontrack = handleTrackEvent(user);
        peer.onconnectionstatechange = handleConnectionstatechange(user)
        return peer;
    };
    const handleConnectionstatechange = (user: UserCameraIF) => (_event: Event) => {
        console.log("user.peerConnection?.iceConnectionState",user.peerConnection?.iceConnectionState)
        if (user.peerConnection?.iceConnectionState === "disconnected") {
            user.peerConnection.close()
            user.peerConnection = undefined
            userCamerasState = userCamerasState.filter(value => value.user.id !== user.user.id)
            //state.userCameras = userCamerasState.map(value => value.user)
            //setState({...state})
        }
    }

    const handleNegotiationNeeded = (user: UserCameraIF) => async (_ev: Event) => {
        
        try {
            const myOffer = await user.peerConnection!.createOffer();
            await user.peerConnection!.setLocalDescription(myOffer);
            console.log("sending offer=>",user.peerConnection!.localDescription)
            setStartCallUserOfferData(user.connectionId, JSON.stringify(user.peerConnection!.localDescription))
            //sendMessageToRoom(roomId, {offer: user.peerConnection!.localDescription, toUser: user.user})
        } catch (err) {
            console.error(err)
        }
    }
    const handleIceCandidateEvent = (user: UserCameraIF) => async (ev: RTCPeerConnectionIceEvent) => {
        
        if (ev.candidate) {
            console.log("my candidate=>",ev.candidate)
            sendMessageToRoom(selectedRoom.id, {iceCandidate: ev.candidate, toUser: user.user})

        }
    }
    const handleTrackEvent = (user: UserCameraIF) => (ev: RTCTrackEvent) => {
        
        console.log("tracer found", ev.streams[0])
        userCamerasState.forEach(value => {
            if (value.user.id == user.user.id) {
                value.mediaProvider = ev.streams[0]
                //value.userVideo!.current!.srcObject = ev.streams[0]
            }
        })
        setState({...state})
    }

    useEffect(() => {
        const subscribeAllTypeWebSocket = SubscribeTypedMessageWebsocketV2Subject(async data => {
            
            console.log("SubscribeTypedMessageWebsocketV2Subject")
            if (userStream.current
                && data.data
                && data.data.extraData
                && data.data.extraData.message
                && data.data.extraData.message.toUser
                && data.data.extraData.message.toUser.id === appUser.id
            ) {
                const message = data.data.extraData.message
                if (message.iceCandidate) {
                    console.log("his candidate=>",message.iceCandidate)
                    try {
                        const userCameraIndex = userCamerasState.findIndex(value => value.user.id === data.data.user.id)
                        if (userCameraIndex < 0)
                            return
                        await userCamerasState[userCameraIndex].peerConnection!.addIceCandidate(message.iceCandidate);
                    } catch (err) {
                        console.error("error ICE CANDIDADE", err)
                    }
                    return
                }
            }
            if (
                !data
                || !data.type
                || (data.type !== "room-message")
                || !data.data
                || !data.data.roomId
                || data.data.roomId !== selectedRoom.id
                || !data.data.extraData
            ) return
            //console.log(data.data.extraData)
            const {connectionMessageType} = data.data.extraData
            if (connectionMessageType && connectionMessageType === "offer" && data.data.extraData.answerUser.id === appUser.id) {
                console.log(data.data.extraData.startCallUser.name + " calling me :)")
                if (!_.find(userCamerasState, {connectionId: data.data.extraData.connectionID})) {
                    const userCamera: UserCameraIF = {
                        user: data.data.extraData.startCallUser,
                        connectionId: data.data.extraData.connectionID,
                    }
                    await openCamera()
                    userCamera.peerConnection = createPeer(userCamera)
                    userCamerasState.push(userCamera)
                    userCamerasStateSubject.next({userCamera, type: "add"})
                    await userCamera.peerConnection.setRemoteDescription(JSON.parse(data.data.extraData.message));
                    console.log("his offer=>",JSON.parse(data.data.extraData.message))
                    userStream.current!.getTracks().forEach((track) => {
                        userCamera.peerConnection!.addTrack(track, userStream.current!);
                    });
                    const answer = await userCamera.peerConnection.createAnswer();
                    await userCamera.peerConnection.setLocalDescription(answer);
                    console.log("answer",userCamera.peerConnection!.localDescription)
                    setAnswerUserAnswerData(data.data.extraData.connectionID, JSON.stringify(userCamera.peerConnection!.localDescription))
                    //console.log(userCamera.peerConnection!.localDescription)//json
                } else {
                    const userCamera = _.find(userCamerasState, {connectionId: data.data.extraData.connectionID})
                    console.log(userCamera)
                }
            }
            if (connectionMessageType && connectionMessageType === "answer" && data.data.extraData.startCallUser.id === appUser.id) {
                console.log(data.data.extraData.answerUser.name + " answer me :)")
                console.log("his answer=>",JSON.parse(data.data.extraData.message))
                //console.log(JSON.parse(data.data.extraData.message))
                const userCameraIndex = userCamerasState.findIndex(value => value.user.id === data.data.extraData.answerUser.id)
                if (userCameraIndex < 0)
                    return
                await userCamerasState[userCameraIndex].peerConnection!.setRemoteDescription(
                    new RTCSessionDescription(JSON.parse(data.data.extraData.message))
                );
            }
        })
        return () => {
            subscribeAllTypeWebSocket?.unsubscribe()
        }
    }, []);

    useEffect(() => {
        state.userInRoom.forEach(value => {
            createRoomVideoConnection(appUser.id, value.id, selectedRoom.id)
        })
        const subscribeAllTypeWebSocket = SubscribeTypedMessageWebsocketV2Subject(data => {
            
            if (!data || !data.type || !data.data || !data.data.user || (data.type !== "leave-room" && data.type !== "join-room")) return
            if (data.type === "leave-room") {
                state.userInRoom = state.userInRoom.filter(value => value.id !== data.data.user.id)
                const userCameraIndex = state.userCameras.findIndex(value => value.id === data.data.user.id)
                if (userCameraIndex >= 0){
                    const userCamerasStateIndex = userCamerasState.findIndex(value => value.user.id === data.data.user.id)
                    if (userCamerasStateIndex>=0){
                        const leavedUser=userCamerasState[userCamerasStateIndex]
                        userCamerasState=userCamerasState.filter(value => value.user.id !== data.data.user.id)
                        userCamerasStateSubject.next({userCamera:leavedUser, type: "remove"})
                    }
                }

                //state.userInRoom = _.filter(state.userInRoom,{id: data.data.user.id})
            } else if (data.type === "join-room") {
                state.userInRoom = _.sortBy(_.concat(state.userInRoom, data.data.user), "id")
                //createRoomVideoConnection(appUser.id, data.data.user.id, selectedRoom.id)
            }
            setState({...state})
        })
        return () => {
            subscribeAllTypeWebSocket?.unsubscribe()
        }
    });
    //}, [JSON.stringify(state.userInRoom.map(value => value.id))]);

    useEffect(() => {

        return () => {
        }
    }, [JSON.stringify(state.userCameras.map(value => value.id))]);

    useEffect(() => {
        openCamera().then(() => {
            onCameraInit()
        });
        return () => {
            userCamerasState.forEach((userCameras) => {
                {
                    userCameras.peerConnection?.close()
                }
            })
            userCamerasState = []
        }
    }, [])


    return (
        <>
            <div className="grid grid-cols-3">
                <RoomVideosCamera userVideo={userVideo} user={appUser} extraStyle="col-start-2"/>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
                {
                    state.userInRoom.map((value, index) =>
                        <div key={index}
                             className="rounded-[10px] bg-blue-300 flex items-center justify-center">
                            ({value.id},{value.name})
                        </div>
                    )
                }
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                {
                    userCamerasState.map((value, index) =>
                        <RoomVideosCamera
                            key={index}
                            mediaProvider={value.mediaProvider}
                            //userVideo={value.userVideo}
                            user={value.user}/>
                    )
                }
            </div>
        </>
    );
}

interface RoomVideosCameraIF {
    userVideo?: Ref<HTMLVideoElement> | undefined,
    user: AppUserIF,
    extraStyle?: string
    mediaProvider?: MediaProvider,
}

const RoomVideosCamera = memo(({userVideo, user, extraStyle, mediaProvider}: RoomVideosCameraIF) => {
    console.log("rendred")
    //userVideo = userVideo || useRef<HTMLVideoElement>(null)
    return (<>
            <div className={`flex flex-col ${extraStyle}`}>
                <span> {user.name}</span>
                {
                    userVideo ?
                        <video className="rounded-[10px] shadow-[0_35px_35px_rgba(0,0,0,0.25)] flex-auto md:max-h-[200px]" autoPlay muted ref={userVideo}/>
                        :
                        <video className="rounded-[10px] flex-auto " controls autoPlay muted  ref={instance => {
                            if (!instance || !mediaProvider) return
                            instance.srcObject = mediaProvider
                        }}/>
                }
            </div>
        </>
    )
}, /*(prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id && prevProps.extraStyle === nextProps.extraStyle && (typeof prevProps.mediaProvider) === (typeof nextProps.mediaProvider)
}*/)

export default memo(RoomVideos);