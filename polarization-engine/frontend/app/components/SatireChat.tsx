import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
}

interface SatireChatProps {
    bias: number;
    fullPage?: boolean;
}

export default function SatireChat({ bias, fullPage = false }: SatireChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getPersona = () => {
        if (bias < -0.3) return 'left';
        if (bias > 0.3) return 'right';
        return 'center';
    }

    const persona = getPersona();

    // Initial Greeting
    useEffect(() => {
        const greetings = {
            left: "Did you check your privilege before logging in today? I'm watching you.",
            right: "Welcome, patriot. Let's make this chat stream great again. No snowflakes allowed.",
            center: "Greetings, undecided voter. I am equally disappointed in everyone."
        };

        setMessages([{
            id: 'init',
            sender: 'bot',
            text: greetings[persona]
        }]);
    }, [persona]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Real API Call
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // @ts-ignore
            const axios = (await import('axios')).default;
            const res = await axios.post('http://localhost:8000/chat', {
                message: input,
                persona: persona
            });

            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: res.data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Error connecting to the hive mind." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50/50 ${fullPage ? '' : 'border-t border-gray-200'}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${persona === 'left' ? 'bg-red-500' : persona === 'right' ? 'bg-blue-800' : 'bg-gray-400'}`} />
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
                        {persona === 'left' ? 'Comrade AI' : persona === 'right' ? 'Patriot Bot' : 'Centrist Net'}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${fullPage ? '' : 'max-h-[300px]'}`}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 text-gray-500 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-200">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${persona === 'left' ? 'Comrade AI' : persona === 'right' ? 'Patriot Bot' : 'Centrist Net'}...`}
                        className="w-full pl-6 pr-14 py-4 text-base bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:bg-white transition-all shadow-sm"
                        autoFocus={fullPage}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
