import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import GoalCard from "./GoalCard";
import AddGoalModal from "./AddGoalModal";
import CompletedTasks from "./CompletedTasks";
import Button from "./ui/Button";
import { api } from "../lib/api";

const Dashboard = () => {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const fetchGoals = async () => {
        try {
            const data = await api.getGoals();
            setGoals(data);
        } catch (err) {
            console.error("Failed to fetch goals:", err);
            setError("Failed to load goals.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (newGoalData) => {
        try {
            await api.createGoal(newGoalData.title, newGoalData.description);
            await fetchGoals(); // Refresh list
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create goal:", err);
            alert("Failed to create goal.");
        }
    };

    const handleCompleteGoal = async (goalId) => {
        try {
            await api.completeGoal(goalId);
            await fetchGoals(); // Refresh active list
            // Optionally trigger refresh of CompletedTasks if we lifted state, 
            // but for now page refresh or separate fetch handles it.
            // Ideally we'd signal CompletedTasks to reload.
            window.location.reload(); // Simple brute force for now to sync both
        } catch (err) {
            console.error("Failed to complete goal:", err);
            if (err.response && err.response.status === 403) {
                alert("You can only complete goals you created.");
            } else {
                alert("Failed to complete goal.");
            }
        }
    };

    // TODO: Implement Update Goal. GoalCard needs an Edit button.
    // tailored for next steps.

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        You have {goals.length} active goals.
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </div>

            {/* Active Goals Grid */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {goals.length > 0 ? (
                        goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onToggle={() => handleCompleteGoal(goal.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                            No active goals. Add one to get started!
                        </div>
                    )}
                </div>
            </section>

            {/* Completed Tasks Section */}
            <CompletedTasks />

            <AddGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddGoal}
            />
        </div>
    );
};

export default Dashboard;
