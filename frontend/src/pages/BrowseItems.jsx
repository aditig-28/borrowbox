import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function BrowseItems() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Request modal state
  const [modalItem, setModalItem] = useState(null);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const categories = [
    "All",
    "Academic",
    "Books",
    "Electronics",
    "Lab Equipment",
    "Sports",
    "Accessories",
    "Other",
  ];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, requestsRes] = await Promise.all([
        API.get("/items"),
        API.get("/requests").catch(() => ({ data: [] })),
      ]);

      setItems(itemsRes.data || []);
      setUserRequests(requestsRes.data || []);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (item) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setFeedback({ type: "", message: "" });
    // Default return date is 7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpectedReturnDate(nextWeek.toISOString().split("T")[0]);
    setModalItem(item);
  };

  const closeRequestModal = () => {
    setModalItem(null);
    setExpectedReturnDate("");
    setFeedback({ type: "", message: "" });
  };

  const handleConfirmRequest = async (e) => {
    e.preventDefault();
    if (!modalItem || !user) return;

    if (!expectedReturnDate) {
      setFeedback({ type: "error", message: "Please select an expected return date." });
      return;
    }

    const selectedDate = new Date(expectedReturnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      setFeedback({ type: "error", message: "Expected return date must be in the future." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });

      const res = await API.post("/requests", {
        borrower: user._id,
        item: modalItem._id,
        expectedReturnDate: expectedReturnDate,
      });

      // Add newly created request to userRequests state
      setUserRequests((prev) => [...prev, res.data]);

      setFeedback({
        type: "success",
        message: `Request for "${modalItem.name}" submitted successfully! Track it in the Requests tab.`,
      });

      // Close modal after short delay
      setTimeout(() => {
        closeRequestModal();
      }, 1800);
    } catch (error) {
      console.error("Failed to send request:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to submit request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user already has a pending/active request for an item
  const hasPendingRequest = (itemId) => {
    if (!user) return false;
    return userRequests.some(
      (r) =>
        (r.item?._id === itemId || r.item === itemId) &&
        (r.borrower?._id === user._id || r.borrower === user._id) &&
        (r.status === "Pending" || r.status === "Accepted")
    );
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All"
        ? true
        : selectedStatus === "Available"
        ? item.availabilityStatus === "Available"
        : item.availabilityStatus !== "Available";

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Browse Items
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Discover and borrow books, electronics, and equipment shared by campus students.
          </p>
        </div>

        <Link
          to="/create-item"
          className="self-start md:self-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <span>+</span>
          <span>List an Item</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, description, category, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-sm font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Availability:
          </span>
          {["All", "Available", "Borrowed"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedStatus === st
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm">Loading available resources...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mb-3">
            🔍
          </div>
          <h2 className="text-lg font-bold text-slate-800">No items match your criteria</h2>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your search terms or clearing selected category filters.
          </p>
          {(search || selectedCategory !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedStatus("All");
              }}
              className="mt-4 text-sm font-medium text-blue-600 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOwner = user && (item.owner?._id === user._id || item.owner === user._id);
            const isAvailable = item.availabilityStatus === "Available";
            const isPending = hasPendingRequest(item._id);

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
              >
                {/* Header & Badges */}
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
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.availabilityStatus === "Borrowed"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.availabilityStatus}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed min-h-12 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Condition:</span>
                      <span className="font-semibold text-slate-700">{item.condition}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Owner:</span>
                      <span className="font-semibold text-slate-700">
                        {item.owner?.name || "Campus Student"}
                        {item.owner?.department ? ` (${item.owner.department})` : ""}
                      </span>
                    </div>

                    {item.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Location:</span>
                        <span className="font-semibold text-slate-700">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => openRequestModal(item)}
                        className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-sm font-semibold py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
                      >
                        Sign in to Borrow
                      </button>
                    ) : isOwner ? (
                      <button
                        disabled
                        className="w-full bg-slate-50 text-slate-400 text-sm font-medium py-2.5 rounded-xl border border-slate-200 cursor-not-allowed"
                      >
                        Your Listing
                      </button>
                    ) : isPending ? (
                      <button
                        disabled
                        className="w-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>Request Pending</span>
                      </button>
                    ) : isAvailable ? (
                      <button
                        onClick={() => openRequestModal(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Request Item
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 text-sm font-medium py-2.5 rounded-xl cursor-not-allowed"
                      >
                        Currently {item.availabilityStatus}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Request Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Request Item</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm borrowing details for this resource
                </p>
              </div>
              <button
                onClick={closeRequestModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                <p className="font-bold text-slate-800">{modalItem.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Owner: {modalItem.owner?.name} ({modalItem.owner?.department || "Campus"})
                </p>
                {modalItem.location && (
                  <p className="text-xs text-slate-500">Pickup: {modalItem.location}</p>
                )}
              </div>

              <form onSubmit={handleConfirmRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expected Return Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={tomorrowStr}
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Please return the resource on or before this date.
                  </p>
                </div>

                {feedback.message && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeRequestModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Confirm Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseItems;
