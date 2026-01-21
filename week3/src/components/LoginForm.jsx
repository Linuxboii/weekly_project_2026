import { useState } from 'react';
import { api } from '../lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await api.login(email, password);
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                onLoginSuccess();
            } else {
                throw new Error('No token received');
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-email">
                    Email
                </label>
                <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-password">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
            </button>

            <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary hover:underline font-medium"
                >
                    Sign up
                </button>
            </div>
        </form>
    );
}
