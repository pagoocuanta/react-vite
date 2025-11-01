import { useState } from 'react';
import { Heart, ThumbsUp, Flame, Check, Filter, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewPostModal } from '@/components/NewPostModal';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  tags: string[];
  reactions: {
    heart: number;
    thumbsUp: number;
    flame: number;
    check: number;
  };
  userReacted?: 'heart' | 'thumbsUp' | 'flame' | 'check';
  isRead: boolean;
  isImportant: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Nieuwe werkroosters voor volgende week',
    description: 'Het rooster voor week 47 is nu beschikbaar. Controleer je shifts en meld eventuele wijzigingen voor vrijdag.',
    date: '2024-01-15T10:00:00Z',
    tags: ['Planning', 'Rooster'],
    reactions: { heart: 8, thumbsUp: 15, flame: 2, check: 12 },
    userReacted: 'check',
    isRead: true,
    isImportant: true,
  },
  {
    id: '2',
    title: 'Team uitje vrijdag 🎉',
    description: 'Vergeet niet: vrijdag na werk gaan we samen bowlen! Verzamelen om 18:00 bij de hoofdingang.',
    date: '2024-01-14T14:30:00Z',
    tags: ['HR', 'Event'],
    reactions: { heart: 23, thumbsUp: 8, flame: 15, check: 5 },
    userReacted: 'heart',
    isRead: false,
    isImportant: false,
  },
  {
    id: '3',
    title: 'Nieuwe veiligheidsprocedures',
    description: 'Er zijn updates in onze veiligheidsprocedures. Lees het document door en bevestig dat je het hebt gelezen.',
    date: '2024-01-13T09:15:00Z',
    tags: ['Belangrijk', 'Veiligheid'],
    reactions: { heart: 2, thumbsUp: 18, flame: 1, check: 25 },
    isRead: true,
    isImportant: true,
  },
];

const reactionIcons = {
  heart: Heart,
  thumbsUp: ThumbsUp,
  flame: Flame,
  check: Check,
};

const reactionColors = {
  heart: 'text-red-500',
  thumbsUp: 'text-gruppy-blue',
  flame: 'text-orange-500',
  check: 'text-gruppy-green',
};

export default function Index() {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [posts, setPosts] = useState(mockPosts);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const filters = [
    { key: 'all', label: t('news.filter.all') },
    { key: 'important', label: t('news.filter.important') },
    { key: 'hr', label: t('news.filter.hr') },
    { key: 'planning', label: t('news.filter.planning') },
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'important') return post.isImportant;
    return post.tags.some(tag => tag.toLowerCase().includes(selectedFilter));
  });

  const handleReaction = (postId: string, reaction: keyof Post['reactions']) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newReactions = { ...post.reactions };
        
        // Remove previous reaction if any
        if (post.userReacted) {
          newReactions[post.userReacted]--;
        }
        
        // Add new reaction or remove if same
        if (post.userReacted === reaction) {
          return { ...post, userReacted: undefined, reactions: newReactions };
        } else {
          newReactions[reaction]++;
          return { ...post, userReacted: reaction, reactions: newReactions };
        }
      }
      return post;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNewPost = (newPost: {
    title: string;
    description: string;
    tags: string[];
    isImportant: boolean;
    image?: File;
  }) => {
    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      description: newPost.description,
      tags: newPost.tags,
      date: new Date().toISOString(),
      reactions: { heart: 0, thumbsUp: 0, flame: 0, check: 0 },
      isRead: false,
      isImportant: newPost.isImportant,
    };

    setPosts(prevPosts => [post, ...prevPosts]);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('news.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Blijf op de hoogte van het laatste nieuws en aankondigingen
          </p>
        </div>
        <Button
          onClick={() => setIsNewPostModalOpen(true)}
          className="bg-gruppy-orange hover:bg-gruppy-orange/90 text-white self-start sm:self-auto animate-bounce-gentle"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={selectedFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.key)}
            className={cn(
              "flex-shrink-0",
              selectedFilter === filter.key && "bg-gruppy-orange hover:bg-gruppy-orange/90"
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className={cn(
              "bg-card rounded-2xl shadow-sm border border-border p-6 transition-all duration-200 hover:shadow-md",
              !post.isRead && "border-l-4 border-l-gruppy-orange"
            )}
          >
            {/* Post Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {post.title}
                  </h2>
                  {post.isImportant && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      Belangrijk
                    </Badge>
                  )}
                  {!post.isRead && (
                    <Badge className="bg-gruppy-orange-light text-gruppy-orange text-xs">
                      Nieuw
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(post.date)}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-foreground mb-4 leading-relaxed">
              {post.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              {Object.entries(post.reactions).map(([reaction, count]) => {
                const Icon = reactionIcons[reaction as keyof typeof reactionIcons];
                const isUserReacted = post.userReacted === reaction;
                
                return (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(post.id, reaction as keyof Post['reactions'])}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-muted group",
                      isUserReacted && "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isUserReacted
                          ? reactionColors[reaction as keyof typeof reactionColors]
                          : "text-muted-foreground group-hover:scale-110"
                      )}
                      fill={isUserReacted ? "currentColor" : "none"}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isUserReacted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Geen berichten gevonden
          </h3>
          <p className="text-muted-foreground">
            Probeer een ander filter of kom later terug voor nieuwe updates.
          </p>
        </div>
      )}

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}
