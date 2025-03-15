import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export interface ModalIF {
    title?: string,
    isOpen?: boolean,
    bodyType?: "form" | "confirm",
    size?: string
    extraObject?: any,
}

let onCloseModal: (data: any) => void

const initialState: ModalIF = {}
const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<ModalIF>) => {
            const {title, bodyType, extraObject, size} = action.payload
            state.isOpen = true
            state.bodyType = bodyType
            state.title = title
            state.size = size || 'md'
            state.extraObject = extraObject
        },
        closeModal: (state, action: PayloadAction<any>) => {
            onCloseModal(action.payload)
            state.isOpen = false
            state.bodyType = undefined
            state.title = undefined
            state.extraObject = undefined
            onCloseModal = (_data) => {
            }
        },

    }
})

export const {openModal, closeModal} = modalSlice.actions

export const openCallBackModal = (args: ModalIF & { onCloseModal: (data: any) => void }) => {
    onCloseModal = args.onCloseModal
    return openModal({
        title: args.title,
        bodyType: args.bodyType,
        extraObject: args.extraObject,
        size: args.size,
    })
}

export const modalReducer = modalSlice.reducer