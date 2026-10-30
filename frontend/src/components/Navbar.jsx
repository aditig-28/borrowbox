import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/items", label: "Browse Items" },
    { to: "/listings", label: "My Listings" },
    { to: "/requests", label: "Requests" },
    { to: "/profile", label: "Profile" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600 hover:text-blue-700 transition">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-lg shadow-sm">
                B
              </span>
              <span>BorrowBox</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(link.to)
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/create-item"
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-blue-700 shadow-xs transition"
            >
              <span>+</span>
              <span>Add Item</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group p-1 rounded-lg hover:bg-slate-100 transition"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm ring-1 ring-blue-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600">
                      {user?.name}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        user?.role === "supervisor" || user?.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user?.role || "student"}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
