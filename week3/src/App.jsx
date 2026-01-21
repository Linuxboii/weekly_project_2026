import { useState, useEffect } from "react";
import { Users, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import PeoplePage from "./components/PeoplePage";
import ChangePasswordForm from "./components/ChangePasswordForm";
import CreateUsernameModal from "./components/CreateUsernameModal";
import { cn } from "./lib/utils";
import { api } from "./lib/api";

// Helper to parse JWT token
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// Get user ID from token
const getUserIdFromToken = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded) return null;

    // Common JWT fields for user ID
    return decoded.sub || decoded.id || decoded.user_id || decoded.userId || null;
};

// Responsive Navbar Component
const Navbar = ({ activeTab, setActiveTab, onLogout, username }) => (
    <>
        {/* Desktop Top Navigation */}
        <nav className="hidden sm:block border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 font-bold text-2xl tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            AvlokAI
                        </div>
                        <div className="ml-10 flex space-x-8">
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                                    activeTab === "dashboard"
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                My Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab("people")}
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                                    activeTab === "people"
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                People
                            </button>
                            <button
                                onClick={() => setActiveTab("settings")}
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                                    activeTab === "settings"
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onLogout}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm ring-2 ring-background" title={username || "User"}>
                            {username ? username.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        {/* Mobile Top Header */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
            <div className="font-bold text-xl tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AvlokAI
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onLogout}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                    <LogOut className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm ring-2 ring-background" title={username || "User"}>
                    {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
            </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-lg border-t border-border/50 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === "dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button
                    onClick={() => setActiveTab("people")}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === "people" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Users className="h-5 w-5" />
                    <span className="text-[10px] font-medium">People</span>
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Settings</span>
                </button>
            </div>
        </nav>
    </>
);

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState("login");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentUser, setCurrentUser] = useState(null); // { id, username }
    const [needsUsername, setNeedsUsername] = useState(false);

    const initializeUser = async () => {
        // Try to fetch profile from backend - this is the authoritative source for user_id
        try {
            const profile = await api.getUserProfile();

            if (profile) {
                // Profile exists - use user_id from backend (authoritative)
                setCurrentUser({
                    id: profile.user_id,  // USE BACKEND user_id, NOT JWT
                    username: profile.username,
                    display_name: profile.display_name
                });
                // Cache username locally for quick access
                if (profile.username) {
                    localStorage.setItem("user_username", profile.username);
                    setNeedsUsername(false);
                } else {
                    setNeedsUsername(true);
                }
            } else {
                // No profile yet (404 returned null) - need to create username
                // Fall back to JWT parsing until profile is created
                const userId = getUserIdFromToken();
                const localUsername = localStorage.getItem("user_username");
                setCurrentUser({
                    id: userId,
                    username: localUsername || null
                });
                setNeedsUsername(!localUsername);
            }
        } catch (err) {
            // Handle non-404 errors silently, fall back to JWT + localStorage
            if (err.response?.status !== 401) {
                // 401 is handled by global interceptor
                const userId = getUserIdFromToken();
                const localUsername = localStorage.getItem("user_username");
                setCurrentUser({
                    id: userId,
                    username: localUsername || null
                });
                setNeedsUsername(!localUsername);
            }
        }
    };

    const handleUsernameComplete = async (newUsername) => {
        // Re-fetch profile to get the authoritative user_id from backend
        try {
            const profile = await api.getUserProfile();
            if (profile) {
                setCurrentUser({
                    id: profile.user_id,
                    username: profile.username,
                    display_name: profile.display_name
                });
            } else {
                // Fallback if profile fetch fails
                setCurrentUser(prev => ({
                    ...prev,
                    username: newUsername
                }));
            }
        } catch {
            // Fallback on error
            setCurrentUser(prev => ({
                ...prev,
                username: newUsername
            }));
        }
        setNeedsUsername(false);
    };

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (err) {
            console.error("Logout API call failed:", err);
        }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_username");
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNeedsUsername(false);
        setAuthView("login");
        setActiveTab("dashboard");
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            setIsAuthenticated(true);
            initializeUser();
        }

        const handleAuthLogout = () => {
            handleLogout();
        };

        window.addEventListener('auth:logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth:logout', handleAuthLogout);
        };
    }, []);

    const handleLoginSuccess = () => {
        // Token is already stored by LoginForm
        setIsAuthenticated(true);
        setActiveTab("dashboard");
        // Initialize user from token
        initializeUser();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="font-bold text-4xl tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                            AvlokAI
                        </div>
                        <p className="text-muted-foreground">Master your habits, master your life.</p>
                    </div>
                    {authView === "login" ? (
                        <LoginForm
                            onLoginSuccess={handleLoginSuccess}
                            onSwitchToSignup={() => setAuthView("signup")}
                        />
                    ) : (
                        <SignupForm onSwitchToLogin={() => setAuthView("login")} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20 sm:pb-0">
            {/* Show username creation modal if needed */}
            {needsUsername && (
                <CreateUsernameModal onComplete={handleUsernameComplete} />
            )}

            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                username={currentUser?.username}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "dashboard" ? (
                    <Dashboard currentUser={currentUser} />
                ) : activeTab === "people" ? (
                    <PeoplePage currentUser={currentUser} />
                ) : (
                    <ChangePasswordForm onLogout={handleLogout} />
                )}
            </main>
        </div>
    );
}

export default App;
