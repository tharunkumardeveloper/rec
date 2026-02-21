import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: Array<{
    type: string;
    label: string;
    payload: any;
  }>;
}

export interface UserContext {
  userName: string;
  userRole: 'athlete' | 'coach' | 'admin';
  recentWorkouts: Array<{
    name: string;
    date: string;
    reps: number;
    score: number;
  }>;
  currentStats: {
    totalWorkouts: number;
    weeklyStreak: number;
    badges: number;
  };
}

interface ChatWidgetProps {
  currentTab: 'training' | 'discover' | 'report' | 'roadmap';
  userContext: UserContext;
  onNavigate?: (destination: string, payload?: any) => void;
}

const ChatWidget = ({ currentTab, userContext, onNavigate }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('fitfranken_chat_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === '1.0' && Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else {
      // First time user - add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hey athlete! 👻 I'm FitFranken, your AI fitness coach. What can I help you with?`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const toStore = {
        version: '1.0',
        lastUpdated: Date.now(),
        messages: messages.slice(-50), // Keep last 50 messages
        sessionId: Date.now().toString()
      };
      localStorage.setItem('fitfranken_chat_history', JSON.stringify(toStore));
    }
  }, [messages]);

  // Show notification dot when chat is closed and new message arrives
  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Hey athlete! 👻 Starting fresh. What can I help you with?`,
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('fitfranken_chat_history');
  };

  return (
    <>
      {/* Floating Chat Button (Minimized State) */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-[1000] h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Open FitFranken Chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {hasNewMessage && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      )}

      {/* Chat Interface (Expanded State) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-[1000] w-[calc(100vw-2rem)] max-w-md h-[70vh] lg:h-[650px] lg:w-[420px] shadow-2xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <ChatInterface
            messages={messages}
            setMessages={setMessages}
            currentTab={currentTab}
            userContext={userContext}
            onClose={handleClose}
            onClearHistory={handleClearHistory}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
