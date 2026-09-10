import { useEffect, useState } from "react";
import API from "../services/api";

function MyListings() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await API.get("/items");
    setItems(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        My Listings
      </h1>

      {items.map((item) => (
        <div
          key={item._id} className="card"
        //   className="border p-4 mb-4 rounded"
        >
          <h2 className="text-xl font-semibold">
            {item.name}
          </h2>

          <p>{item.description}</p>

          <p>
            <strong>Status:</strong>{" "}
            {item.availabilityStatus}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MyListings;