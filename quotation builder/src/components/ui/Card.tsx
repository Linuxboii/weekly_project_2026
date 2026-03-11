import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    isGlass?: boolean;
}

export const Card = ({ className, isGlass = true, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                isGlass ? 'glass-card' : 'bg-neutral-bg2 rounded-xl border border-white/5',
                'p-6',
                className
            )}
            {...props}
        />
    );
};
