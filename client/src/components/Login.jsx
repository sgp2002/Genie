import { useState } from 'react';
import { LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Call onLogin callback to update parent state
      if (onLogin) {
        onLogin(data.user);
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
            <p className="text-qe-text-secondary">Sign in to your account</p>
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
                placeholder="Enter your username"
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
                className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-qe-accent hover:bg-qe-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-qe-text-secondary text-sm">
              Use <strong>admin</strong> / <strong>admin123</strong> to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
