import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { sendEmailCode, registerUser, loginUser, forgotPassword } from '../api/auth';
import { getMyProfile } from '../api/profile';
import { ApiError } from '../api/client';
import { useAuthStore } from '../store/auth';
import { useTranslation } from 'react-i18next';

interface AuthPageProps {
  initialView?: AuthView;
}

type AuthView = 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password';

export function AuthPage({ initialView = 'login' }: AuthPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setCurrentView(initialView);
    setError('');
    setSuccess('');
  }, [initialView]);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong. Please try again.';
  };

  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const purpose =
        currentView === 'register' || currentView === 'verify-email'
          ? 'register'
          : 'reset';
      const response = await sendEmailCode(email, purpose);
      const debugCode = response.code ? ` (Code: ${response.code})` : '';
      setSuccess(t('auth.codeSent', { email }) + debugCode);

      if (currentView === 'register') {
        setCurrentView('verify-email');
        navigate('/register');
      } else if (currentView === 'forgot-password') {
        setCurrentView('reset-password');
        navigate('/forgot-password');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (!username || username.length < 3) {
      setError(t('auth.usernameMin'));
      return;
    }
    if (!password || password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    setError('');
    await handleSendVerificationCode();
  };

  // Verify email code
  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError(t('auth.enterCode'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const tokens = await registerUser({
        email,
        password,
        display_name: username,
        code: verificationCode,
      });
      setTokens(tokens.access_token, tokens.refresh_token);
      setUser({ email, displayName: username });
      setSuccess(t('auth.emailVerified'));
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.enterEmailPassword'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const tokens = await loginUser({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);
      let displayName = email.split('@')[0];
      try {
        const profile = await getMyProfile();
        displayName = profile.display_name || displayName;
      } catch {
        // Fallback to email prefix if profile fetch fails
      }
      setUser({ email, displayName });
      setSuccess(t('auth.loginSuccess'));
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!verificationCode) {
      setError(t('auth.enterCode'));
      return;
    }
    if (!password || password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await forgotPassword({
        email,
        code: verificationCode,
        new_password: password,
      });
      setSuccess(t('auth.resetSuccess'));
      setTimeout(() => {
        setCurrentView('login');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setSuccess('');
        navigate('/login');
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Render Login View
  const renderLogin = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.signInSubtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
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
            navigate('/forgot-password');
          }}
          className="text-sm text-[var(--bridge-blue)] hover:underline"
        >
          {t('auth.forgotPassword')}
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
              {t('auth.signingIn')}
            </>
          ) : (
            t('actions.login')
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <button
            onClick={() => {
              setCurrentView('register');
              setError('');
              setSuccess('');
              navigate('/register');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            {t('actions.register')}
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
          {t('auth.joinBridgeus')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.createAccountSubtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">{t('auth.username')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder={t('auth.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reg-password"
              type="password"
              placeholder={t('auth.passwordCreatePlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
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
              {t('auth.creatingAccount')}
            </>
          ) : (
            t('actions.register')
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <button
            onClick={() => {
              setCurrentView('login');
              setError('');
              setSuccess('');
              navigate('/login');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            {t('actions.login')}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Verify Email View
  const renderVerifyEmail = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setCurrentView('register');
          navigate('/register');
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('actions.back')}
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--bridge-blue)]/10 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-[var(--bridge-blue)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          {t('auth.verifyEmail')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.codeSentTo')} <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">{t('auth.verificationCode')}</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder={t('auth.codePlaceholder')}
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
              {t('auth.verifying')}
            </>
          ) : (
            t('auth.verifyEmail')
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {t('auth.didNotReceive')}{' '}
          <button
            onClick={handleSendVerificationCode}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            {t('auth.resendCode')}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Forgot Password View
  const renderForgotPassword = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setCurrentView('login');
          navigate('/login');
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('auth.backToLogin')}
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          {t('auth.resetPassword')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.resetPasswordSubtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
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
              {t('auth.sendingCode')}
            </>
          ) : (
            t('auth.sendCode')
          )}
        </Button>
      </div>
    </div>
  );

  // Render Reset Password View
  const renderResetPassword = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setCurrentView('forgot-password');
          navigate('/forgot-password');
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('actions.back')}
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--bridge-blue)]">
          {t('auth.createNewPassword')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.enterCodeSentTo')} <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-code">{t('auth.verificationCode')}</Label>
          <Input
            id="reset-code"
            type="text"
            placeholder={t('auth.codePlaceholder')}
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
          <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="new-password"
              type="password"
            placeholder={t('auth.passwordCreatePlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">{t('auth.confirmNewPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type="password"
            placeholder={t('auth.confirmPasswordPlaceholder')}
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
              {t('auth.resettingPassword')}
            </>
          ) : (
            t('auth.resetPassword')
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {t('auth.didNotReceive')}{' '}
          <button
            onClick={() => {
              setCurrentView('forgot-password');
              setVerificationCode('');
              navigate('/forgot-password');
            }}
            className="text-[var(--bridge-blue)] font-medium hover:underline"
          >
            {t('auth.tryAgain')}
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
            {t('auth.brandSubtitle')}
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
            {t('auth.termsPrefix')}{' '}
            <a href="#" className="text-[var(--bridge-blue)] hover:underline">
              {t('auth.terms')}
            </a>{' '}
            {t('auth.and')}{' '}
            <a href="#" className="text-[var(--bridge-blue)] hover:underline">
              {t('auth.privacy')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}