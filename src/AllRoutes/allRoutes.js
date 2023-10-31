import { Route, Routes } from "react-router-dom";
import Main from "../pages/main";
import Pages from "../pages/page";

export default function AllRoutes(){
    return (
        <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/pages/:id" element={<Pages/>}/>
        </Routes>
    )
}