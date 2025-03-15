import {memo, useEffect, useRef, useState} from "react"
import * as React from "react";

interface InputModalPropsIF {
    labelTitle: string,
    labelStyle: string,
    type: React.HTMLInputTypeAttribute,
    focused?:boolean
    containerStyle: string,
    defaultValue: any,
    placeholder: string,
    updateFormValue: (fieldName: string, value: any) => void,
    fieldName: string
}

function InputModal({
                        labelTitle,
                        labelStyle,
                        type,
                        containerStyle,
                        defaultValue,
                        placeholder,
                        updateFormValue,
                        fieldName,
                        focused
                    }: InputModalPropsIF) {

    const [value, setValue] = useState(defaultValue)
    const inputRef = useRef<HTMLInputElement>(null)
    const updateInputValue = (val: any) => {
        setValue(val)
        updateFormValue(fieldName, val)
    }
    useEffect(() => {
        if (focused){
            setTimeout(()=>{
                if (inputRef.current){
                    inputRef.current.focus()
                }
            },350)
        }

    }, []);

    return (
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
            </label>
            <input
                type={type}
                value={value}
                placeholder={placeholder || ""}
                onChange={(e) => updateInputValue(e.target.value)}
                className="input  input-bordered w-full "
                ref={inputRef}
            />
        </div>
    )
}


export default memo(InputModal)