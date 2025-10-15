
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import ExamplePrompts from './ExamplePrompts';
import { SendIcon } from './icons/SendIcon';
import { v4 as uuidv4 } from 'uuid';

const DISCLAIMER = "\n\n*Disclaimer: This is for informational purposes only and is not legal advice. Please consult with a qualified lawyer for legal matters.*";

interface ChatInterfaceProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = useCallback(async (prompt?: string) => {
        const messageContent = prompt || input;
        if (!messageContent.trim() || isLoading) return;

        setError(null);
        setIsLoading(true);
        const userMessage: Message = { id: uuidv4(), role: 'user', content: messageContent };
        
        const modelMessageId = uuidv4();
        const placeholderMessage: Message = { id: modelMessageId, role: 'model', content: '...', sources: [], suggestions: [] };

        setMessages(prev => [...prev, userMessage, placeholderMessage]);
        setInput('');

        try {
            const stream = await sendMessageStream(messageContent);
            
            let fullResponseText = '';
            const collectedSources: { uri: string; title: string }[] = [];
            const seenUris = new Set<string>();
            
            for await (const chunk of stream) {
                fullResponseText += chunk.text;

                const newSources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (newSources) {
                    newSources.forEach((source: any) => { 
                        if (source.web?.uri && !seenUris.has(source.web.uri)) {
                            seenUris.add(source.web.uri);
                            collectedSources.push({
                                uri: source.web.uri,
                                title: source.web.title || source.web.uri,
                            });
                        }
                    });
                }

                // Temporarily update content, clean out suggestion tags for smoother streaming display
                const contentToDisplay = fullResponseText.replace(/<suggestions>[\s\S]*<\/suggestions>/, '');

                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, content: contentToDisplay, sources: [...collectedSources] } : msg
                ));
            }

            // After stream is done, parse for suggestions and finalize the message
            const suggestionsMatch = fullResponseText.match(/<suggestions>([\s\S]*)<\/suggestions>/);
            const extractedSuggestions: string[] = [];
            let finalContent = fullResponseText;

            if (suggestionsMatch) {
                finalContent = fullResponseText.replace(suggestionsMatch[0], '').trim();
                const suggestionText = suggestionsMatch[1];
                const suggestionMatches = [...suggestionText.matchAll(/<suggestion>(.*?)<\/suggestion>/g)];
                suggestionMatches.forEach(match => {
                    if (match[1]) extractedSuggestions.push(match[1].trim());
                });
            }

            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { 
                    ...msg, 
                    content: finalContent + DISCLAIMER, 
                    sources: collectedSources, 
                    suggestions: extractedSuggestions 
                } : msg
            ));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, content: `Sorry, I encountered an error: ${errorMessage}` } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, setMessages]);

    const handlePromptClick = (prompt: string) => {
        handleSend(prompt);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <ExamplePrompts onPromptClick={handlePromptClick} />
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <ChatMessage 
                                key={msg.id} 
                                message={msg} 
                                onSuggestionClick={handlePromptClick}
                                showSuggestions={msg.role === 'model' && index === messages.length - 1 && !isLoading}
                            />
                        ))}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            {error && <div className="p-4 text-red-600 bg-red-100 border-t border-red-200 text-sm">{error}</div>}
            <div className="border-t p-4 bg-white">
                 <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex items-center space-x-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="আপনার প্রশ্ন জিজ্ঞাসা করুন (Ask your question)..."
                        className="flex-grow p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-shadow w-full bg-gray-50"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-brand-green text-white rounded-full p-3 hover:bg-brand-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                    >
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;