import {memo, useEffect, useState} from "react";
import {useAppSelector} from "../../redux/hooks.ts";
import "./style.css"

function FrontPageProgress() {
    const pageLoading = useAppSelector(state => state.app.pageLoading)
    const [state, setState] = useState({zIndexBase: 1})
    useEffect(() => {
        const maxZIndex = findMaxZIndex()
        if (!maxZIndex) return
        state.zIndexBase = maxZIndex
        setState({...state})
    }, []);
    if (!pageLoading) return <></>
    return (
        <>
            <div style={{
                backgroundColor: "rgba(0,0,0,0.21)"
            }}
                 className="flex items-center justify-center fixed -m-2 z-10 w-full h-full"
            >
                {/*<div className="card p-10 bg-base-200">*/}
                <div className="bg-base-200 p-4 rounded-[15px]">
                    <div className="text-center text-info">
                        <div>
                            {pageLoading?.message}
                        </div>
                        <span className="loading loading-spinner loading-xl"></span>
                    </div>
                </div>
            </div>

        </>
    )
}

const findMaxZIndex = () => {
    return Array.from(document.querySelectorAll('body *'))
        .map(a => parseFloat(window.getComputedStyle(a).zIndex))
        .filter(a => !isNaN(a))
        .sort()
        .pop();
}
export default memo(FrontPageProgress)