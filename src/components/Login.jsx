import React, { useState } from 'react';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/watchdog-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-md w-full space-y-8 bg-black/80 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <img src="/watchdog-logo.png" alt="Watch Dog" className="mx-auto w-24 h-24 mb-4" />
          <h2 className="text-4xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-blue-400">
            {isLogin ? 'Sign in to access Watch Dog' : 'Sign up for Watch Dog'}
          </p>
        </div>

        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default Login;