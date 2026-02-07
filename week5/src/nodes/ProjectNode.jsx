import React, { memo } from 'react';
import { FolderGit2 } from 'lucide-react';
import BaseNode from './BaseNode';

const ProjectNode = ({ data, selected }) => {
    return (
        <BaseNode
            title={data.label || 'Project'}
            icon={FolderGit2}
            color="bg-orange-500"
            selected={selected}
        >
            <p className="text-gray-400 leading-relaxed line-clamp-2">
                {data.description || "No description"}
            </p>
        </BaseNode>
    );
};

export default memo(ProjectNode);
