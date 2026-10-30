import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyListings() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsRes, reqRes] = await Promise.all([
        API.get("/items"),
        API.get("/requests").catch(() => ({ data: [] })),
      ]);

      const allItems = itemsRes.data || [];
      const allRequests = reqRes.data || [];

      // Filter only items belonging to the current user
      const myItems = allItems.filter(
        (item) => (item.owner?._id || item.owner) === user?._id
      );

      setItems(myItems);
      setRequests(allRequests);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Unable to load your listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get active requests count for an item
  const getPendingRequestsCount = (itemId) => {
    return requests.filter(
      (r) => (r.item?._id === itemId || r.item === itemId) && r.status === "Pending"
    ).length;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            📦
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sign in to View Your Listings</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You need to be logged in to view and manage the resources you have shared with the campus community.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableCount = items.filter((i) => i.availabilityStatus === "Available").length;
  const borrowedCount = items.filter((i) => i.availabilityStatus === "Borrowed").length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            My Listings
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage your shared campus resources, monitor their status, and track borrower requests.
          </p>
        </div>

        <Link
          to="/create-item"
          className="self-start md:self-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <span>+</span>
          <span>Add New Item</span>
        </Link>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Listed</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Available</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{availableCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Borrowed / In Use</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">{borrowedCount}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm">Loading your listings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchMyData}
            className="mt-3 text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
            📦
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Listings Yet</h2>
          <p className="text-sm text-slate-500 mt-2">
            You haven't listed any items on BorrowBox yet. Share books, notes, calculators, or lab equipment to help fellow students!
          </p>
          <Link
            to="/create-item"
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition"
          >
            <span>+</span>
            <span>Create Your First Listing</span>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const pendingRequests = getPendingRequestsCount(item._id);

            return (
              <article
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider mb-2">
                      {item.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 leading-snug">
                      {item.name}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.availabilityStatus === "Available"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.availabilityStatus === "Borrowed"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.availabilityStatus}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-3 min-h-12">
                    {item.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Condition:</span>
                      <span className="font-semibold text-slate-700">{item.condition}</span>
                    </div>

                    {item.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Location:</span>
                        <span className="font-semibold text-slate-700">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {pendingRequests > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">
                        🔔 {pendingRequests} pending {pendingRequests === 1 ? "request" : "requests"}
                      </span>
                      <Link
                        to="/requests"
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyListings;
