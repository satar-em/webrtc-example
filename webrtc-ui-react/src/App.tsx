import Navigation from "./components/Navigation.tsx";
import {Outlet} from "react-router";
import FrontPageProgress from "./components/frontPageProgress/FrontPageProgress.tsx";
import {useAppDispatch} from "./redux/hooks.ts";
import {setDispatch,SubscribeStatusWebSocket} from "./tools/ws/EmaWebSoket.ts";
import {memo, useEffect, useState} from "react";
import * as axios from "axios";
import {setUser} from "./redux/app";
import ModalLayout from "./components/modal/ModalLayout.tsx";
import {ToastContainer} from "react-toastify";

function App() {
    const [state, setState] = useState({appInitialised: false})
    const dispatch = useAppDispatch()
    setDispatch(dispatch)
    useEffect(() => {
        const subscribeStatusWebSocket=SubscribeStatusWebSocket(_value => {
            //console.log("in Home=>",_value)
        })
        const localUserDataString = localStorage.getItem("localUserData")
        if (localUserDataString) {
            const localUserData = JSON.parse(localUserDataString)
            axios.default.get(
                "/api/get-user/" + localUserData.id,
            ).then(response => {
                if (response.status == 200) {
                    dispatch(setUser(localUserData))
                }
            }).catch(reason => {
                if (reason.status == 404) {
                    dispatch(setUser(undefined))
                }
            }).finally(() => {
                state.appInitialised = true
                setState({...state})
            })
        } else {
            state.appInitialised = true
            setState({...state})
        }
        return () => {
            subscribeStatusWebSocket.unsubscribe()
            //console.log("*logem exiting app")
        }
    }, [])


    return (
        <div className="flex flex-col h-dvh">
            {
                state.appInitialised ?
                    <>
                        <Navigation/>
                        <div className="overflow-y-auto  p-2 bg-base-200 flex-auto">
                            <FrontPageProgress/>
                            <Outlet/>
                        </div>
                        <ModalLayout/>
                        <ToastContainer/>
                    </>
                    :
                    ""
            }
        </div>
    )
}

export default memo(App)
