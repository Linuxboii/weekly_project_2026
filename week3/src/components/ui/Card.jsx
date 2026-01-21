import { cn } from "../../lib/utils";

const Card = ({ className, children, ...props }) => (
    <div
        className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

const CardHeader = ({ className, children, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
        {children}
    </div>
);

const CardTitle = ({ className, children, ...props }) => (
    <h3
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    >
        {children}
    </h3>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={cn("p-6 pt-0", className)} {...props}>
        {children}
    </div>
);

const CardFooter = ({ className, children, ...props }) => (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
