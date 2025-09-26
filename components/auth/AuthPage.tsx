import React, { useState } from 'react';
import { ukUniversitiesAndColleges } from '../../data/universities';
import { UserRole, Subscription, UserSession, UserData } from '../../types';
import LandingPage from '../landing/LandingPage';
import { avatars } from '../../data/avatars';
import * as db from '../../services/databaseService';

interface AuthPageProps {
  onLogin: (session: UserSession) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  if (!showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 m-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        {isLoginView ? <LoginForm onLogin={onLogin} /> : <RegisterForm onLogin={onLogin} />}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLoginView(!isLoginView)} className="ml-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {isLoginView ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

const LoginForm: React.FC<{ onLogin: (session: UserSession) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded admin credentials
    const adminEmail = 'scotthw1984@gmail.com';
    const adminPassword = 'Brookhouse01!';

    if (email.toLowerCase() === adminEmail && password === adminPassword) {
        if (!db.getUser(adminEmail)) {
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
            const adminUser: UserData = {
                email: adminEmail,
                username: "Scott",
                password: adminPassword,
                institution: "The Open University",
                role: 'Administrator',
                avatarId: randomAvatar.id,
            };
            db.saveUser(adminUser);
        }
        onLogin({ email: adminEmail, role: 'Administrator' });
        return;
    }

    try {
      const userData = db.getUser(email);
      if (userData) {
        if (userData.password === password) {
          const bans = db.getBanRecords();
          const userBan = bans.find(b => b.userId === email.toLowerCase());
          if (userBan && new Date(userBan.expires) > new Date()) {
            setError(`You are banned until ${new Date(userBan.expires).toLocaleString()}.`);
            return;
          }
          
          onLogin({ email: userData.email, role: userData.role });
        } else {
          setError('Invalid email or password.');
        }
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors">
        Log In
      </button>
    </form>
  );
};

const RegisterForm: React.FC<{ onLogin: (session: UserSession) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase();
    if (db.getUser(normalizedEmail)) {
      setError('An account with this email already exists.');
      return;
    }
    
    // All new signups are students. Admin account is hardcoded at login.
    const role: UserRole = 'Student';
    const subscription: Subscription = { tier: 'Free' };
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newUser: UserData = {
      email: normalizedEmail,
      username,
      password, // In a real app, this would be hashed
      institution,
      role,
      subscription,
      avatarId: randomAvatar.id,
    };

    const doRegister = async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, username, password, institution })
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Registration failed');
          return;
        }
        if (json.token) {
          // Dev mode fallback - show token so dev can confirm
          setError(`Confirmation token (dev mode): ${json.token}`);
          return;
        }
        // Email sent - instruct user
        setError('Confirmation email sent. Please check your inbox.');
      } catch (err) {
        console.error(err);
        setError('An error occurred during registration. Please try again.');
      }
    };

    doRegister();
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
      <input
        list="institutions"
        placeholder="University or College"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
        required
      />
      <datalist id="institutions">
        {ukUniversitiesAndColleges.map(uni => <option key={uni} value={uni} />)}
      </datalist>
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors">
        Sign Up
      </button>
    </form>
  );
};

export default AuthPage;