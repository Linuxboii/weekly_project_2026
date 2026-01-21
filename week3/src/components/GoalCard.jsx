import { motion } from "framer-motion";
import { Check, Clock, Flame, Pencil } from "lucide-react";
import { cn } from "../lib/utils";
import Button from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";

const GoalCard = ({ goal, onToggle, onEdit }) => {
    const isCompleted = goal.completed;
    const daysLeft = Math.ceil(
        (new Date(goal.created_at || Date.now()) - new Date()) / (1000 * 60 * 60 * 24) * -1
        // Logic: Calculate "Days Since Creation" (Age)
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="group"
        >
            <Card className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50",
                isCompleted ? "border-green-500/30 bg-green-500/5" : "bg-card"
            )}>
                {/* Progress Bar Background (Optional) */}

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className={cn(
                                "mt-1 text-xl transition-all break-words pr-2",
                                isCompleted && "line-through text-muted-foreground"
                            )}>
                                {goal.title}
                            </CardTitle>
                        </div>

                        <div className="flex items-center gap-2">
                            {onEdit && !isCompleted && (
                                <button
                                    onClick={() => onEdit(goal)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                    title="Edit Goal"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}
                            {/* Streak removed as API doesn't support it yet, or maybe I should hide it */}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.description}
                    </p>
                </CardContent>

                <CardFooter className="flex justify-between items-center pt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock size={14} className="mr-1" />
                        <span>
                            {isCompleted
                                ? "Completed"
                                : daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : "Overdue"}
                        </span>
                    </div>

                    {onToggle && (
                        <Button
                            size="sm"
                            variant={isCompleted ? "secondary" : "default"}
                            onClick={() => onToggle(goal.id)}
                            className={cn(
                                "rounded-full transition-all",
                                isCompleted ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : ""
                            )}
                        >
                            {isCompleted ? <Check size={16} /> : "Complete"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default GoalCard;
