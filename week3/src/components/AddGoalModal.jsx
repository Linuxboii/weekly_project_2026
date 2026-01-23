import { useState, useEffect } from "react";
import { X, Calendar, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";

const AddGoalModal = ({ isOpen, onClose, onAdd, goalToEdit = null }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title);
            setDescription(goalToEdit.description || "");
            setIsRecurring(goalToEdit.is_recurring || false);
            // Format deadline for date input (YYYY-MM-DD)
            if (goalToEdit.deadline) {
                const date = new Date(goalToEdit.deadline);
                setDeadline(date.toISOString().split('T')[0]);
            } else {
                setDeadline("");
            }
        } else {
            setTitle("");
            setDescription("");
            setDeadline("");
            setIsRecurring(false);
        }
    }, [goalToEdit, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            title,
            description,
            deadline: deadline || null,
            is_recurring: isRecurring,
            id: goalToEdit?.id
        });
        setTitle("");
        setDescription("");
        setDeadline("");
        setIsRecurring(false);
    };

    if (!isOpen) return null;

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-md p-6 rounded-lg shadow-lg border border-border mx-4"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{goalToEdit ? "Edit Goal" : "Add New Goal"}</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Goal Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Read 30 minutes"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary"
                                placeholder="Details about your goal..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Deadline (Optional)
                                </span>
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                min={today}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Recurring Toggle */}
                        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                            <div className="flex items-center gap-2">
                                <Repeat size={16} className={isRecurring ? "text-primary" : "text-muted-foreground"} />
                                <div>
                                    <span className="text-sm font-medium">Recurring Goal</span>
                                    <p className="text-xs text-muted-foreground">
                                        {isRecurring ? "Tracks daily streaks 🔥" : "One-time completion"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRecurring(!isRecurring)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${isRecurring ? "bg-primary" : "bg-muted"}`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRecurring ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" type="button" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {goalToEdit ? "Save Changes" : "Create Goal"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddGoalModal;
