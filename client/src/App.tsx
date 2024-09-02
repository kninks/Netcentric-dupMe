import {BrowserRouter, Route, Routes} from "react-router-dom";
import "./App.css";

import Room from "./pages/Room/Room";
import Home from "./pages/Home/Home";
// import HowToPlay from "./components/HowToPlay";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import SupportUs from "./pages/SupportUs/SupportUs";
import HowToPlay from "./pages/HowToPlay/HowToPlay";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <div className="tab">DupMe</div>
                <div className="page">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/room" element={<Room/>}/>
                        <Route path="/how-to-play" element={<HowToPlay/>}/>
                        <Route path="/chat" element={<ChatRoom/>}/>
                        <Route path="/support-us" element={<SupportUs/>}/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
