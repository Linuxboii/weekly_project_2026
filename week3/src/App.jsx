import { useState, useEffect } from "react";
import { Users, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
// Signup removed as per requirements (Login only)
import ChangePasswordForm from "./components/ChangePasswordForm"; // Keeping for Settings tab? Or remove? User didn't ask for it.
// The user prompt says "There are no owner or admin roles... Authentication uses Bearer tokens".
// Previous conversation implemented ChangePassword. I'll keep it if it adheres to API (POST /auth/change_password).
// API.js has `changePassword`.
import { cn } from "./lib/utils";
import { api } from "./lib/api";

// Responsive Navbar Component
const Navbar = ({ activeTab, setActiveTab, onLogout }) => (
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
                            {/* Social Feed removed */}
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
                        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm ring-2 ring-background">
                            ME
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
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm ring-2 ring-background">
                    ME
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
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setActiveTab("dashboard");
    };

    const handleLogout = () => {
        api.logout();
        setIsAuthenticated(false);
        setActiveTab("dashboard");
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
                    <LoginForm
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignup={() => alert("Signup is disabled.")}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20 sm:pb-0">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "dashboard" ? (
                    <Dashboard />
                ) : (
                    <ChangePasswordForm onLogout={handleLogout} />
                )}
            </main>
        </div>
    );
}

export default App;
