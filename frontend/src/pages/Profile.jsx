import { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/students/me");
      setStudent(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
        console.log(student);
      await API.put(`/students/${student._id}`, student);

      alert("Profile Updated Successfully");

      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  if (!student) {
    return (
      <div className="p-6">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-6">
          Student Profile
        </h1>

        <div className="space-y-4">

          <input
            name="name"
            value={student.name}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

          <input
            name="studentId"
            value={student.studentId}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

          <input
            name="email"
            value={student.email}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

          <input
            name="phone"
            value={student.phone || ""}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

          <input
            name="department"
            value={student.department}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

          <input
            name="year"
            value={student.year}
            onChange={handleChange}
            disabled={!editing}
            className="border p-3 rounded w-full"
          />

        </div>

        <div className="mt-6">

          {editing ? (
            <button
              onClick={saveProfile}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save Profile
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Edit Profile
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default Profile;