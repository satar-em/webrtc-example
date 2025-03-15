import {memo} from "react";

function ConfirmationModalBody({extraObject, onCloseModal, onYesModal}: {
    extraObject: any,
    onCloseModal: () => void,
    onYesModal: () => void
}) {

    const {message, type, id, index} = extraObject
    console.log({message, type, id, index})
    return (
        <>
            <p className=' text-xl mt-8 text-center'>
                {message}
            </p>

            <div className="modal-action mt-12">

                <button className="btn btn-outline" onClick={onCloseModal}>Cancel</button>

                <button className="btn btn-primary w-36" onClick={onYesModal}>Yes</button>

            </div>
        </>
    )
}

export default memo(ConfirmationModalBody)