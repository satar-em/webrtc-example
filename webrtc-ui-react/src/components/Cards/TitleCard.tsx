import Subtitle from "../Typography/Subtitle"
import * as React from "react";
import {memo} from "react";


function TitleCard({title, children, topMargin, TopSideButtons,middleHeader}: {
    title?: string,
    middleHeader?: React.ReactNode,
    children: React.ReactNode,
    topMargin?:string,
    TopSideButtons?:React.ReactNode
}) {
    return (
        <div className={"card w-full p-6 bg-base-100 shadow-xl " + (topMargin || "mt-6")}>

            <Subtitle styleClass={TopSideButtons ? "flex justify-between" : ""}>
                <span>{title}</span>
                {
                    middleHeader && <div>{middleHeader}</div>
                }
                {
                    TopSideButtons && <div>{TopSideButtons}</div>
                }
            </Subtitle>

            <div className="divider mt-2"></div>

            <div className='h-full w-full pb-6 bg-base-100'>
                {children}
            </div>
        </div>

    )
}


export default memo(TitleCard)