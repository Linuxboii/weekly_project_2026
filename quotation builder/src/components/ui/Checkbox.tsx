import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, checked, ...props }, ref) => {
        return (
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                    <input
                        type="checkbox"
                        ref={ref}
                        checked={checked}
                        className="peer sr-only"
                        {...props}
                    />
                    <div className={cn(
                        "h-5 w-5 rounded border-2 border-white/10 bg-white/5 transition-all group-hover:border-brand/50",
                        "peer-checked:bg-brand peer-checked:border-brand",
                        className
                    )} />
                    <Check className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 left-0.5 top-0.5" />
                </div>
                <div className="flex flex-col">
                    {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
                    {description && <span className="text-xs text-text-muted">{description}</span>}
                </div>
            </label>
        );
    }
);
