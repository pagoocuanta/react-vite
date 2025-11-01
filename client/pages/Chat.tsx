import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  Image, 
  MoreVertical, 
  Search, 
  UserPlus, 
  Volume2, 
  VolumeX,
  LogOut,
  Users,
  User,
  CheckCheck,
  Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  isDelivered: boolean;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: string[];
  isOnline?: boolean;
  isMuted: boolean;
  avatar?: string;
}

const mockChats: Chat[] = [
  {
    id: 'ai',
    name: 'AI Assistent',
    isGroup: false,
    lastMessage: 'Hoe kan ik je helpen vandaag?',
    lastMessageTime: '09:30',
    unreadCount: 0,
    participants: ['AI'],
    isOnline: true,
    isMuted: false,
  },
  {
    id: '1',
    name: 'Team Kassa',
    isGroup: true,
    lastMessage: 'Lisa: Perfect, dan zie ik jullie morgen!',
    lastMessageTime: '14:22',
    unreadCount: 3,
    participants: ['Emma', 'Lisa', 'Tom', 'Sarah'],
    isMuted: false,
  },
  {
    id: '2',
    name: 'Manager Overleg',
    isGroup: true,
    lastMessage: 'Mike: De cijfers van deze week zien er goed uit',
    lastMessageTime: '13:45',
    unreadCount: 1,
    participants: ['Mike', 'Anna', 'David'],
    isMuted: false,
  },
  {
    id: '3',
    name: 'Emma Jansen',
    isGroup: false,
    lastMessage: 'Je: Oké, tot dan!',
    lastMessageTime: '12:10',
    unreadCount: 0,
    participants: ['Emma'],
    isOnline: true,
    isMuted: false,
  },
  {
    id: '4',
    name: 'Weekend Shift',
    isGroup: true,
    lastMessage: 'Tom: Wie kan zaterdag de late shift doen?',
    lastMessageTime: '11:30',
    unreadCount: 5,
    participants: ['Tom', 'Lisa', 'Mark'],
    isMuted: true,
  },
];

const initialMockMessages: { [key: string]: Message[] } = {
  'ai': [
    {
      id: '1',
      text: 'Hoi! Ik ben je AI assistent. Ik kan je helpen met vragen over roosters, taken, bedrijfsinformatie en meer. Wat wil je weten?',
      sender: 'AI Assistent',
      timestamp: '09:30',
      isOwn: false,
      isRead: true,
      isDelivered: true,
    },
    {
      id: '2',
      text: 'Wat is mijn rooster voor morgen?',
      sender: 'Jij',
      timestamp: '09:31',
      isOwn: true,
      isRead: true,
      isDelivered: true,
    },
    {
      id: '3',
      text: 'Je hebt morgen een ochtendshift van 08:00 tot 16:00. Je werkt samen met Emma en Lisa aan de kassa.',
      sender: 'AI Assistent',
      timestamp: '09:31',
      isOwn: false,
      isRead: true,
      isDelivered: true,
    },
  ],
  '1': [
    {
      id: '1',
      text: 'Hoi allemaal! Zijn we klaar voor de weekend rush?',
      sender: 'Emma',
      timestamp: '14:15',
      isOwn: false,
      isRead: true,
      isDelivered: true,
    },
    {
      id: '2',
      text: 'Ja! Ik heb alle voorraad gecontroleerd',
      sender: 'Tom',
      timestamp: '14:18',
      isOwn: false,
      isRead: true,
      isDelivered: true,
    },
    {
      id: '3',
      text: 'Perfect! En de kassa\'s zijn ook bijgevuld',
      sender: 'Jij',
      timestamp: '14:20',
      isOwn: true,
      isRead: true,
      isDelivered: true,
    },
    {
      id: '4',
      text: 'Perfect, dan zie ik jullie morgen!',
      sender: 'Lisa',
      timestamp: '14:22',
      isOwn: false,
      isRead: false,
      isDelivered: true,
    },
  ],
};

// AI Response System
const getAIResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();

  if (msg.includes('rooster') || msg.includes('schema') || msg.includes('shift')) {
    return 'Je hebt morgen een ochtendshift van 08:00 tot 16:00. Je werkt samen met Emma en Lisa aan de kassa. Volgende week heb je vrijdag en zaterdag vrij.';
  }

  if (msg.includes('taken') || msg.includes('todo') || msg.includes('opdracht')) {
    return 'Je hebt 3 openstaande taken: 1) Inventaris bijwerken (deadline: vrijdag), 2) Nieuwe medewerker inwerken, 3) Kassasysteem testen. Wil je meer details over een specifieke taak?';
  }

  if (msg.includes('team') || msg.includes('collega') || msg.includes('wie werkt')) {
    return 'Vandaag werken er 8 mensen: Emma (kassa), Tom (voorraad), Lisa (klantenservice), Sarah (kassa), Mike (manager), Anna (HR), David (beveiliging), en jij. Emma en Lisa zijn nu online.';
  }

  if (msg.includes('pauze') || msg.includes('break') || msg.includes('lunch')) {
    return 'Je lunchpauze is vandaag van 12:30 tot 13:15. Er is nog koffie in de personeelsruimte en de lunch menu van vandaag heeft sandwich tonijn en soep tomaat.';
  }

  if (msg.includes('weer') || msg.includes('weather')) {
    return 'Het is vandaag 18°C en bewolkt. Perfecte weer voor binnen werken! Vergeet niet een jasje mee te nemen als je naar buiten gaat.';
  }

  if (msg.includes('verlof') || msg.includes('vakantie') || msg.includes('vrij')) {
    return 'Je hebt nog 12 vakantiedagen over dit jaar. Wil je verlof aanvragen? Je kunt dit doen via het HR portaal of ik kan je helpen met de aanvraag.';
  }

  if (msg.includes('hoi') || msg.includes('hallo') || msg.includes('hey')) {
    return 'Hoi! Fijn dat je er bent. Hoe kan ik je vandaag helpen? Ik kan je informatie geven over roosters, taken, team info, en nog veel meer!';
  }

  if (msg.includes('dank') || msg.includes('bedankt')) {
    return 'Graag gedaan! Als je nog meer vragen hebt, vraag maar raak. Ik ben er altijd om je te helpen! 😊';
  }

  // Default responses for unknown queries
  const defaultResponses = [
    'Dat is een interessante vraag! Ik kan je helpen met roosters, taken, team informatie, verlof, en algemene bedrijfsvragen. Kun je je vraag iets specifieker maken?',
    'Ik ben hier om je te helpen! Probeer eens vragen te stellen over je rooster, openstaande taken, of wie er vandaag werkt.',
    'Hmm, ik begrijp je vraag niet helemaal. Ik kan je het beste helpen met rooster informatie, taak beheer, team updates, en HR vragen. Wat wil je weten?'
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export default function Chat() {
  const { t } = useLanguage();
  const [selectedChat, setSelectedChat] = useState<string>('ai');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(initialMockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = messages[selectedChat] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'Jij',
      timestamp,
      isOwn: true,
      isRead: true,
      isDelivered: true,
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), userMessage]
    }));

    // If it's AI chat, generate AI response
    if (selectedChat === 'ai') {
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(textToSend),
          sender: 'AI Assistent',
          timestamp: new Date().toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isOwn: false,
          isRead: true,
          isDelivered: true,
        };

        setMessages(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), aiResponse]
        }));

        setIsTyping(false);
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    }

    setMessage('');
  };

  const handleChatAction = (action: string, chatId: string) => {
    console.log(`${action} for chat ${chatId}`);
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-24px)] bg-background animate-fade-in">
      {/* Chat List Sidebar */}
      <div className="w-full md:w-80 bg-card border-r md:border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">{t('nav.chat')}</h1>
            <Button size="sm" className="bg-gruppy-orange hover:bg-gruppy-orange/90">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Zoek gesprekken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* AI Chat - Pinned at top */}
        <div className="p-2 bg-gruppy-orange-light/10 border-b border-gruppy-orange/20">
          <div
            onClick={() => setSelectedChat('ai')}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
              selectedChat === 'ai'
                ? "bg-gruppy-orange/10 border border-gruppy-orange/20"
                : "hover:bg-gruppy-orange/5"
            )}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gruppy-orange to-gruppy-blue rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground truncate">AI Assistent</h3>
                <span className="text-xs text-muted-foreground">09:30</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                Hoe kan ik je helpen vandaag?
              </p>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.filter(chat => chat.id !== 'ai').map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50",
                selectedChat === chat.id
                  ? "bg-gruppy-blue-light/10 border-l-4 border-l-gruppy-blue"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-gruppy-blue to-gruppy-purple rounded-full flex items-center justify-center">
                  {chat.isGroup ? (
                    <Users className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                {chat.isOnline && !chat.isGroup && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                    {chat.isMuted && <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-gruppy-orange text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
                {chat.isGroup && (
                  <p className="text-xs text-muted-foreground">
                    {chat.participants.length} deelnemers
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gruppy-blue to-gruppy-purple rounded-full flex items-center justify-center">
                    {selectedChat === 'ai' ? (
                      <Bot className="h-5 w-5 text-white" />
                    ) : mockChats.find(c => c.id === selectedChat)?.isGroup ? (
                      <Users className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {mockChats.find(c => c.id === selectedChat)?.name}
                    </h2>
                    {selectedChat === 'ai' ? (
                      <p className="text-sm text-gruppy-green">Online - AI Assistent</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {mockChats.find(c => c.id === selectedChat)?.isGroup 
                          ? `${mockChats.find(c => c.id === selectedChat)?.participants.length} deelnemers`
                          : 'Laatst gezien vandaag'
                        }
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[70%] px-4 py-2 rounded-2xl animate-fade-in",
                    msg.isOwn
                      ? "bg-gruppy-orange text-white rounded-br-md"
                      : selectedChat === 'ai'
                      ? "bg-gruppy-blue-light text-foreground rounded-bl-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}>
                    {!msg.isOwn && selectedChat !== 'ai' && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.sender}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={cn(
                      "flex items-center justify-end gap-1 mt-1",
                      msg.isOwn ? "text-white/70" : "text-muted-foreground"
                    )}>
                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.isOwn && (
                        msg.isRead ? (
                          <CheckCheck className="h-3 w-3 text-gruppy-blue-light" />
                        ) : msg.isDelivered ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Image className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder={selectedChat === 'ai' ? "Stel een vraag aan de AI..." : "Type een bericht..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-12 rounded-2xl"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    className="absolute right-1 top-1 bg-gruppy-orange hover:bg-gruppy-orange/90 text-white rounded-xl h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedChat === 'ai' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage("Wat is mijn rooster voor morgen?")}
                    className="text-xs hover:bg-gruppy-orange-light hover:border-gruppy-orange transition-all duration-200"
                  >
                    Mijn rooster
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage("Welke taken heb ik nog open?")}
                    className="text-xs hover:bg-gruppy-green-light hover:border-gruppy-green transition-all duration-200"
                  >
                    Mijn taken
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage("Wie werkt er vandaag?")}
                    className="text-xs hover:bg-gruppy-blue-light hover:border-gruppy-blue transition-all duration-200"
                  >
                    Team vandaag
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecteer een gesprek
              </h3>
              <p className="text-muted-foreground">
                Kies een gesprek om te beginnen met chatten
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
