import { useState, useRef, useEffect } from 'react';
import { X, Trash2, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import type { Message, UserContext } from './ChatWidget';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentTab: string;
  userContext: UserContext;
  onClose: () => void;
  onClearHistory: () => void;
  onNavigate?: (destination: string, payload?: any) => void;
}

const ChatInterface = ({
  messages,
  setMessages,
  currentTab,
  userContext,
  onClose,
  onClearHistory,
  onNavigate
}: ChatInterfaceProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userContext,
          currentTab,
          userId: userContext.userName
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error.message || "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setShowClearConfirm(false);
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      training: 'Training',
      discover: 'Discover',
      report: 'Report',
      roadmap: 'Roadmap'
    };
    return labels[tab] || tab;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white border-b border-purple-900">
        <div className="flex items-center space-x-2">
          <Ghost className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">FitFranken</h3>
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-100 text-xs border-purple-700">
              {getTabLabel(currentTab)} Tab
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearClick}
            className="text-white hover:bg-purple-700 h-8 w-8 p-0"
            aria-label="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-purple-700 h-8 w-8 p-0"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm">
          <p className="text-yellow-800 mb-2">Clear all chat history?</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="destructive" onClick={handleConfirmClear}>
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelClear}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          onNavigate={onNavigate}
        />
      </div>

      {/* Input */}
      <div className="border-t bg-background">
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatInterface;
