import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import clsx from 'clsx';
import { NODE_STATUS, NODE_CATEGORIES, getNodeTemplate } from '../data/nodeData';
import { Package, X } from 'lucide-react';

const ClientNode = ({ id, data, selected }) => {
    const { setNodes, setEdges } = useReactFlow();

    const {
        label,
        description,
        templateId,
        status = NODE_STATUS.ACTIVE,
        clientName,
        faded = false
    } = data;

    // Look up icon from template (icons can't be serialized to JSON)
    const template = templateId ? getNodeTemplate(templateId) : null;
    const Icon = template?.icon || Package;

    const category = NODE_CATEGORIES.CLIENT;

    const handleDelete = (e) => {
        e.stopPropagation();
        // Remove the node
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        // Remove connected edges
        setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
    };

    return (
        <div
            className={clsx(
                "group relative min-w-[220px] max-w-[280px] rounded-xl transition-all duration-200",
                selected
                    ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0a0a0b] shadow-xl shadow-amber-500/25"
                    : "hover:shadow-xl hover:shadow-black/50",
                "bg-gradient-to-br from-[#1c1917]/95 to-[#18181b]/95 backdrop-blur-sm border-2",
                selected ? "border-amber-500" : "border-amber-500/30 hover:border-amber-500/60",
                faded && "opacity-30"
            )}
        >
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                className={clsx(
                    "absolute -top-2 -right-2 w-5 h-5 rounded-full",
                    "bg-red-500/90 hover:bg-red-500 text-white",
                    "flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-all duration-150",
                    "shadow-lg hover:scale-110 z-10"
                )}
            >
                <X size={12} strokeWidth={2.5} />
            </button>

            {/* Client Badge */}
            <div className="absolute -top-2 left-4">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold uppercase tracking-wider shadow-lg">
                    Client
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-3">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                    {Icon && <Icon size={20} strokeWidth={2} />}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                        {label}
                    </h4>
                    <p className="text-[11px] text-amber-400/80 truncate">
                        {clientName || 'Client Project'}
                    </p>
                </div>
            </div>

            {/* Description */}
            {description && (
                <div className="px-4 pb-4">
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
            )}

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-[#1c1917] !rounded-full !-left-2 hover:!scale-125 transition-transform"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-[#1c1917] !rounded-full !-right-2 hover:!scale-125 transition-transform"
            />
        </div>
    );
};

export default memo(ClientNode);
