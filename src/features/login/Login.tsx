'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from 'antd';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import heroBg from '@/assets/hero-CoiAJZs0.jpg';
import inventxLogoWhite from '@/assets/inventx-logo-white.png';
import { EMPLOYEE, ORGANISER } from '@/lib/data/role';
import { notify } from '@/lib/utils/notification';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { loginUser, registerUser, type LoginResponse } from './services/authApi';
import styles from './Login.module.css';

export interface LoginProps {
  initialMode?: 'signin' | 'register';
}

export const Login: React.FC<LoginProps> = ({ initialMode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [mode, setMode] = useState<'signin' | 'register'>(
    initialMode || (pathname === '/register' ? 'register' : 'signin')
  );

  useEffect(() => {
    if (pathname === '/register') {
      setMode('register');
    } else if (pathname === '/login') {
      setMode('signin');
    }
  }, [pathname]);

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const switchMode = (newMode: 'signin' | 'register') => {
    setMode(newMode);
    router.push(newMode === 'register' ? '/register' : '/login', { scroll: false });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      notify.warning('Please enter your work email');
      return;
    }
    if (!password.trim()) {
      notify.warning('Please enter your password');
      return;
    }

    setSubmitting(true);
    dispatch(loginStart());

    try {
      const res: LoginResponse = await loginUser({
        email: email.trim(),
        password: password.trim(),
      });

      if (res?.accessToken && res?.user) {
        // 1. Store auth credentials in Cookies
        Cookies.set('accessToken', res.accessToken, { expires: 7 });
        Cookies.set('userId', res.user.id, { expires: 7 });
        Cookies.set('loginTimestamp', new Date().toISOString(), { expires: 7 });

        // 2. Dispatch loginSuccess to Redux store
        dispatch(loginSuccess(res.user));

        // 3. Normalize role and persist in localStorage
        const rawRole = (res.user.role || 'EMPLOYEE').toUpperCase();
        const role =
          rawRole === 'ORGANIZER' || rawRole === 'ORGANISER'
            ? ORGANISER
            : EMPLOYEE;

        try {
          localStorage.setItem('inventx_user_role', role);
          localStorage.setItem('inventx_user', JSON.stringify(res.user));
        } catch {
          // ignore
        }

        notify.success(`Welcome back, ${res.user.name || 'User'}!`);
        router.push(role === ORGANISER ? '/organizer/overview' : '/user-dashboard');
      } else {
        throw new Error('Invalid response received from authentication server');
      }
    } catch (err: any) {
      console.error('[Login Error]:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to sign in. Please verify your credentials.';
      dispatch(loginFailure(errorMsg));
      notify.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      notify.warning('Please enter your full name');
      return;
    }
    if (!regEmail.trim()) {
      notify.warning('Please enter your work email');
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();
    const allowedDomains = ['@enggis.com', '@nexsys.co.in', '@stability.co'];
    const hasAllowedDomain = allowedDomains.some((d) => emailLower.endsWith(d));

    if (!hasAllowedDomain) {
      notify.error('Only @enggis.com, @nexsys.co.in, @stability.co emails can register.');
      return;
    }

    if (!regPassword) {
      notify.warning('Please enter a password');
      return;
    }
    if (regPassword.length < 8) {
      notify.warning('Password must be at least 8 characters');
      return;
    }
    if (regPassword !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        name: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
      });

      notify.success('Account created successfully! Please sign in.');
      setMode('signin');
      setEmail(regEmail);
    } catch (err: any) {
      console.error('[Register Error]:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      notify.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Left Hero Panel */}
      <div
        className={styles.heroPanel}
        style={{ backgroundImage: `url(${heroBg.src})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroEdgeGradient} />

        <div className={styles.heroContent}>
          <span className={styles.hackathonTag}>
            THE ENGGIS GROUP INNOVATION HACKATHON
          </span>

          <div className={styles.logoWrapper}>
            <Image
              src={inventxLogoWhite}
              alt="invent/X"
              style={{ width: 'auto', height: '48px', objectFit: 'contain' }}
              priority
            />
          </div>

          <h1 className={styles.heroHeading}>
            Bring your ideas. Build their impact.
          </h1>

          <p className={styles.heroSubtitle}>
            Turning engineering ideas into real-world, impactful solutions.
          </p>

          <div className={styles.companyPillsRow}>
            <span className={styles.companyPill}>MANTIX</span>
            <span className={styles.companyPill}>Nexsys Process Automations</span>
            <span className={styles.companyPill}>Stability</span>
          </div>
        </div>
      </div>

      {/* 2. Right Form Panel */}
      <div className={styles.formPanel}>
        {mode === 'signin' ? (
          <div className={styles.formCard}>
            {/* Header */}
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Sign in</h2>
              <p className={styles.formSubtitle}>Use your Enggis Group account.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className={styles.authForm} autoComplete="off">
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Work email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={styles.passwordInput}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.signInBtn}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Register Link */}
            <div className={styles.registerRow}>
              New here?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={styles.registerLink}
              >
                Create an account
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.formCard}>
            {/* Header */}
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create your account</h2>
              <p className={styles.formSubtitle}>
                Only @enggis.com, @nexsys.co.in, @stability.co emails can register.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className={styles.authForm} autoComplete="off">
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="off"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Work email</label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="off"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <Input.Password
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  className={styles.passwordInput}
                />
                <span className={styles.helperText}>At least 8 characters.</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm password</label>
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={styles.passwordInput}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.signInBtn}
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Sign in Link */}
            <div className={styles.registerRow}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={styles.registerLink}
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
