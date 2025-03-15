import {memo} from "react";
import TitleCard from "../../components/Cards/TitleCard.tsx";

function NotFoundPage() {
    return (
        <>
            <TitleCard title="not found"  topMargin="mt-2">

                <div className="bg-red-100 flex justify-center rounded-lg">
                    Page Not Found
                </div>
            </TitleCard>
        </>
    )
}

export default memo(NotFoundPage)
