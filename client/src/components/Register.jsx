import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          // Handle different error formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (Array.isArray(errorData.detail)) {
            // Handle validation errors
            errorMessage = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Auto-login after registration
      const loginFormData = new FormData();
      loginFormData.append('username', username);
      loginFormData.append('password', password);

      const loginResponse = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        body: loginFormData,
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        // Call onRegister callback to update parent state
        if (onRegister) {
          onRegister(loginData.user);
        }
      } else {
        // Registration successful but auto-login failed
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-qe-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="bg-qe-bg-secondary rounded-lg shadow-lg p-8 border border-qe-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-qe-text-primary mb-2">
              PlayGenie
            </h1>
            <p className="text-qe-text-secondary">Create your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-qe-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-qe-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-qe-text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-qe-text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-qe-accent hover:bg-qe-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Creating account...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-qe-text-secondary text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-qe-accent hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
