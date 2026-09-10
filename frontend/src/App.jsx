import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import BrowseItems from "./pages/BrowseItems";
import MyListings from "./pages/MyListings";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
// import Requests from "./pages/Requests";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/items" element={<BrowseItems />} />
        <Route path="/listings" element={<MyListings />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-item" element={<CreateItem />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import CreateItem from "./pages/CreateItem";