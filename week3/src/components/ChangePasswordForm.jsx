import { useState } from 'react';
import { api } from '../lib/api';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';

export default function ChangePasswordForm({ onLogout }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Frontend Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            // Basic length check, though backend might enforce stricter rules
            // Keeping it simple as per instructions "framework-agnostic logic"
        }

        setLoading(true);

        try {
            await api.changePassword(currentPassword, newPassword);
            // Success handling: Clear token and redirect (handled by onLogout which clears token)
            // We can show an alert or just let the logout happen.
            // Instruction says: Show message “Your password was updated successfully. Please log in again.”
            alert('Your password was updated successfully. Please log in again.');
            onLogout();
        } catch (err) {
            if (err.message === 'incorrect_current_password') {
                setError('Your current password is incorrect.');
            } else if (err.message === 'invalid_or_expired_session') {
                setError('Your session has expired. Please log in again.');
                setTimeout(onLogout, 2000); // Auto logout after error
            } else if (err.message === 'current_and_new_password_required') {
                setError('Both current and new passwords are required.');
            } else {
                setError('Something went wrong. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-card rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Save className="h-5 w-5" />
                Change Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="current-password">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="new-password">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirm-password">
                        Confirm New Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
