
import React, { useState } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import { User, UserRole, SubscriptionTier } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLoginHelpRequest: (name: string, email: string, institution: string, issue: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, users, setUsers, onLoginHelpRequest }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showHelpView, setShowHelpView] = useState(false);
  
  // Login/Signup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Help form state
  const [helpName, setHelpName] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpInstitution, setHelpInstitution] = useState('');
  const [helpIssue, setHelpIssue] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const ACADEMIC_EMAIL_REGEX = /\.(ac\.[a-z]{2}|edu(\.[a-z]{2})?)$/i;

  const findByEmail = (email: string): User | undefined => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const addUser = (name: string, email: string, institution: string): User => {
    const newUser: User = {
        id: String(Date.now()),
        name,
        email,
        institution,
        role: UserRole.STUDENT,
        subscriptionTier: SubscriptionTier.FREE,
        profilePicture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
        aboutMe: '',
        subject: '',
        hobbies: '',
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    return newUser;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLoginView && (!name.trim() || !institution.trim()))) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    if (isLoginView) {
      // Login logic
      const user = findByEmail(email);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('No user found with that email. Please sign up.');
      }
    } else {
      // Sign-up logic
      if (!agreedToTerms) {
        setError('You must agree to the terms and policies to create an account.');
        return;
      }
      if (!ACADEMIC_EMAIL_REGEX.test(email)) {
          setError('Please sign up with a valid university or college email address (e.g., ending in .edu, .ac.uk).');
          return;
      }
      if (findByEmail(email)) {
        setError('An account with this email already exists. Please login.');
        return;
      }
      const newUser = addUser(name, email, institution);
      onLoginSuccess(newUser);
    }
  };
  
  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpName.trim() || !helpEmail.trim() || !helpInstitution.trim() || !helpIssue.trim()) {
        setError('Please fill in all fields for your help request.');
        return;
    }
    setError('');
    onLoginHelpRequest(helpName, helpEmail, helpInstitution, helpIssue);
    setSuccessMessage('Your help request has been sent. Staff will be in touch shortly.');
    setTimeout(() => {
        setShowHelpView(false);
        setSuccessMessage('');
    }, 4000);
  };


  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setInstitution('');
    setAgreedToTerms(false);
  };

  const renderLoginSignup = () => (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {isLoginView ? 'Welcome Back' : 'Create an Account'}
      </h2>
      <p className="text-center text-gray-600 mb-8">
        {isLoginView ? 'Sign in to continue to StudyWell.' : 'Get started with your AI study partner.'}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {!isLoginView && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="John Doe" required />
            </div>
             <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="institution">
                Educational Institution
              </label>
              <input id="institution" type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="e.g., University of Example" required />
            </div>
          </>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            Academic Email Address
          </label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="you@example.edu" autoComplete="email" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="•••••••• (any password works for demo)" autoComplete={isLoginView ? "current-password" : "new-password"} required />
        </div>

        {!isLoginView && (
            <div className="mb-6">
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            aria-describedby="terms-description"
                            name="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-gray-700">
                            I agree to the{' '}
                            <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-pink-600 hover:text-pink-700">
                                Terms of Use, Terms and Conditions, and Privacy Policy
                            </a>
                            .
                        </label>
                    </div>
                </div>
            </div>
        )}

        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        <Button type="submit" className="w-full">
          {isLoginView ? 'Login' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={toggleView} className="font-medium text-pink-600 hover:text-pink-700 transition-colors" type="button">
          {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
        <p className="mt-2">
            <button onClick={() => { setShowHelpView(true); setError(''); }} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Forgot your password or having trouble logging in?
            </button>
        </p>
      </div>
    </Card>
  );
  
  const renderHelpRequest = () => (
     <Card className="p-8">
        {successMessage ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600">Request Sent!</h2>
              <p className="text-gray-700 mt-2">{successMessage}</p>
            </div>
        ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Login Help</h2>
              <p className="text-center text-gray-600 mb-8">
                Fill out the form below and our staff will assist you.
              </p>

              <form onSubmit={handleHelpSubmit} noValidate className="space-y-4">
                 <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="help-name">Full Name</label>
                    <input id="help-name" type="text" value={helpName} onChange={(e) => setHelpName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm" required />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="help-email">Your Email Address</label>
                    <input id="help-email" type="email" value={helpEmail} onChange={(e) => setHelpEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm" required />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="help-institution">Your Educational Institution</label>
                    <input id="help-institution" type="text" value={helpInstitution} onChange={(e) => setHelpInstitution(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm" required />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="help-issue">Describe your issue</label>
                    <textarea id="help-issue" rows={4} value={helpIssue} onChange={(e) => setHelpIssue(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm" required />
                 </div>
                
                {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
                
                <Button type="submit" className="w-full">
                  Send Help Request
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => {setShowHelpView(false); setError('');}} className="font-medium text-pink-600 hover:text-pink-700 transition-colors" type="button">
                  Back to Login
                </button>
              </div>
            </>
        )}
     </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 font-sans">
      <div className="w-full max-w-md p-4">
        <div className="flex flex-col justify-center items-center mb-8 text-center">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
                StudyWell
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Your AI Student Companion</p>
        </div>
        {showHelpView ? renderHelpRequest() : renderLoginSignup()}
      </div>
    </div>
  );
};

export default AuthPage;
