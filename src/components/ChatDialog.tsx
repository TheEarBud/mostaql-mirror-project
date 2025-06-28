
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatDialogProps {
  projectId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  triggerText: string;
}

const ChatDialog = ({ projectId, receiverId, receiverName, receiverAvatar, triggerText }: ChatDialogProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], refetch } = useMessages(projectId);
  const sendMessageMutation = useSendMessage();

  // Filter messages between current user and receiver
  const chatMessages = messages.filter(msg => 
    (msg.sender_id === user?.id && msg.receiver_id === receiverId) ||
    (msg.sender_id === receiverId && msg.receiver_id === user?.id)
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      project_id: projectId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim()
    }, {
      onSuccess: () => {
        setNewMessage('');
        // Scroll to bottom after sending
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to send message');
      }
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages.length, isOpen]);

  // Refresh messages when dialog opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-4 w-4 mr-1" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-96">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={receiverAvatar} />
              <AvatarFallback>
                {receiverName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            Chat with {receiverName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
