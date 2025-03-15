import {AppUserIF, setWebSoketStatus} from "../../redux/app";
import {AppDispatchType} from "../../redux/hooks.ts";
import * as RXWebsocket from "rxjs/webSocket"
import * as RX from "rxjs"
import momentJalaali from "moment-jalaali";

let webSocketV2: RXWebsocket.WebSocketSubject<WebsocketV2MessageIf>
let isSetup: boolean = false
let localUser: AppUserIF
let dispatch: AppDispatchType

export function setDispatch(appDispatch: AppDispatchType) {
    dispatch = appDispatch
}

export function subscribeRoom() {
    if (!isSetup) return
    sendMessageV2("join-topic", {topicId: "rooms", topicName: "Rooms Topic"})
}

export function subscribeUiActions() {
    if (!isSetup) return
    sendMessageV2("join-topic", {topicName: "ui-actions"})
}

export function unSubscribeRoom() {
    if (!isSetup) return
    sendMessageV2("leave-topic", {topicId: "rooms", topicName: "Rooms Topic"})
}

export function joinRoom(roomId: number) {
    if (!isSetup) return
    sendMessageV2("join-room", {roomId})
}

export function leaveRoom(roomId: number) {
    if (!isSetup) return
    sendMessageV2("leave-room", {roomId})
}

export function sendMessageToRoom(roomId: number, message: any) {
    if (!isSetup) return
    sendMessageV2("room-message", {roomId, message})
}

interface WebsocketV2MessageIf {
    type: string
    sender: number,
    data: any,
}

export function closeWebSocketV2() {
    if (!isSetup) return
    webSocketV2.complete()
}

export function setupNewWebSocketV2(user: AppUserIF) {
    localUser = user
    webSocketV2 = RXWebsocket.webSocket({
        url: `wss://192.168.1.202:5173/api/ws/subscribe`,
        serializer: (value: WebsocketV2MessageIf) => {
            return JSON.stringify(value)
        },
        deserializer: (event) => {
            return JSON.parse(event.data) as WebsocketV2MessageIf
        },
        closeObserver: {
            next: (_closeEvent) => {
                isSetup = false
                statusWebsocketV2Subject.next({
                    open: false,
                    time: momentJalaali(new Date()).format("jYYYY/jMM/jDD HH:mm")
                })
                dispatch(setWebSoketStatus("onclose"))
            }
        },
        openObserver: {
            next: (_event) => {
                isSetup = true
                statusWebsocketV2Subject.next({
                    open: true,
                    time: momentJalaali(new Date()).format("jYYYY/jMM/jDD HH:mm")
                })
                //console.log(event)
                dispatch(setWebSoketStatus("onopen"))
                webSocketV2.next({
                    type: "start-connection",
                    data: {message: "I am coming bro"},
                    sender: user.id
                })
                subscribeUiActions()
                //console.log("opened new version of websocket,event=>", event)
            }
        }
    })
    webSocketV2.subscribe({
        complete: () => {
            console.log("web Soket compelete");
        },
        error(err) {
            console.log(`webSocketV2.subscribe.err`, err);
        },
        next(value) {
            typedMessageWebsocketV2Subject.next(value)
        },
    })
}

export function SubscribeAllTypeWebSocket(observerOrNext: Partial<RX.Observer<WebsocketV2MessageIf>> | ((value: WebsocketV2MessageIf) => void)) {
    if (!isSetup) return
    return webSocketV2.subscribe(observerOrNext)
}

//const statusWebsocketV2Subject = new RX.Subject<{ open: boolean, time: string }>()
const statusWebsocketV2Subject = new RX.ReplaySubject<{ open: boolean, time: string }>(1)

//const statusWebsocketV2SubjectWithPip=statusWebsocketV2Subject
export function SubscribeStatusWebSocket(observerOrNext: Partial<RX.Observer<{
    open: boolean,
    time: string
}>> | ((value: { open: boolean, time: string }) => void)) {
    return statusWebsocketV2Subject.subscribe(observerOrNext)
}

const typedMessageWebsocketV2Subject = new RX.Subject<WebsocketV2MessageIf>()

export function SubscribeTypedMessageWebsocketV2Subject(observerOrNext: Partial<RX.Observer<WebsocketV2MessageIf>> | ((value: WebsocketV2MessageIf) => void)) {
    return typedMessageWebsocketV2Subject.subscribe(observerOrNext)
}

export function getIsSetup(): boolean {
    return isSetup
}


function sendMessageV2(type: string, data: any) {
    if (!isSetup) return
    webSocketV2.next({
        type,
        sender: localUser.id,
        data
    })
}