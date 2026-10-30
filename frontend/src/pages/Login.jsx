import { useState } from "react";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setup, setSetup] = useState(null);
  const [error, setError] = useState("");

  const saveSession = (data) => {
    localStorage.setItem("borrowbox_token", data.token);
    window.location.assign("/");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await API.post("/students/login", {
        email,
        password,
        totpCode,
      });

      if (response.data.requiresMfaSetup) {
        localStorage.setItem("borrowbox_mfa_setup_token", response.data.setupToken);
        setNeedsSetup(true);
        return;
      }

      if (!totpCode) {
        setNeedsTotp(true);
      } else {
        saveSession(response.data);
      }
    } catch (requestError) {
      if (!needsTotp && requestError.response?.status === 400) {
        setNeedsTotp(true);
      }
      setError(requestError.response?.data?.message || "Login failed");
    }
  };

  const startSetup = async () => {
    setError("");
    try {
      const setupToken = localStorage.getItem("borrowbox_mfa_setup_token");
      const response = await API.post(
        "/students/mfa/setup",
        {},
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      setSetup(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not start MFA setup");
    }
  };

  const enableMfa = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const setupToken = localStorage.getItem("borrowbox_mfa_setup_token");
      const response = await API.post(
        "/students/mfa/enable",
        { totpCode },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      localStorage.removeItem("borrowbox_mfa_setup_token");
      saveSession(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "MFA setup failed");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Sign in to BorrowBox</h1>

        {!needsSetup ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="border p-3 rounded w-full"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="border p-3 rounded w-full"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {needsTotp && (
              <input
                className="border p-3 rounded w-full"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit authenticator code"
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value)}
                required
              />
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="bg-blue-600 text-white w-full p-3 rounded">
              {needsTotp ? "Verify and sign in" : "Continue"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!setup ? (
              <button onClick={startSetup} className="bg-blue-600 text-white w-full p-3 rounded">
                Set up authenticator
              </button>
            ) : (
              <>
                <img src={setup.qrCode} alt="TOTP QR code" className="mx-auto" />
                <p className="text-sm text-gray-600 break-all">
                  Manual secret: <strong>{setup.secret}</strong>
                </p>
                <form onSubmit={enableMfa} className="space-y-4">
                  <input
                    className="border p-3 rounded w-full"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit authenticator code"
                    value={totpCode}
                    onChange={(event) => setTotpCode(event.target.value)}
                    required
                  />
                  <button className="bg-green-600 text-white w-full p-3 rounded">
                    Enable MFA
                  </button>
                </form>
              </>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

export default Login;
