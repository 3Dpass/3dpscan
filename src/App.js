import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Account from "./pages/Account";
import Block from "./pages/Block";
import Blocks from "./pages/Blocks";
import Event from "./pages/Event";
import Events from "./pages/Events";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import Log from "./pages/Log";
import Object from "./pages/Object";
import Objects from "./pages/Objects";
import Tag from "./pages/Tag";
import { ToastContainer } from "react-toastify";
import TopHolders from "./pages/TopHolders";
import Transfer from "./pages/Transfer";
import Transfers from "./pages/Transfers";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";
import Bounty from "./pages/Bounty";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main-holder">
        <div className="main-inner">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blocks/:page" element={<Blocks />} />
            <Route path="/transfers/:page" element={<Transfers />} />
            <Route path="/events/:page" element={<Events />} />
            <Route path="/topholders" element={<TopHolders />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/block/:number" element={<Block />} />
            <Route path="/extrinsic/:number" element={<Transfer />} />
            <Route path="/event/:number" element={<Event />} />
            <Route path="/log/:number" element={<Log />} />
            <Route path="/account/:account" element={<Account />} />
            <Route path="/tag/:tag" element={<Tag />} />
            <Route path="/objects" element={<Objects />} />
            <Route path="/object/:number" element={<Object />} />
            <Route path="/assetdetails/:number" element={<AssetDetail />} />
            <Route path="/bountie" element={<Bounty />} />
          </Routes>
          <ToastContainer
            position="top-right"
            hideProgressBar={true}
            type="info"
            autoClose={2500}
          />
        </div>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
