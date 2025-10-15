import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface ExamplePromptsProps {
    onPromptClick: (prompt: string) => void;
}

const prompts = [
    {
        title: "আইন সম্পর্কে জানুন",
        prompt: "ভূমি উন্নয়ন কর আইন, ২০২৩ সম্পর্কে সহজ ভাষায় ব্যাখ্যা করুন।",
        icon: "⚖️"
    },
    {
        title: "সরকারি সেবা খুঁজুন",
        prompt: "কিভাবে একটি ট্রেড লাইসেন্স আবেদন করতে হয়?",
        icon: "📝"
    },
    {
        title: "গেজেট খুঁজুন",
        prompt: "২০২৩ সালের নতুন আয়কর আইন সম্পর্কিত গেজেটটি খুঁজুন।",
        icon: "📰"
    },
    {
        title: "ভাষারীতি রূপান্তর",
        prompt: "'এতদ্দ্বারা সর্বসাধারণের অবগতির জন্য জানানো যাইতেছে যে...' বাক্যটিকে চলিত বাংলায় রূপান্তর করুন।",
        icon: "🌐"
    }
];

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptClick }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-brand-green/20">
                <LogoIcon className="h-16 w-16 object-contain rounded-full text-brand-dark" />
            </div>
            <h2 className="text-2xl font-bold font-bengali text-brand-dark">অপরূপা আপনাকে কিভাবে সাহায্য করতে পারে?</h2>
            <p className="text-gray-500 mt-2 mb-8 max-w-lg">
                আমি বাংলাদেশের আইন, সরকারি প্রক্রিয়া এবং আইনি নথি অনুবাদে আপনাকে সহায়তা করতে পারি। স্বচ্ছতা বৃদ্ধি এবং দুর্নীতি প্রতিরোধই আমার লক্ষ্য।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {prompts.map((p) => (
                    <button
                        key={p.title}
                        onClick={() => onPromptClick(p.prompt)}
                        className="bg-green-50 text-left p-4 rounded-lg hover:bg-green-100 border border-green-200 transition-colors duration-200 flex items-center space-x-3"
                    >
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                            <p className="font-semibold text-brand-dark font-bengali">{p.title}</p>
                            <p className="text-sm text-gray-600 font-bengali mt-1">{p.prompt}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExamplePrompts;