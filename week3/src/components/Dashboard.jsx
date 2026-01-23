import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import GoalCard from "./GoalCard";
import AddGoalModal from "./AddGoalModal";
import CompletedTasks from "./CompletedTasks";
import Button from "./ui/Button";
import { api } from "../lib/api";

const Dashboard = ({ currentUser }) => {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState(null);
    const [error, setError] = useState(null);

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            // Use hydrated endpoint - returns only current user's goals with username
            const data = await api.getHydratedGoalsMe();
            const allGoals = Array.isArray(data) ? data : [];
            setGoals(allGoals);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch goals:", err);
            if (err.response?.status === 401) {
                // Handled by global interceptor - redirect to login
                return;
            } else if (err.response?.status === 403) {
                setError("You don't have permission to view these goals.");
            } else if (err.response?.status >= 500) {
                setError("Server error. Please try again later.");
            } else {
                setError("Failed to load goals.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchGoals();
        }
    }, [currentUser]);

    const handleAddOrEditGoal = async (goalData) => {
        try {
            if (goalData.id) {
                // Update existing goal
                await api.updateGoal(goalData.id, {
                    title: goalData.title,
                    description: goalData.description,
                    deadline: goalData.deadline,
                    is_recurring: goalData.is_recurring
                });
            } else {
                // Create new goal
                await api.createGoal(goalData.title, goalData.description, goalData.deadline, goalData.is_recurring);
            }
            await fetchGoals();
            setIsModalOpen(false);
            setGoalToEdit(null);
        } catch (err) {
            console.error("Failed to save goal:", err);
            alert(goalData.id ? "Failed to update goal." : "Failed to create goal.");
        }
    };

    const handleEditGoal = (goal) => {
        setGoalToEdit(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setGoalToEdit(null);
    };

    const handleCompleteGoal = async (goalId) => {
        try {
            await api.completeGoal(goalId);
            await fetchGoals();
        } catch (err) {
            console.error("Failed to complete goal:", err);
            if (err.response?.status === 403) {
                alert("You don't have permission to complete this goal.");
            } else {
                alert("Failed to complete goal.");
            }
        }
    };

    if (isLoading || !currentUser) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        You have {goals.length} active goal{goals.length !== 1 ? 's' : ''}.
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    {error}
                </div>
            )}

            {/* Active Goals Grid */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {goals.length > 0 ? (
                        goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                isOwner={true}
                                username={goal.username || currentUser?.username || "You"}
                                onToggle={() => handleCompleteGoal(goal.id)}
                                onEdit={handleEditGoal}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                            No active goals found. Click "Add Goal" to create one!
                        </div>
                    )}
                </div>
            </section>

            {/* Completed Tasks Section */}
            <CompletedTasks />

            <AddGoalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddOrEditGoal}
                goalToEdit={goalToEdit}
            />
        </div>
    );
};

export default Dashboard;
