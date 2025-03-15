import {memo, useState} from "react"
import InputModal from "./InputModal.tsx";
import * as React from "react";

interface ModalFormBodyPropsIF {
    onClose: () => void
    onSubmit: (data:any) => void,
    initValue: any,
    formFields: {
        name: string
        title: string,
        focused?:boolean
        type: React.HTMLInputTypeAttribute
    }[]
}

function ModalFormBody({onClose, onSubmit, formFields, initValue}: ModalFormBodyPropsIF) {
    const [formObj, setLeadObj] = useState(initValue)


    const updateFormValue = (fieldName: string, value: any) => {
        setLeadObj({...formObj, [fieldName]: value})
    }

    return (
        <>
            {
                formFields.map((value, index) =>
                    <InputModal key={index}
                                type="text"
                                focused={value.focused}
                                defaultValue={initValue[value.name]}
                                fieldName={value.name}
                                containerStyle="mt-4"
                                labelTitle={value.title}
                                updateFormValue={updateFormValue}
                                labelStyle=""
                                placeholder=""
                    />
                )
            }

            <div className="modal-action">
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary px-6" onClick={() => onSubmit(formObj)}>Submit</button>
            </div>
        </>
    )
}

export default memo(ModalFormBody)