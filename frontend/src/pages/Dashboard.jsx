import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const itemsRes = await API.get("/items");
      const requestsRes = await API.get("/requests");

      setItems(itemsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const availableItems = items.filter(
    (item) => item.availabilityStatus === "Available"
  ).length;

  const borrowedItems = items.filter(
    (item) => item.availabilityStatus === "Borrowed"
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          BorrowBox Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Campus resource sharing platform
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">
            Total Items
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {items.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">
            Available
          </p>

          <h2 className="text-4xl font-bold mt-2 text-green-600">
            {availableItems}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">
            Borrowed
          </p>

          <h2 className="text-4xl font-bold mt-2 text-orange-500">
            {borrowedItems}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">
            Requests
          </p>

          <h2 className="text-4xl font-bold mt-2 text-blue-600">
            {requests.length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Recent Items
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-500">
            No items available.
          </p>
        ) : (
          <div className="space-y-4">
            {items.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.category}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.availabilityStatus === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.availabilityStatus}
                  </span>
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