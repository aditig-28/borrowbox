import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BorrowBox
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            to="/items"
            className="text-gray-700 hover:text-blue-600"
          >
            Browse Items
          </Link>

          <Link
            to="/listings"
            className="text-gray-700 hover:text-blue-600"
          >
            My Listings
          </Link>

          <Link
            to="/requests"
            className="text-gray-700 hover:text-blue-600"
          >
            Requests
          </Link>

          <Link
            to="/profile"
            className="text-gray-700 hover:text-blue-600"
          >
            Profile
          </Link>

          <Link
            to="/create-item"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Item
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;