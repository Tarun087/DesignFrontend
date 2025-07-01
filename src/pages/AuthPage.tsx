import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { Building2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await apiClient.post('/user/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userEmail', credentials.email);
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });
        if (credentials.email.includes('ar') || credentials.email.includes('requestor')) {
            navigate('/');
        } else {
            navigate('/recruiter');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.detail || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      console.log('Signing up with data:', {
        name: userData.name,
        email: userData.email,
        role: parseInt(userData.role, 10),
      });

      const response = await apiClient.post('/user/signup', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: parseInt(userData.role, 10),
      });

      console.log('Signup response:', response.data);

      toast({
        title: 'Signup Successful',
        description: 'Your account has been created. Please log in.',
      });
      setIsLogin(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'An error occurred during signup. Please try again.';
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Document Matcher</h1>
          <p className="text-gray-600">Match consultant profiles and job descriptions instantly with Agents</p>
        </div>

        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
