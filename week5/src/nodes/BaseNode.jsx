import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

const BaseNode = ({
    children,
    title,
    icon: Icon,
    color = 'bg-emerald-500',
    selected,
    className
}) => {
    return (
        <div className={clsx(
            "group relative min-w-[200px] max-w-[280px] rounded-lg transition-all duration-150",
            selected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas shadow-lg shadow-primary/20"
                : "hover:shadow-lg hover:shadow-black/30",
            "bg-[#1a1a1c] border border-[#2a2a2e]"
        )}>
            {/* Header - Compact n8n style */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#2a2a2e]">
                <div className={clsx(
                    "flex items-center justify-center w-7 h-7 rounded-md text-white",
                    color
                )}>
                    {Icon && <Icon size={14} strokeWidth={2.5} />}
                </div>
                <span className="font-medium text-[13px] text-gray-100 truncate">{title}</span>
            </div>

            {/* Body */}
            {children && (
                <div className={clsx("px-3 py-2.5 text-[12px]", className)}>
                    {children}
                </div>
            )}

            {/* Handles - n8n style dots */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-[#3a3a3e] !border-2 !border-[#1a1a1c] !rounded-full !-left-1.5 hover:!bg-primary hover:!scale-110 transition-all"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-[#3a3a3e] !border-2 !border-[#1a1a1c] !rounded-full !-right-1.5 hover:!bg-primary hover:!scale-110 transition-all"
            />
        </div>
    );
};

export default memo(BaseNode);
