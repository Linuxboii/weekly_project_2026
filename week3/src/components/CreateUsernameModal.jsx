import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import Button from "./ui/Button";
import { api } from "../lib/api";

const CreateUsernameModal = ({ onComplete }) => {
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setError("Username is required");
            return;
        }

        if (trimmedUsername.length < 2) {
            setError("Username must be at least 2 characters");
            return;
        }

        if (trimmedUsername.length > 20) {
            setError("Username must be 20 characters or less");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call backend API to create/update profile
            const profileData = await api.updateUserProfile({
                username: trimmedUsername
            });

            // Store username locally after successful API response
            localStorage.setItem("user_username", profileData.username);
            onComplete(profileData.username);
        } catch (err) {
            console.error("Failed to set username:", err);

            // Handle specific error cases
            if (err.response) {
                const status = err.response.status;
                if (status === 401) {
                    // 401 is handled globally by api interceptor (triggers logout)
                    setError("Session expired. Please log in again.");
                } else if (status === 400) {
                    // Validation error from backend
                    const message = err.response.data?.message || err.response.data?.error;
                    setError(message || "Invalid username. Please try a different one.");
                } else if (status === 409) {
                    // Username already taken
                    setError("This username is already taken. Please choose another.");
                } else {
                    // 500 or other server errors
                    setError("Server error. Please try again.");
                }
            } else {
                // Network error
                setError("Network error. Please check your connection.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome to AvlokAI!</h2>
                    <p className="text-muted-foreground mt-2">
                        Let's personalize your experience. Choose a username.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            autoFocus
                            maxLength={20}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                            2-20 characters. This will be displayed on your goals.
                        </p>
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={!username.trim() || isSubmitting}
                        className="w-full py-3"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateUsernameModal;
