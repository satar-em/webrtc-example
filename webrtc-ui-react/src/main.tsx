import {createRoot} from 'react-dom/client'
import './style.css'
import {Provider} from 'react-redux'
import {BrowserRouter, Routes, Route} from "react-router";
import App from './App.tsx'
import Home from './pages/home/Home.tsx'
import Room from './pages/needCheck/room/Room.tsx'
import UserInfo from './pages/needCheck/user/UserInfo.tsx'
import Register from './pages/needCheck/user/Register.tsx'
import store from "./redux/store.ts";
import JoinRoom from "./pages/needCheck/room/JoinRoom.tsx";
import NotFoundPage from "./pages/404/NotFoundPage.tsx";
import NeedCheckPage from "./pages/needCheck/NeedCheckPage.tsx";

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route  path="/" element={<App/>}>
                    <Route element={<NeedCheckPage/>}>
                        <Route path="room">
                            <Route index element={<Room/>}/>
                            <Route path="join/:roomId" element={<JoinRoom/>}/>
                        </Route>
                        <Route path="user">
                            <Route index element={<UserInfo/>}/>
                            <Route path="register" element={<Register/>}/>
                        </Route>
                    </Route>
                    <Route index element={<Home/>}/>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </Provider>,
)
