import {IoMdHome,IoIosLogIn} from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import {IoPeopleCircle} from "react-icons/io5";
import {LuUserRound} from "react-icons/lu";
import {Link, useNavigate} from "react-router"
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {setUser} from "../redux/app";
import {memo} from "react";
function Navigation() {
    const navigation = useNavigate()
    const appUser = useAppSelector(state => state.app.user)
    const dispatch = useAppDispatch()
    const onLogoutClick = () => {
        dispatch(setUser(undefined))
        navigation("/user/register")
    }
    const onRegisterClick = () => {
        navigation("/user/register")
    }
    return (
        <div className="navbar bg-base-100 shadow-sm sticky top-0  z-10 ">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M4 6h16M4 12h16M4 18h7"/>
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                            <Link to="/">
                                <IoMdHome size={25}/>Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/room">
                                <IoPeopleCircle size={25}/>Room
                            </Link>
                        </li>
                        <li>
                            <Link to="/user">
                                <LuUserRound size={25}/>User
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="navbar-center">
                <p className="text-xl">{ appUser ?appUser.name:"webrtc with golang & react"}</p>
            </div>
            <div className="navbar-end">
                {
                    appUser ?
                        <button className="btn btn-ghost justify-between" onClick={onLogoutClick}>
                            Log out<CiLogout size={25}/>
                        </button>

                        :
                        <button className="btn btn-ghost justify-between" onClick={onRegisterClick}>
                            Register<IoIosLogIn size={25}/>
                        </button>

                }

            </div>
        </div>
    )
}

export default memo(Navigation)