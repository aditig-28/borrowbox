import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const payload = {
        email: email.trim().toLowerCase(),
        password,
      };

      if (totpCode) {
        payload.totpCode = totpCode.trim();
      }

      const response = await API.post("/students/login", payload);

      // Scenario A: First-time MFA setup required
      if (response.data.requiresMfaSetup) {
        const setupToken = response.data.setupToken;
        localStorage.setItem("borrowbox_mfa_setup_token", setupToken);
        setNeedsSetup(true);

        // Automatically fetch QR code
        try {
          const setupRes = await API.post(
            "/students/mfa/setup",
            {},
            { headers: { Authorization: `Bearer ${setupToken}` } }
          );
          setSetupData(setupRes.data);
        } catch (setupErr) {
          setError(setupErr.response?.data?.message || "Failed to generate MFA setup code.");
        }
        return;
      }

      // Scenario B: TOTP required and verified successfully
      if (response.data.token) {
        login(response.data.token, response.data.student);
        navigate("/");
        return;
      }

      // Scenario C: Needs TOTP code
      setNeedsTotp(true);
    } catch (requestError) {
      const status = requestError.response?.status;
      const msg = requestError.response?.data?.message || "Login failed";

      // If backend says code required, prompt for code without error
      if (status === 400 && msg.toLowerCase().includes("authenticator code")) {
        setNeedsTotp(true);
      } else {
        setError(msg);
      }
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
      const setupToken = localStorage.getItem("borrowbox_mfa_setup_token");
      const response = await API.post(
        "/students/mfa/enable",
        { totpCode: totpCode.trim() },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );

      localStorage.removeItem("borrowbox_mfa_setup_token");
      login(response.data.token, response.data.student);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "MFA verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        {/* Brand Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs mb-3">
            B
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {needsSetup
              ? "Set Up Two-Factor Auth"
              : needsTotp
              ? "Enter Security Code"
              : "Sign in to BorrowBox"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {needsSetup
              ? "Scan the QR code with Google or Microsoft Authenticator"
              : needsTotp
              ? "Open your authenticator app and enter the 6-digit code"
              : "Enter your campus student credentials to continue"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form 1: Standard Password + TOTP Login */}
        {!needsSetup ? (
          <form onSubmit={submitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Email
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={needsTotp}
                required
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  needsTotp ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-white border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={needsTotp}
                required
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
                  needsTotp ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-white border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            {needsTotp && (
              <div className="pt-2 animate-in fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    6-Digit Authenticator Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNeedsTotp(false);
                      setTotpCode("");
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Change Account
                  </button>
                </div>
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
                  className="w-full bg-blue-50/50 border-2 border-blue-400 text-center tracking-widest text-2xl font-mono font-bold rounded-xl py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer text-sm mt-2"
            >
              {loading
                ? "Verifying..."
                : needsTotp
                ? "Verify & Sign In"
                : "Continue"}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              New to BorrowBox?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        ) : (
          /* Form 2: MFA Enrollment / Setup */
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
                    Manual Entry Key:
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800 break-all select-all mt-0.5">
                    {setupData.secret}
                  </p>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
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
                  {loading ? "Activating MFA..." : "Activate Two-Factor & Sign In"}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                <p>Generating authenticator QR key...</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
