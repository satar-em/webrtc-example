import {useAppSelector, useAppDispatch} from "../../redux/hooks.ts";
import {closeModal} from "../../redux/modal";
import ConfirmationModalBody from "./ConfirmationModalBody.tsx";
import ModalFormBody from "./ModalFormBody.tsx";
import {memo} from "react";


function ModalLayout() {
    const {isOpen, bodyType, size, extraObject, title} = useAppSelector(state => state.modal)
    const dispatch = useAppDispatch()
    const onClose = () => {
        dispatch(closeModal({}))
    }
    const onYes = () => {
        dispatch(closeModal({}))
    }
    const onSubmitModalForm = (data: any) => {
        dispatch(closeModal(data))
    }

    return (
        <>
            <div className={`modal ${isOpen ? "modal-open" : ""}`}>
                <div className={`modal-box  ${size === 'lg' ? 'max-w-5xl' : ''}`}>
                    <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>✕</button>
                    <h3 className="font-semibold text-2xl pb-6 text-center">{title}</h3>
                    {
                        {
                            ["form"]:
                                <ModalFormBody
                                    onClose={onClose}
                                    onSubmit={onSubmitModalForm}
                                    initValue={{name: ""}}
                                    formFields={[{name: "name", title: "Name Of Room", type: "text",focused:true}]}
                                />,
                            ["confirm"]:
                                <ConfirmationModalBody
                                    extraObject={extraObject}
                                    onCloseModal={onClose}
                                    onYesModal={onYes}
                                />,
                        }[bodyType!]
                    }
                </div>
            </div>
        </>
    )
}

export default memo(ModalLayout)