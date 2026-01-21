import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function CompletedTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await api.getCompletedTasks();
                setTasks(data);
            } catch (err) {
                console.error("Failed to fetch completed tasks", err);
                setError("Failed to load completed tasks.");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return <div className="text-center py-4 text-muted-foreground">Loading history...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    if (tasks.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No recently completed tasks.</div>;
    }

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                Recently Completed
            </h2>
            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-card border rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                        <div>
                            <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                            {task.description && <p className="text-sm text-muted-foreground line-through">{task.description}</p>}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {task.completed_at ? formatDistanceToNow(new Date(task.completed_at), { addSuffix: true }) : 'Recently'}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
