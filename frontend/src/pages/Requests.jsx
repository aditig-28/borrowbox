import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Requests() {
  const { user, isAuthenticated, isSupervisor } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-requests"); // "my-requests" | "incoming-requests" | "supervisor-all"
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // If user is supervisor, set default tab to supervisor-all
  useEffect(() => {
    if (isSupervisor) {
      setActiveTab((prev) => (prev === "my-requests" ? "supervisor-all" : prev));
    }
  }, [isSupervisor]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests");
      setRequests(res.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      setActionLoading(id);
      setStatusMessage({ type: "", text: "" });
      await API.put(`/requests/${id}/accept`);
      setStatusMessage({ type: "success", text: "Request approved successfully! Item is marked as Borrowed." });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to accept request:", error);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to approve request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      setActionLoading(id);
      setStatusMessage({ type: "", text: "" });
      await API.put(`/requests/${id}/reject`);
      setStatusMessage({ type: "success", text: "Request declined." });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to decline request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnItem = async (id) => {
    try {
      setActionLoading(id);
      setStatusMessage({ type: "", text: "" });
      await API.put(`/requests/${id}/return`);
      setStatusMessage({ type: "success", text: "Item marked as Returned and restored to Available!" });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to return item:", error);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to mark item returned.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Declined</span>;
      case "Returned":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Returned</span>;
      case "Pending":
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending Review</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            📋
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sign in to View Borrow Requests</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You must be logged in to track requests you've submitted and manage requests for your items.
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

  // Filter requests by categories
  const myBorrowRequests = requests.filter(
    (r) => (r.borrower?._id || r.borrower) === user?._id
  );

  const incomingRequestsForMyItems = requests.filter(
    (r) => (r.item?.owner?._id || r.item?.owner) === user?._id
  );

  let displayedRequests = myBorrowRequests;
  if (activeTab === "incoming-requests") {
    displayedRequests = incomingRequestsForMyItems;
  } else if (activeTab === "supervisor-all") {
    displayedRequests = requests;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Borrow Requests
            </h1>
            {isSupervisor && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                🛡️ Supervisor Access
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Track requested resources, monitor approval status, and manage item returns.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        {isSupervisor && (
          <button
            onClick={() => setActiveTab("supervisor-all")}
            className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "supervisor-all"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-purple-600 hover:text-purple-800"
            }`}
          >
            <span>🛡️ Campus Management ({requests.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("incoming-requests")}
          className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "incoming-requests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Requests for My Items ({incomingRequestsForMyItems.length})
        </button>

        <button
          onClick={() => setActiveTab("my-requests")}
          className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "my-requests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          My Borrow Requests ({myBorrowRequests.length})
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage({ type: "", text: "" })}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm">Loading requests...</p>
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-3">
            📭
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {activeTab === "supervisor-all"
              ? "No campus borrow requests currently found"
              : activeTab === "incoming-requests"
              ? "No incoming requests for your items"
              : "You haven't requested any items yet"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {activeTab === "my-requests"
              ? "Browse available resources on campus and submit borrow requests."
              : activeTab === "incoming-requests"
              ? "When other students want to borrow your items, their requests will appear here for your approval."
              : "Campus borrow requests will appear here for supervisor oversight and decisions."}
          </p>
          {activeTab === "my-requests" && (
            <Link
              to="/items"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
            >
              Browse Available Items
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((request) => {
            const isBorrower = (request.borrower?._id || request.borrower) === user?._id;
            const isOwner = (request.item?.owner?._id || request.item?.owner) === user?._id;
            const canManage = isSupervisor || isOwner;

            return (
              <div
                key={request._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                        {request.item?.category || "Resource"}
                      </span>
                      <span className="text-xs text-slate-400">
                        Requested: {new Date(request.requestDate || request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                      {request.item?.name || "Shared Item"}
                    </h2>

                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-700">Lender/Owner:</span>{" "}
                        {isOwner ? "You (Owner)" : request.item?.owner?.name || "Campus Student"}
                        {!isOwner && request.item?.owner?.department ? ` (${request.item.owner.department})` : ""}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-700">Borrower:</span>{" "}
                        {isBorrower ? "You (Borrower)" : request.borrower?.name || "Student"}
                        {!isBorrower && request.borrower?.studentId ? ` (ID: ${request.borrower.studentId})` : ""}
                        {!isBorrower && request.borrower?.department ? ` - ${request.borrower.department}` : ""}
                      </p>

                      {request.status === "Accepted" && request.borrower?.phone && (
                        <p className="text-emerald-700 font-semibold">
                          📞 Borrower Phone: {request.borrower.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    {getStatusBadge(request.status)}
                    <span className="text-xs text-slate-500 font-medium">
                      Return by:{" "}
                      <strong className="text-slate-800">
                        {request.expectedReturnDate
                          ? new Date(request.expectedReturnDate).toLocaleDateString()
                          : "Not specified"}
                      </strong>
                    </span>
                    {request.actualReturnDate && (
                      <span className="text-[11px] text-slate-400">
                        Returned on: {new Date(request.actualReturnDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Guidance / Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {request.status === "Pending" && (
                      <span className="text-amber-700 font-medium">
                        {isSupervisor
                          ? "🛡️ Supervisor Action: Review this request to approve or decline."
                          : isOwner
                          ? "🔔 This student is waiting for your approval to borrow your item."
                          : "⏳ Request submitted. Waiting for approval before pickup."}
                      </span>
                    )}
                    {request.status === "Accepted" && (
                      <span className="text-emerald-700 font-medium">
                        {isSupervisor
                          ? "✓ Request approved. Item is currently in active student use."
                          : isOwner
                          ? "✓ You approved this request. Item is currently borrowed."
                          : "✓ Approved! Coordinate pickup at the lender's campus location."}
                      </span>
                    )}
                    {request.status === "Rejected" && (
                      <span className="text-red-700 font-medium">
                        ✕ This borrow request was declined.
                      </span>
                    )}
                    {request.status === "Returned" && (
                      <span className="text-blue-700 font-medium">
                        ✓ Resource has been returned and verified.
                      </span>
                    )}
                  </div>

                  {/* Actions for Owner or Supervisor */}
                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0">
                      {request.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={actionLoading === request._id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === request._id ? "Processing..." : "Approve Request"}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={actionLoading === request._id}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {request.status === "Accepted" && (
                        <button
                          onClick={() => handleReturnItem(request._id)}
                          disabled={actionLoading === request._id}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === request._id ? "Processing..." : "Mark as Returned"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Requests;
