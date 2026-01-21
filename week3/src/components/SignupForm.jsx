import { useState } from "react";
import { api } from "../lib/api";
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import Button from "./ui/Button"; // Using existing UI component if possible, or standard HTML
// Actually, App.jsx uses standard HTML/Tailwind for Login, I'll stick to that style or consistent UI.
// Checked previous LoginForm: used standard HTML + lucide icons.

export default function SignupForm({ onSwitchToLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setIsLoading(true);

        try {
            await api.signup(email, password);
            setSuccess("Account created successfully. Please log in.");
            // Optional: Auto-switch after delay? Or just show button.
            // Prompt says: Show: “Account created successfully. Please log in.”
        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;

                if (status === 409) {
                    setError("An account with this email already exists.");
                } else if (status === 400) {
                    setError("Email and password are required.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-sm mx-auto p-6 bg-card rounded-lg shadow-lg border text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <UserPlus size={24} />
                </div>
                <h3 className="text-xl font-semibold">Success!</h3>
                <p className="text-muted-foreground">{success}</p>
                <button
                    onClick={onSwitchToLogin}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4 p-4">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Create Account</h2>
                <p className="text-sm text-muted-foreground">Enter your email below to create your account.</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="signup-email">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="signup-password">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Sign Up"}
            </button>

            <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary hover:underline font-medium"
                >
                    Log in
                </button>
            </div>
        </form>
    );
}
