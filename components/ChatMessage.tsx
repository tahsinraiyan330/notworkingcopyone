import React, { useState } from 'react';
import { Message } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import SourcePill from './SourcePill';

interface ChatMessageProps {
    message: Message;
    onSuggestionClick: (prompt: string) => void;
    showSuggestions: boolean;
}

const DISCLAIMER = "\n\n*Disclaimer: This is for informational purposes only and is not legal advice. Please consult with a qualified lawyer for legal matters.*";

const parseMarkdown = (text: string) => {
    let processedText = text;

    // Utility to parse inline markdown.
    const parseInline = (str: string) => {
        return str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-gray-800 text-sm rounded px-1 py-0.5 font-mono">$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    };

    // Block: Tab-separated Tables (Heuristic for non-standard markdown)
    // This regex looks for 2 or more consecutive lines that contain tabs but no pipes, to avoid conflicting with markdown tables.
    const tabTableRegex = /^((?:[^\n\r|]*\t[^\n\r]*)(?:\r?\n|$)){2,}/gm;
    processedText = processedText.replace(tabTableRegex, (match) => {
        const rows = match.trim().split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) return match;

        const headerCells = rows[0].split('\t').map(c => parseInline(c.trim()));
        const bodyRows = rows.slice(1).map(row => row.split('\t').map(c => parseInline(c.trim())));

        const headerHtml = `<thead><tr>${headerCells.map(cell => `<th class="bg-gray-100 p-2 border border-gray-300 text-left font-semibold text-sm text-gray-800">${cell}</th>`).join('')}</tr></thead>`;
        const bodyHtml = `<tbody>${bodyRows.map(row => `<tr class="odd:bg-white even:bg-gray-50">${row.map(cell => `<td class="p-2 border border-gray-300 text-sm text-gray-800">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
        
        return `<div class="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-sm"><table class="w-full border-collapse">${headerHtml}${bodyHtml}</table></div>`;
    });

    // Block: Standard Markdown Tables
    const tableRegex = /^\|(.+)\r?\n\|( *[-:]+[-| :]*)\r?\n((?:\|.*(?:\r?\n|$))+)/gm;
    processedText = processedText.replace(tableRegex, (match, header, separator, body) => {
        const headerCells = header.split('|').slice(1, -1).map(h => parseInline(h.trim()));
        const bodyRows = body.trim().split('\n').map(row => row.split('|').slice(1, -1).map(c => parseInline(c.trim())));

        const headerHtml = `<thead><tr>${headerCells.map(cell => `<th class="bg-gray-100 p-2 border border-gray-300 text-left font-semibold text-sm text-gray-800">${cell}</th>`).join('')}</tr></thead>`;
        const bodyHtml = `<tbody>${bodyRows.map(row => `<tr class="odd:bg-white even:bg-gray-50">${row.map(cell => `<td class="p-2 border border-gray-300 text-sm text-gray-800">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-sm"><table class="w-full border-collapse">${headerHtml}${bodyHtml}</table></div>`;
    });

    // Block: Unordered Lists
    const ulRegex = /(?:^|\n)((?:\s*\* .+\n?)+)/g;
    processedText = processedText.replace(ulRegex, (match) => {
        const items = match.trim().split('\n');
        const listItemsHtml = items.map(item => `<li>${parseInline(item.replace(/^\s*\* /, '').trim())}</li>`).join('');
        return `<ul class="list-disc list-inside my-2 pl-4 space-y-1">${listItemsHtml}</ul>`;
    });

    // Block: Ordered Lists
    const olRegex = /(?:^|\n)((?:\s*\d+\. .+\n?)+)/g;
    processedText = processedText.replace(olRegex, (match) => {
        const items = match.trim().split('\n');
        const listItemsHtml = items.map(item => `<li>${parseInline(item.replace(/^\s*\d+\. /, '').trim())}</li>`).join('');
        return `<ol class="list-decimal list-inside my-2 pl-4 space-y-1">${listItemsHtml}</ol>`;
    });

    // Process remaining text into paragraphs
    const remainingHtml = processedText.split(/\n\s*\n/).map(paragraph => {
        if (paragraph.startsWith('<ul') || paragraph.startsWith('<ol') || paragraph.startsWith('<div')) {
            return paragraph; // Already-processed HTML
        }
        if (paragraph.trim() === '') {
            return '';
        }
        // Process inline styles and convert single newlines to <br>
        return `<p>${parseInline(paragraph).replace(/\n/g, '<br />')}</p>`;
    }).join('');

    return remainingHtml;
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick, showSuggestions }) => {
    const [isCopied, setIsCopied] = useState(false);
    const isModel = message.role === 'model';

    const handleCopy = () => {
        const textToCopy = message.content.replace(DISCLAIMER, '').trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    const formattedContent = parseMarkdown(message.content);

    if (isModel && message.content === '...') {
        return (
            <div className="flex items-start space-x-3">
                <div className="p-2 bg-brand-green rounded-full text-white flex-shrink-0">
                    <BotIcon />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-start space-x-3 ${isModel ? '' : 'justify-end'}`}>
            {isModel && (
                <div className="p-2 bg-brand-green rounded-full text-white flex-shrink-0">
                    <BotIcon />
                </div>
            )}
            <div
                className={`group relative rounded-lg p-3 max-w-xl text-brand-dark break-words ${isModel ? 'bg-gray-100' : 'bg-green-100'}`}
            >
                <div 
                    className="prose prose-sm max-w-none font-bengali space-y-4" 
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                />

                {isModel && message.content !== '...' && (
                     <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Copy to clipboard"
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                )}

                {isModel && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Sources:</h4>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, index) => (
                                <SourcePill key={index} uri={source.uri} title={source.title} />
                            ))}
                        </div>
                    </div>
                )}

                {showSuggestions && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-300">
                        <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="bg-white text-brand-green border border-green-200 text-sm px-3 py-1.5 rounded-full hover:bg-green-50 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 font-medium"
                                    aria-label={`Ask: ${suggestion}`}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {!isModel && (
                <div className="p-2 bg-gray-300 rounded-full text-brand-dark flex-shrink-0">
                    <UserIcon />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;