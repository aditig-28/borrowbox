import { useEffect, useState } from "react";
import API from "../services/api";

function BrowseItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await API.get("/items");
      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const requestItem = async (itemId) => {
    try {
      await API.post("/requests", {
        borrower: "6aa041444da4eba34e04eec8",
        item: itemId,
        expectedReturnDate: "2026-09-20",
      });

      alert("Request Sent Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to send request");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Browse Items
        </h1>

        <p className="text-gray-500 mt-2">
          Discover resources shared by students
        </p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border rounded-xl p-4 shadow-sm"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-semibold">
            No items found
          </h2>
          <p className="text-gray-500 mt-2">
            Try another search term.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                  {item.name}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.availabilityStatus === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {item.availabilityStatus}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {item.description}
              </p>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">
                    Category:
                  </span>{" "}
                  {item.category}
                </p>

                <p>
                  <span className="font-semibold">
                    Condition:
                  </span>{" "}
                  {item.condition}
                </p>

                <p>
                  <span className="font-semibold">
                    Owner:
                  </span>{" "}
                  {item.owner?.name}
                </p>

                <p>
                  <span className="font-semibold">
                    Location:
                  </span>{" "}
                  {item.location}
                </p>
              </div>

              <button
                onClick={() => requestItem(item._id)}
                className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Request Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseItems;