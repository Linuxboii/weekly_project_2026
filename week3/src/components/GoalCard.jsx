import { useState } from "react";
import { CheckCircle, Circle, Pencil, Clock, Plus, Minus, User, Loader2 } from "lucide-react";
import { api } from "../lib/api";

const GoalCard = ({ goal, onToggle, onEdit, isOwner = true, username = "User" }) => {
    const isCompleted = goal.completed;
    // Use counter_value from hydrated response (persisted value from backend)
    const initialCounter = goal.counter_value ?? 0;
    const [counter, setCounter] = useState(initialCounter);
    const [isCounterLoading, setIsCounterLoading] = useState(false);

    // Initial date handling
    const createdDate = new Date(goal.created_at || Date.now());
    const deadlineDate = new Date(createdDate);
    deadlineDate.setDate(deadlineDate.getDate() + 7);
    const deadlineString = deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const handleIncrement = async () => {
        if (isCounterLoading) return;
        setIsCounterLoading(true);
        try {
            const data = await api.incrementGoalCounter(goal.id);
            setCounter(data.value);
        } catch (err) {
            console.error("Failed to increment", err);
        } finally {
            setIsCounterLoading(false);
        }
    };

    const handleDecrement = async () => {
        if (isCounterLoading || counter <= 0) return;
        setIsCounterLoading(true);
        try {
            const data = await api.decrementGoalCounter(goal.id);
            setCounter(data.value);
        } catch (err) {
            console.error("Failed to decrement", err);
        } finally {
            setIsCounterLoading(false);
        }
    };

    return (
        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center text-[10px] sm:text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[150px]">
                            <User size={10} className="mr-1" />
                            {username}
                        </span>
                        <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground" title="Estimated Deadline">
                            <Clock size={10} className="mr-1" />
                            {deadlineString}
                        </div>
                    </div>
                    <h3 className={`font-semibold text-lg leading-tight break-words ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {goal.title}
                    </h3>
                </div>

                {/* Complete Action - Only for Owner */}
                {isOwner && onToggle && (
                    <button
                        onClick={() => onToggle(goal.id)}
                        className={`shrink-0 p-1 rounded-full transition-colors ${isCompleted ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-primary"}`}
                        title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                    >
                        {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                )}
            </div>

            {goal.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 break-words">
                    {goal.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center space-x-1 bg-secondary/50 rounded-md px-1.5 py-0.5" title="Progress Counter">
                    {/* Decrement - Only for Owner */}
                    {isOwner && (
                        <button
                            onClick={handleDecrement}
                            disabled={isCounterLoading || counter <= 0}
                            className="p-1 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Minus size={12} />
                        </button>
                    )}

                    <span className={`text-xs font-mono w-6 text-center select-none flex justify-center ${!isOwner ? 'px-2' : ''}`}>
                        {isCounterLoading ? <Loader2 size={12} className="animate-spin" /> : counter}
                    </span>

                    {/* Increment - Only for Owner */}
                    {isOwner && (
                        <button
                            onClick={handleIncrement}
                            disabled={isCounterLoading}
                            className="p-1 hover:text-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus size={12} />
                        </button>
                    )}
                </div>

                {/* Edit Action - Only for Owner */}
                {isOwner && onEdit && !isCompleted && (
                    <button
                        onClick={() => onEdit(goal)}
                        className="text-muted-foreground hover:text-foreground p-1 text-xs flex items-center gap-1 transition-colors"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default GoalCard;
