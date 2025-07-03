import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { Building2 } from "lucide-react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  id: number;
  role: string;
  exp: number;
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (credentials) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const response = await apiClient.post("/user/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("userEmail", credentials.email);
        // Decode JWT to get user role
        const decoded = jwtDecode(response.data.access_token) as DecodedToken;
        const userRole = parseInt(decoded.role);
        localStorage.setItem("userRole", userRole.toString());
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        // Route based on role
        if (userRole === 1) {
          navigate("/recruiter");
        } else if (userRole === 2) {
          navigate("/ar-dashboard");
        } else {
          navigate("/"); // fallback
        }
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error.response?.data?.detail ||
          "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    }
  };

  const handleSignup = async (userData) => {
    try {
      const response = await apiClient.post("/user/user_details", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: parseInt(userData.role, 10),
      });

      toast({
        title: "Signup Successful",
        description: "Your account has been created. Please log in.",
      });
      setIsLogin(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred during signup. Please try again.";
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Signup error:", error);
    }
  };

  const handleOutsideClick = () => {
    setShowModal(false);
    navigate("/auth");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-200 via-white to-green-200"
      onClick={handleOutsideClick}
    >
      {/* Header */}
      <header className="w-full p-4 bg-white shadow-md flex justify-between items-center border border-gray-300 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-300">
          Smart Document Matcher
        </h1>
        <nav>
          <button
            className="mr-4 text-blue-700 hover:text-green-700 transition-colors duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Login
          </button>
          <button
            className="text-blue-700 hover:text-green-700 transition-colors duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setIsLogin(false);
              setShowModal(true);
            }}
          >
            Signup
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="text-center max-w-md mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-700 rounded-xl mx-auto mb-6 shadow-md animate-bounce">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Smart Document Matcher
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Streamline your hiring process with AI agents that intelligently
            match consultant profiles with job descriptions.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md transform transition-transform hover:scale-105 hover:bg-blue-200 border border-gray-300 hover:border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create Job Descriptions
            </h3>
            <p className="text-gray-700">
              Recruiters can create and manage job descriptions easily.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md transform transition-transform hover:scale-105 hover:bg-blue-200 border border-gray-300 hover:border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Match Consultants
            </h3>
            <p className="text-gray-700">
              AR teams can match consultants to the right roles efficiently.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md transform transition-transform hover:scale-105 hover:bg-blue-200 border border-gray-300 hover:border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Review Matches
            </h3>
            <p className="text-gray-700">
              Requestors can review and filter candidate matches seamlessly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 bg-white shadow-md flex justify-between items-center border border-gray-300 rounded-lg">
        <div>
          <a
            href="#"
            className="text-blue-700 mr-4 hover:text-green-700 transition-colors duration-300"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-blue-700 hover:text-green-700 transition-colors duration-300"
          >
            Terms of Service
          </a>
        </div>
        <div>
          <p className="text-gray-700">
            Contact: support@smartmatcher.com | +91603504486
          </p>
        </div>
      </footer>

      {/* Modal for Login/Signup */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-300 hover:border-blue-500">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition-colors duration-300"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
            {isLogin ? (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToSignup={() => setIsLogin(false)}
                onCancel={() => setShowModal(false)}
              />
            ) : (
              <SignupForm
                onSignup={handleSignup}
                onSwitchToLogin={() => setIsLogin(true)}
                onCancel={() => setShowModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
