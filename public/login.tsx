import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/context/AuthContext";
import ForgotPassword from "../../src/components/ForgotPassword";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Login successful!");
        
        // Use the auth context to store user data
        login(data.user);
        
        setTimeout(() => {
          // Redirect based on user role
          if (data.user.role === 'admin') {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch {
      setErrorMsg("Network error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="flex rounded-lg overflow-hidden shadow-lg w-full max-w-2xl">
        {/* Left Panel */}
        <div className="bg-yellow-400 w-1/2 p-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-black mb-2">Login</h2>
          <p className="text-black text-sm mb-4">
            Get access to your Orders, Wishlist and Recommendations.
          </p>
          <div className="bg-black bg-opacity-20 p-3 rounded text-xs">
            <p className="font-semibold mb-1">Admin Access:</p>
            <p>Email: admin@kapee.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white w-1/2 p-6 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Username/Email address
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Enter Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-8 bg-yellow-400 p-1 rounded text-sm"
              >
                👁
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-yellow-500 hover:underline"
              >
                Lost your password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded uppercase font-semibold"
            >
              Log In
            </button>

            {errorMsg && (
              <p className="text-red-500 text-center mt-2">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-green-600 text-center mt-2">{successMsg}</p>
            )}
          </form>

          {/* Close Button */}
          <button className="absolute top-2 right-2 text-black text-xl">
            ✕
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
