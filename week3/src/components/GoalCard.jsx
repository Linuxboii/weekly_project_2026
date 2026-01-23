import { useState } from "react";
import { CheckCircle, Circle, Pencil, Clock, Plus, Minus, User, Loader2, AlertTriangle, Flame, Repeat } from "lucide-react";
import { api } from "../lib/api";

const GoalCard = ({ goal, onToggle, onEdit, isOwner = true, username = "User" }) => {
    const isCompleted = goal.completed;
    // Use counter_value from hydrated response (persisted value from backend)
    const initialCounter = goal.counter_value ?? 0;
    const [counter, setCounter] = useState(initialCounter);
    const [isCounterLoading, setIsCounterLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Backend-provided data
    const { deadline, days_left, deadline_crossed, is_recurring, current_streak, completed_today } = goal;

    // Determine deadline display
    const getDeadlineDisplay = () => {
        if (deadline_crossed === true) {
            return { text: "Deadline crossed", className: "text-destructive", icon: AlertTriangle };
        } else if (days_left !== null && days_left !== undefined) {
            return {
                text: days_left === 0 ? "Due today" : days_left === 1 ? "1 day left" : `${days_left} days left`,
                className: days_left <= 2 ? "text-amber-500" : "text-muted-foreground",
                icon: Clock
            };
        }
        return null;
    };

    const deadlineInfo = getDeadlineDisplay();

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

    const handleComplete = async () => {
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            await onToggle(goal.id);
        } finally {
            setIsCompleting(false);
        }
    };

    // Determine complete button state for recurring goals
    const canComplete = !completed_today || !is_recurring;
    const completeButtonTitle = is_recurring && completed_today
        ? "Already completed today! Come back tomorrow 🌟"
        : is_recurring
            ? "Complete today's goal"
            : "Mark as Complete";

    return (
        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center text-[10px] sm:text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[150px]">
                            <User size={10} className="mr-1" />
                            {username}
                        </span>

                        {/* Recurring badge */}
                        {is_recurring && (
                            <span className="inline-flex items-center text-[10px] sm:text-xs font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                                <Repeat size={10} className="mr-1" />
                                Daily
                            </span>
                        )}

                        {/* Streak badge */}
                        {is_recurring && current_streak > 0 && (
                            <span className="inline-flex items-center text-[10px] sm:text-xs font-medium bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">
                                <Flame size={10} className="mr-1" />
                                {current_streak} day{current_streak > 1 ? 's' : ''}
                            </span>
                        )}

                        {deadlineInfo && (
                            <div className={`flex items-center text-[10px] sm:text-xs ${deadlineInfo.className}`} title="Deadline">
                                <deadlineInfo.icon size={10} className="mr-1" />
                                {deadlineInfo.text}
                            </div>
                        )}
                    </div>
                    <h3 className={`font-semibold text-lg leading-tight break-words ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {goal.title}
                    </h3>
                </div>

                {/* Complete Action - Only for Owner */}
                {isOwner && onToggle && (
                    <button
                        onClick={handleComplete}
                        disabled={!canComplete || isCompleting}
                        className={`shrink-0 p-1 rounded-full transition-colors ${completed_today && is_recurring
                                ? "text-green-500 cursor-not-allowed opacity-60"
                                : isCompleted
                                    ? "text-green-500 hover:text-green-600"
                                    : "text-muted-foreground hover:text-primary"
                            } disabled:cursor-not-allowed`}
                        title={completeButtonTitle}
                    >
                        {isCompleting ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : completed_today && is_recurring ? (
                            <CheckCircle size={24} />
                        ) : isCompleted ? (
                            <CheckCircle size={24} />
                        ) : (
                            <Circle size={24} />
                        )}
                    </button>
                )}
            </div>

            {/* Completed today message for recurring goals */}
            {is_recurring && completed_today && (
                <p className="text-xs text-green-500 mb-2 flex items-center gap-1">
                    ✨ Done for today! Come back tomorrow to keep your streak.
                </p>
            )}

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
