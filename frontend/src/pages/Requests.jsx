import { useEffect, useState } from "react";
import API from "../services/api";

function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptRequest = async (id) => {
    try {
      await API.put(`/requests/${id}/accept`);
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await API.put(`/requests/${id}/reject`);
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const returnItem = async (id) => {
    try {
      await API.put(`/requests/${id}/return`);
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Returned":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Borrow Requests
        </h1>

        <p className="text-gray-500 mt-2">
          Track and manage borrowing activity
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-semibold">
            No Requests Found
          </h2>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {request.item?.name || "Item"}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Borrower:{" "}
                    {request.status === "Pending"
                      ? "Hidden until approved"
                      : request.borrower?.name}
                  </p>

                  {request.status === "Accepted" &&
                    request.borrower?.phone && (
                      <p className="text-gray-500">
                        Phone: {request.borrower.phone}
                      </p>
                    )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Request ID: {request._id}
                </p>

                <p>
                  Expected Return:
                  {" "}
                  {request.expectedReturnDate
                    ? new Date(
                        request.expectedReturnDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {request.status === "Pending" && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() =>
                      acceptRequest(request._id)
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      rejectRequest(request._id)
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status === "Accepted" && (
                <div className="mt-5">
                  <button
                    onClick={() =>
                      returnItem(request._id)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Mark Returned
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;