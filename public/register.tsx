import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500); // Wait 1.5 seconds to show success message
      } else {
        setErrorMsg(data.error || "Registration failed");
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
          <h2 className="text-3xl font-bold text-black mb-2">Register</h2>
          <p className="text-black text-sm">
            Create your account to track orders, save favorites, and get personalized recommendations.
          </p>
        </div>

        {/* Right Panel */}
        <div className="bg-white w-1/2 p-6 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full p-2 border border-gray-300 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 bg-yellow-400 p-1 rounded text-sm"
              >
                👁
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="/login" className="text-yellow-500 hover:underline">
                Already have an account?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded uppercase font-semibold"
            >
              Register
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
    </div>
  );
};

export default Register;
