import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, requestsRes] = await Promise.all([
        API.get("/items"),
        API.get("/requests").catch(() => ({ data: [] })),
      ]);

      setItems(itemsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableItems = items.filter(
    (item) => item.availabilityStatus === "Available"
  ).length;

  const borrowedItems = items.filter(
    (item) => item.availabilityStatus === "Borrowed"
  ).length;

  const myItemsCount = isAuthenticated && user
    ? items.filter((item) => (item.owner?._id || item.owner) === user._id).length
    : 0;

  const myRequestsCount = isAuthenticated && user
    ? requests.filter((r) => (r.borrower?._id || r.borrower) === user._id).length
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-md mb-8">
        <div className="max-w-2xl">
          <span className="bg-white/20 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
            Campus Resource Sharing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">
            {isAuthenticated && user ? `Welcome back, ${user.name.split(" ")[0]}!` : "Welcome to BorrowBox!"}
          </h1>
          <p className="mt-3 text-blue-100 text-sm sm:text-base leading-relaxed">
            Lend and borrow textbooks, calculators, electronics, lab equipment, and academic essentials within your campus community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/items"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              Browse Catalog →
            </Link>
            <Link
              to="/create-item"
              className="bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-xs transition"
            >
              + List an Item
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Items</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-2">
            {loading ? "..." : items.length}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Listed across campus</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Available Now</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2">
            {loading ? "..." : availableItems}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Ready for borrowing</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Currently Borrowed</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-600 mt-2">
            {loading ? "..." : borrowedItems}
          </h2>
          <p className="text-xs text-slate-500 mt-1">In active student use</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total Requests</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mt-2">
            {loading ? "..." : requests.length}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAuthenticated ? `${myRequestsCount} submitted by you` : "Peer requests made"}
          </p>
        </div>
      </div>

      {/* User Quick Overview (if logged in) */}
      {isAuthenticated && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Your Campus Activity Summary</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              You have <strong>{myItemsCount}</strong> shared {myItemsCount === 1 ? "item" : "items"} and <strong>{myRequestsCount}</strong> active {myRequestsCount === 1 ? "request" : "requests"}.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/listings"
              className="text-xs font-semibold bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl transition"
            >
              My Listings ({myItemsCount})
            </Link>
            <Link
              to="/requests"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition"
            >
              My Requests ({myRequestsCount})
            </Link>
          </div>
        </div>
      )}

      {/* Recent Resources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Recently Shared Resources</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fresh items added by students</p>
          </div>

          <Link
            to="/items"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All ({items.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Loading recent items...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No items available yet. Be the first to list one!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.availabilityStatus === "Available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.availabilityStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.location || "Campus"}</span>
                  <Link
                    to="/items"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
