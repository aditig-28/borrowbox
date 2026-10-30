import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, isAuthenticated, isSupervisor, updateUser } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students/me");
      setStudent(res.data);
      updateUser(res.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Failed to load profile details." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: "", text: "" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      // Update student profile via PUT /api/students/me
      const res = await API.put("/students/me", {
        name: student.name,
        phone: student.phone,
        department: student.department,
        year: Number(student.year),
      });

      setStudent(res.data);
      updateUser(res.data);
      setMessage({ type: "success", text: "Profile updated successfully! ✨" });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sign in to View Your Profile</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Please log in with your campus student credentials to access your profile and borrowing activity.
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-sm">Loading Student Profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-red-600 text-sm">Unable to load profile data.</p>
        <button
          onClick={fetchProfile}
          className="mt-4 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Student Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Campus account information, contact records, and security details.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-white text-blue-600 font-black text-3xl flex items-center justify-center shadow-md ring-4 ring-white/30 shrink-0">
            {student.name ? student.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                {student.role || "student"}
              </span>
            </div>
            <p className="text-blue-100 text-sm">{student.email}</p>
            <p className="text-blue-200 text-xs mt-1">
              Student ID: {student.studentId} • {student.department} (Year {student.year})
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
              <span>✓</span>
              <span>TOTP MFA Active</span>
            </span>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`m-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={student.name}
                onChange={handleChange}
                disabled={!editing}
                required
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  editing
                    ? "bg-white border-blue-400 ring-2 ring-blue-50 focus:outline-hidden"
                    : "bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Student ID <span className="text-slate-400 text-[10px]">(Campus Verified)</span>
              </label>
              <input
                name="studentId"
                type="text"
                value={student.studentId}
                disabled
                className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-slate-400 text-[10px]">(Campus Verified)</span>
              </label>
              <input
                name="email"
                type="email"
                value={student.email}
                disabled
                className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                value={student.phone || ""}
                onChange={handleChange}
                disabled={!editing}
                placeholder="e.g. 9876543210"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  editing
                    ? "bg-white border-blue-400 ring-2 ring-blue-50 focus:outline-hidden"
                    : "bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                name="department"
                type="text"
                value={student.department}
                onChange={handleChange}
                disabled={!editing}
                required
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  editing
                    ? "bg-white border-blue-400 ring-2 ring-blue-50 focus:outline-hidden"
                    : "bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year
              </label>
              <input
                name="year"
                type="number"
                min="1"
                max="6"
                value={student.year}
                onChange={handleChange}
                disabled={!editing}
                required
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  editing
                    ? "bg-white border-blue-400 ring-2 ring-blue-50 focus:outline-hidden"
                    : "bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            {editing ? (
              <>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
