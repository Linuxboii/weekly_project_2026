import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import clsx from 'clsx';
import { X, Box } from 'lucide-react';
import { NODE_STATUS, getNodeTemplate } from '../data/nodeData';

const ArchitectureNode = ({ id, data, selected }) => {
    const { setNodes, setEdges } = useReactFlow();

    const {
        label,
        description,
        templateId,
        category,
        status = NODE_STATUS.ACTIVE,
        inputs = [],
        outputs = [],
        faded = false
    } = data;

    // Look up icon from template (icons can't be serialized to JSON)
    const template = templateId ? getNodeTemplate(templateId) : null;
    const Icon = template?.icon || Box;

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
                "group relative min-w-[180px] max-w-[240px] rounded-xl transition-all duration-200",
                selected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-[#0a0a0b] shadow-xl shadow-primary/25"
                    : "hover:shadow-xl hover:shadow-black/50",
                "bg-[#18181b]/90 backdrop-blur-sm border",
                selected ? "border-primary" : "border-[#27272a] hover:border-[#404045]",
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

            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-3">
                {/* Icon */}
                <div className={clsx(
                    "flex items-center justify-center w-9 h-9 rounded-lg text-white shadow-md",
                    category?.bgColor || 'bg-gray-500'
                )}>
                    {Icon && <Icon size={18} strokeWidth={2} />}
                </div>

                {/* Title & Category */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-gray-100 truncate leading-tight">
                        {label}
                    </h4>
                    <span className={clsx(
                        "inline-block text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide mt-1",
                        category?.bgColor,
                        "text-white/90"
                    )}>
                        {category?.id || 'node'}
                    </span>
                </div>
            </div>

            {/* Description */}
            {description && (
                <div className="px-3 pb-3">
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
            )}

            {/* Input Handles */}
            {inputs.map((input, index) => (
                <Handle
                    key={`input-${input.id}`}
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    style={{
                        top: `${30 + (index * 20)}%`,
                        left: -6
                    }}
                    className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#18181b] !rounded-full hover:!scale-125 transition-transform"
                />
            ))}

            {/* Output Handles */}
            {outputs.map((output, index) => (
                <Handle
                    key={`output-${output.id}`}
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    style={{
                        top: `${30 + (index * 20)}%`,
                        right: -6
                    }}
                    className="!w-3 !h-3 !bg-green-500 !border-2 !border-[#18181b] !rounded-full hover:!scale-125 transition-transform"
                />
            ))}

            {/* Fallback handles if no specific ports */}
            {inputs.length === 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-[#3a3a3e] !border-2 !border-[#18181b] !rounded-full !-left-1.5 hover:!bg-blue-500 hover:!scale-125 transition-all"
                />
            )}
            {outputs.length === 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-[#3a3a3e] !border-2 !border-[#18181b] !rounded-full !-right-1.5 hover:!bg-green-500 hover:!scale-125 transition-all"
                />
            )}
        </div>
    );
};

export default memo(ArchitectureNode);
