import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  studentId: "",
  name: "",
  phone: "",
  email: "",
  department: "",
  year: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [setupToken, setSetupToken] = useState("");
  const [setupData, setSetupData] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase(),
        year: Number(form.year),
      };

      const response = await API.post("/students/register", payload);
      const token = response.data.setupToken;
      localStorage.setItem("borrowbox_mfa_setup_token", token);
      setSetupToken(token);

      // Automatically fetch QR code for MFA setup
      const setupRes = await API.post(
        "/students/mfa/setup",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSetupData(setupRes.data);
    } catch (requestError) {
      console.error("Registration error:", requestError);
      setError(requestError.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    setError("");

    if (!totpCode || totpCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code from your authenticator app.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post(
        "/students/mfa/enable",
        { totpCode: totpCode.trim() },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );

      localStorage.removeItem("borrowbox_mfa_setup_token");
      login(response.data.token, response.data.student);
      navigate("/");
    } catch (requestError) {
      console.error("MFA enable error:", requestError);
      setError(requestError.response?.data?.message || "MFA verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs mb-3">
            B
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {!setupToken ? "Create a BorrowBox Account" : "Set Up Two-Factor Authentication"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {!setupToken
              ? "Join your campus peer-to-peer resource sharing community"
              : "Scan this QR code with Google Authenticator or Microsoft Authenticator"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        {!setupToken ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="studentId"
                  type="text"
                  placeholder="e.g. 25BCE1949"
                  value={form.studentId}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  name="department"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  name="year"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="e.g. 2"
                  value={form.year}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Min 8 characters"
                  minLength={8}
                  value={form.password}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer text-sm mt-3"
            >
              {loading ? "Registering Account..." : "Create Account & Setup MFA"}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleEnableMfa} className="space-y-4">
            {setupData ? (
              <div className="space-y-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto">
                  <img
                    src={setupData.qrCode}
                    alt="Authenticator QR code"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Manual Secret Key:
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800 break-all select-all mt-0.5">
                    {setupData.secret}
                  </p>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => {
                      setTotpCode(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 text-center tracking-widest text-xl font-mono font-bold rounded-xl py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer text-sm"
                >
                  {loading ? "Activating MFA..." : "Enable Two-Factor & Complete Registration"}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                <p>Configuring authenticator security...</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
