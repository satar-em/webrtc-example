import {Outlet, useLocation, useNavigate} from "react-router";
import {memo, useEffect, useState} from "react";

function NeedCheckPage() {
    const [state, setState] = useState({isChecked: false})
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        const localUserDataString = localStorage.getItem("localUserData")
        if (!localUserDataString&&location.pathname !== "/user/register") {
            navigate("/user/register");
            return;
        }
        setState({isChecked: true})

        return () => {

        }
    }, [location.pathname])
    return (state.isChecked ?
        <Outlet/>
        :
        "")
}

export default memo(NeedCheckPage);