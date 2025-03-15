import {handleRequestApi} from "../api/requestApi.ts";

export const loginRequest = (
    {data, onStatus200, onError}: {
        data: any,
        onStatus200?: (data: any) => void,
        onError?: (data: any) => void
    }
) => handleRequestApi({
    path: "/api/register-user",
    method: "post",
    data,
    onStatus200,
    onError
})


