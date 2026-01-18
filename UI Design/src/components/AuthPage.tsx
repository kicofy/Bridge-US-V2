import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { use3DHover } from '../hooks/use3DHover';

interface AuthPageProps {
  onAuthSuccess: (userData: { email: string; username: string }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password';

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate a random 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification code (simulated)
  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const code = generateVerificationCode();
      setGeneratedCode(code);
      setSuccess(`Verification code sent to ${email}! (Code: ${code})`);
      setIsLoading(false);

      if (currentView === 'register') {
        setCurrentView('verify-email');
      } else if (currentView === 'forgot-password') {
        setCurrentView('reset-password');
      }
    }, 1500);
  };

  // Handle registration
  const handleRegister = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    handleSendVerificationCode();
  };

  // Verify email code
  const handleVerifyEmail = () => {
    if (verificationCode !== generatedCode) {
      setError('Invalid verification code');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setSuccess('Email verified successfully! Welcome to BridgeUS!');
      setTimeout(() => {
        onAuthSuccess({ email, username });
      }, 1000);
    }, 500);
  };

  // Handle login
  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate login
    setTimeout(() => {
      setSuccess('Login successful! Welcome back!');
      setTimeout(() => {
        onAuthSuccess({ email, username: email.split('@')[0] });
      }, 1000);
    }, 1000);
  };

  // Handle password reset
  const handleResetPassword = () => {
    if (verificationCode !== generatedCode) {
      setError('Invalid verification code');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        setCurrentView('login');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setGeneratedCode('');
        setSuccess('');
      }, 1500);
    }, 1000);
  };

  // Render Login View
  const renderLogin = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">
          Sign in to continue your journey with BridgeUS
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentView('forgot-password');
            setError('');
            setSuccess('');
          }}
          className="text-sm text-[var(--bridge-blue)] hover:underline"
        >
          Forgot password?
        </button>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            onClick={() => {
              setCurrentView('register');
              setError('');
              setSuccess('');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );

  // Render Register View
  const renderRegister = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          Join BridgeUS
        </h1>
        <p className="text-muted-foreground">
          Create your account and connect with international students
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reg-password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            onClick={() => {
              setCurrentView('login');
              setError('');
              setSuccess('');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );

  // Render Verify Email View
  const renderVerifyEmail = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentView('register')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--bridge-blue)]/10 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-[var(--bridge-blue)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="h-14 rounded-xl text-center text-2xl tracking-widest"
          />
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleVerifyEmail}
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full h-12 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          <button
            onClick={handleSendVerificationCode}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );

  // Render Forgot Password View
  const renderForgotPassword = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentView('login')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          Reset Password
        </h1>
        <p className="text-muted-foreground">
          Enter your email to receive a verification code
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleSendVerificationCode}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            'Send Verification Code'
          )}
        </Button>
      </div>
    </div>
  );

  // Render Reset Password View
  const renderResetPassword = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentView('forgot-password')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          Create New Password
        </h1>
        <p className="text-muted-foreground">
          Enter the verification code sent to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-code">Verification Code</Label>
          <Input
            id="reset-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="h-12 rounded-xl text-center text-xl tracking-widest"
          />
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="new-password"
              type="password"
              placeholder="Create a new password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleResetPassword}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          <button
            onClick={() => {
              setCurrentView('forgot-password');
              setVerificationCode('');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bridge-blue)]/5 via-[var(--bridge-teal)]/5 to-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--bridge-blue)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--bridge-teal)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border shadow-lg mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-teal)] flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-teal)] bg-clip-text text-transparent">
              BridgeUS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted community for international students
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border bg-white/80 backdrop-blur-sm shadow-xl p-6 sm:p-8">
          {currentView === 'login' && renderLogin()}
          {currentView === 'register' && renderRegister()}
          {currentView === 'verify-email' && renderVerifyEmail()}
          {currentView === 'forgot-password' && renderForgotPassword()}
          {currentView === 'reset-password' && renderResetPassword()}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to BridgeUS's{' '}
            <a href="#" className="text-[var(--bridge-blue)] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[var(--bridge-blue)] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}