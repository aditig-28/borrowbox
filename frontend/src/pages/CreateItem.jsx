import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function CreateItem() {
  const { user, isAuthenticated, isSupervisor } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    condition: "Good",
    location: "",
    owner: "",
  });

  const categories = [
    "Books",
    "Electronics",
    "Academic",
    "Lab Equipment",
    "Sports",
    "Accessories",
    "Other",
  ];

  const conditions = ["Brand New", "Like New", "Good", "Fair", "Used"];

  // Initialize owner to current user
  useEffect(() => {
    if (user?._id) {
      setForm((prev) => ({
        ...prev,
        owner: prev.owner || user._id,
      }));
    }
  }, [user]);

  // If supervisor, fetch all students so they can optionally assign to someone else
  useEffect(() => {
    if (isSupervisor) {
      const fetchStudents = async () => {
        try {
          setLoadingStudents(true);
          const res = await API.get("/students");
          setStudents(res.data || []);
        } catch (err) {
          console.error("Could not fetch students list:", err);
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [isSupervisor]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const ownerId = form.owner || user?._id;
    if (!ownerId) {
      setError("Please sign in or select an item owner.");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !form.category) {
      setError("Please fill in all required fields (Name, Category, Description).");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/items", {
        ...form,
        owner: ownerId,
      });

      setSuccess(true);
      setForm({
        name: "",
        description: "",
        category: "",
        condition: "Good",
        location: "",
        owner: user?._id || "",
      });
    } catch (err) {
      console.error("Create item error:", err);
      setError(
        err.response?.data?.message || "Failed to create item. Please check your inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sign in to Add an Item</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You must be logged into your campus account to list items for other students to borrow.
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

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Add New Resource
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Share academic materials, calculators, or electronics with campus peers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
            <div>
              <p className="font-bold text-sm">Item Listed Successfully! 🎉</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your item is now live and visible to students on the Browse Items page.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to="/listings"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  View in My Listings
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs font-medium text-emerald-800 hover:underline"
                >
                  Add Another Item
                </button>
              </div>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="text-emerald-500 hover:text-emerald-700 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Casio fx-991EX Scientific Calculator"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Category & Condition in Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe condition, included accessories, guidelines for handling..."
              value={form.description}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pickup Location
            </label>
            <input
              name="location"
              type="text"
              placeholder="e.g. VIT Chennai Hostel Block B / Central Library"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Owner Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Listing Owner
            </label>

            {isSupervisor && students.length > 0 ? (
              <select
                name="owner"
                value={form.owner}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value={user?._id}>Myself ({user?.name})</option>
                {students
                  .filter((s) => s._id !== user?._id)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId} - {s.department})
                    </option>
                  ))}
              </select>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">
                    ID: {user?.studentId} • {user?.department} (Year {user?.year})
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                  Active User
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer text-sm"
            >
              {submitting ? "Publishing Resource..." : "Publish Item Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateItem;
