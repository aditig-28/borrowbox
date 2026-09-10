import { useEffect, useState } from "react";
import API from "../services/api";

function CreateItem() {
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    condition: "",
    location: "",
    owner: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/items", form);

      alert("Item Created Successfully");

      setForm({
        name: "",
        description: "",
        category: "",
        condition: "",
        location: "",
        owner: "",
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Failed to create item");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          Add New Item
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Item Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select Category</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Academic">Academic</option>
            <option value="Lab Equipment">Lab Equipment</option>
            <option value="Sports">Sports</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="condition"
            placeholder="Condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="owner"
            value={form.owner}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select Owner</option>

            {students.map((student) => (
              <option
                key={student._id}
                value={student._id}
              >
                {student.name} ({student.studentId})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Create Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateItem;