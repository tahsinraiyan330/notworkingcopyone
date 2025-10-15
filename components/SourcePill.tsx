import React from 'react';
import { LinkIcon } from './icons/LinkIcon';

interface SourcePillProps {
    uri: string;
    title: string;
}

const SourcePill: React.FC<SourcePillProps> = ({ uri, title }) => {
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    return (
        <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            title={title}
        >
            <LinkIcon />
            <span className="truncate">{displayTitle}</span>
        </a>
    );
};

export default SourcePill;
