import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, X } from "lucide-react"; // Importing the X icon

interface SignupFormProps {
  onSignup: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => void;
  onSwitchToLogin: () => void;
  onCancel: () => void; // Added onCancel prop
}

const SignupForm = ({
  onSignup,
  onSwitchToLogin,
  onCancel,
}: SignupFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!formData.role) {
      alert("Please select a role");
      return;
    }
    onSignup(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto relative">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <p className="text-gray-600">Create your account to get started</p>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition-colors duration-300"
          onClick={onCancel}
        >
          <X className="w-6 h-6" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Username or Email</Label>
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your username or email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Re-enter Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Recruiter</SelectItem>
                <SelectItem value="2">AR Requestor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
