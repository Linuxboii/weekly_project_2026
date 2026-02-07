import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath } from 'reactflow';
import { EDGE_TYPES } from '../data/nodeData';

export function DataFlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: EDGE_TYPES.DATA.color,
                    strokeWidth: EDGE_TYPES.DATA.strokeWidth,
                    ...style
                }}
            />
            {/* Animated flow indicator */}
            <circle r="4" fill={EDGE_TYPES.DATA.color}>
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </circle>
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="px-2 py-1 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export function ControlFlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: EDGE_TYPES.CONTROL.color,
                    strokeWidth: EDGE_TYPES.CONTROL.strokeWidth,
                    strokeDasharray: EDGE_TYPES.CONTROL.dashArray,
                    ...style
                }}
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="px-2 py-1 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export function DependencyEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.3,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: EDGE_TYPES.DEPENDENCY.color,
                    strokeWidth: EDGE_TYPES.DEPENDENCY.strokeWidth,
                    strokeDasharray: EDGE_TYPES.DEPENDENCY.dashArray,
                    opacity: 0.6,
                    ...style
                }}
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="px-2 py-1 rounded text-[10px] bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const edgeTypes = {
    data: DataFlowEdge,
    control: ControlFlowEdge,
    dependency: DependencyEdge,
};
