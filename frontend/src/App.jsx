import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import BrowseItems from "./pages/BrowseItems";
import MyListings from "./pages/MyListings";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import CreateItem from "./pages/CreateItem";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<BrowseItems />} />
              <Route path="/listings" element={<MyListings />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-item" element={<CreateItem />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
