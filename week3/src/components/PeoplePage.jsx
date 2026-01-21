import { useState, useEffect } from "react";
import { api } from "../lib/api";
import GoalCard from "./GoalCard";
import { Loader2, AlertCircle } from "lucide-react";

const PeoplePage = ({ currentUser }) => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use hydrated endpoint - returns all goals with username included
                const response = await api.getHydratedGoals();
                const allGoals = Array.isArray(response) ? response : [];

                // Filter to show only OTHER users' goals (not current user's)
                const communityGoals = currentUser?.username
                    ? allGoals.filter(goal => goal.username !== currentUser.username)
                    : allGoals;

                setGoals(communityGoals);
            } catch (err) {
                console.error("Failed to fetch community goals:", err);
                if (err.response?.status === 401) {
                    // Handled by global interceptor
                    return;
                } else if (err.response?.status >= 500) {
                    setError("Server error. Please try again later.");
                } else {
                    setError("Failed to load community tasks.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading community tasks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
                <AlertCircle size={24} className="mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Community Tasks</h2>
                <span className="text-sm text-muted-foreground">{goals.length} active task{goals.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.length > 0 ? (
                    goals.map(goal => (
                        <GoalCard
                            key={goal.id || `goal-${Math.random()}`}
                            goal={goal}
                            username={goal.username || "Anonymous"}
                            isOwner={false}  // STRICTLY READ-ONLY - no controls
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        No public tasks found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeoplePage;
