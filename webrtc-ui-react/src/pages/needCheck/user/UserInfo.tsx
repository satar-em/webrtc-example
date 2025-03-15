import {memo, useEffect, useState} from "react";
import {useNavigate} from "react-router";
//import {useAppDispatch} from "../../redux/hooks.ts";
import {useAppSelector} from "../../../redux/hooks.ts";
import TitleCard from "../../../components/Cards/TitleCard.tsx";
import * as React from "react";

function UserInfo() {
    const [state, setState] = useState<any>({name: "", email: ""})
    const navigation = useNavigate()
    const appUser = useAppSelector(state => state.app.user)
    useEffect(() => {
        if (!appUser) {
            navigation("/user/register")
        }
    }, [appUser]);
    //const dispatch = useAppDispatch()

    const updateProfile = () => {
        console.log("update profile")
        /*toast("not implemented yes", {
            type: "warning",
            autoClose: 3000,
            position: "bottom-right"
        })*/
        console.log(state)
    }

    const updateFormValue = (fieldName: string, value: any) => {
        state[fieldName] = value
        setState({...state})
    }

    return (
        <>

            <TitleCard title={`Profile Settings (id=${appUser?.id})`} topMargin="mt-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText
                        labelTitle="Name"
                        defaultValue={appUser?.name}
                        updateFormValue={updateFormValue}
                        placeholder={"Alex"}
                        fieldName={"name"}
                    />
                    <InputText
                        labelTitle="Email"
                        defaultValue=""
                        updateFormValue={updateFormValue}
                        placeholder={"alex@dashwind.com"}
                        type="email"
                        fieldName={"email"}
                    />

                </div>
                <div className="divider"></div>


                <div className="mt-16">
                    <button className="btn btn-primary float-right" onClick={() => updateProfile()}>Update</button>
                </div>
            </TitleCard>
        </>
    )
}

export default memo(UserInfo)

interface InputTextPropsIF {
    labelTitle: string,
    labelStyle?: string,
    type?: React.HTMLInputTypeAttribute,
    containerStyle?: string,
    defaultValue: any,
    placeholder?: string,
    updateFormValue: (fieldName: string, value: any) => void,
    fieldName: string
}

function InputText({
                       labelTitle,
                       labelStyle,
                       type,
                       containerStyle,
                       defaultValue,
                       placeholder,
                       updateFormValue,
                       fieldName
                   }: InputTextPropsIF
) {

    const [value, setValue] = useState(defaultValue)

    const updateInputValue = (val: any) => {
        setValue(val)
        updateFormValue(fieldName, val)
    }

    return (
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
            </label>
            <input type={type || "text"} value={value} placeholder={placeholder || ""}
                   onChange={(e) => updateInputValue(e.target.value)} className="input input-bordered w-full "/>
        </div>
    )
}