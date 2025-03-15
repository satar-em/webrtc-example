import {FormEvent, memo, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks.ts";
import {loginRequest} from "../../../redux/user";
import {setPageLoading, setUser} from "../../../redux/app";
import {useNavigate} from "react-router";

function Register() {
    const navigation = useNavigate()
    const [state, setState] = useState({loading: false, errorData: undefined as string | undefined})
    const dispatch = useAppDispatch()
    const nameRefInput = useRef<HTMLInputElement>(null)
    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        state.loading = true
        setState({...state})
        dispatch(setPageLoading({message: "please wait"}))
        setTimeout(() => {
            dispatch(loginRequest({
                data: {name: nameRefInput.current?.value},
                onStatus200: data => {
                    dispatch(setUser(data))
                    dispatch(setPageLoading(undefined))
                    navigation("/user")
                },
                onError: data => {
                    dispatch(setPageLoading(undefined))
                    if (data.response && data.response.data && data.response.data.error) {
                        state.errorData = data.response.data.error
                    } else {
                        state.errorData = "unknown error see log"
                        console.log(data)
                    }
                    state.loading = false
                    setState({...state})
                }
            }))
        }, 700)
    }

    const appUser = useAppSelector(state => state.app.user)
    useEffect(() => {
        if (appUser) {
            navigation("/user")
            return
        }
        setTimeout(()=>{
            nameRefInput.current?.focus()
        },350)
    }, [appUser]);
    return (
        <div className="card w-full p-6 bg-base-100 drop-shadow-xl flex h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="-mt-20 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Register<br/>
                </h2>
            </div>

            <div className="-mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={onFormSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                            Your Name
                        </label>
                        <div className="mt-2">
                            <input type="text" name="email" id="name" autoComplete="email" required ref={nameRefInput}
                                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"/>
                        </div>
                    </div>

                    <div>
                        <button disabled={state.loading} type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 disabled:bg-indigo-400 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {/*{
                                state.loading?
                                    <span className="loading loading-spinner"></span>
                                    :
                                    ""
                            }*/}
                            Sign in
                        </button>
                        {
                            state.errorData ?
                                <span className="flex w-full justify-center text-error">{state.errorData}</span>
                                :
                                ""
                        }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default memo(Register)