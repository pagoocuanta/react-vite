import { RequestHandler } from "express";
import { Post, ApiResponse, CreatePostRequest, UpdatePostReactionRequest, PaginatedResponse } from "@shared/api";

// Mock data
let mockPosts: Post[] = [
  {
    id: '1',
    title: 'Nieuwe werkroosters voor volgende week',
    description: 'Het rooster voor week 47 is nu beschikbaar. Controleer je shifts en meld eventuele wijzigingen voor vrijdag.',
    date: '2024-01-15T10:00:00Z',
    authorId: '4',
    author: 'Mike Johnson',
    tags: ['Planning', 'Rooster'],
    reactions: { heart: 8, thumbsUp: 15, flame: 2, check: 12 },
    userReactions: {
      '1': 'thumbsUp',
      '2': 'check',
      '3': 'heart',
      '5': 'check'
    },
    isImportant: true,
    readBy: ['1', '2', '3', '5']
  },
  {
    id: '2',
    title: 'Team uitje vrijdag 🎉',
    description: 'Vergeet niet: vrijdag na werk gaan we samen bowlen! Verzamelen om 18:00 bij de hoofdingang.',
    date: '2024-01-14T14:30:00Z',
    authorId: '4',
    author: 'Mike Johnson',
    tags: ['HR', 'Event'],
    reactions: { heart: 23, thumbsUp: 8, flame: 15, check: 5 },
    userReactions: {
      '1': 'heart',
      '2': 'flame',
      '3': 'heart',
      '5': 'heart'
    },
    isImportant: false,
    readBy: ['1', '2', '3']
  },
  {
    id: '3',
    title: 'Nieuwe veiligheidsprocedures',
    description: 'Er zijn updates in onze veiligheidsprocedures. Lees het document door en bevestig dat je het hebt gelezen.',
    date: '2024-01-13T09:15:00Z',
    authorId: '4',
    author: 'Mike Johnson',
    tags: ['Belangrijk', 'Veiligheid'],
    reactions: { heart: 2, thumbsUp: 18, flame: 1, check: 25 },
    userReactions: {
      '1': 'check',
      '2': 'check',
      '3': 'thumbsUp',
      '5': 'check'
    },
    isImportant: true,
    readBy: ['1', '2', '3', '5']
  }
];

// Get all posts
export const getPosts: RequestHandler = (req, res) => {
  const { tag, important, page = '1', limit = '10' } = req.query;
  
  let filteredPosts = [...mockPosts];
  
  // Apply filters
  if (tag && tag !== 'all') {
    filteredPosts = filteredPosts.filter(post => 
      post.tags.some(t => t.toLowerCase().includes((tag as string).toLowerCase()))
    );
  }
  
  if (important === 'true') {
    filteredPosts = filteredPosts.filter(post => post.isImportant);
  }
  
  // Sort by date (newest first)
  filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  const response: ApiResponse<PaginatedResponse<Post>> = {
    success: true,
    data: {
      data: paginatedPosts,
      total: filteredPosts.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < filteredPosts.length
    }
  };
  
  res.json(response);
};

// Get post by ID
export const getPostById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const post = mockPosts.find(p => p.id === id);
  
  if (!post) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Post not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Post> = {
    success: true,
    data: post
  };
  res.json(response);
};

// Create new post
export const createPost: RequestHandler = (req, res) => {
  const postData: CreatePostRequest = req.body;
  
  const newPost: Post = {
    id: Date.now().toString(),
    ...postData,
    date: new Date().toISOString(),
    authorId: '4', // Mock current user (would be from auth)
    author: 'Mike Johnson',
    reactions: { heart: 0, thumbsUp: 0, flame: 0, check: 0 },
    userReactions: {},
    readBy: []
  };
  
  mockPosts.unshift(newPost);
  
  const response: ApiResponse<Post> = {
    success: true,
    data: newPost,
    message: 'Post created successfully'
  };
  
  res.status(201).json(response);
};

// Update post reaction
export const updatePostReaction: RequestHandler = (req, res) => {
  const { postId, reaction }: UpdatePostReactionRequest = req.body;
  const userId = '5'; // Mock current user
  
  const postIndex = mockPosts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Post not found'
    };
    return res.status(404).json(response);
  }

  const post = mockPosts[postIndex];
  const previousReaction = post.userReactions[userId];
  
  // Remove previous reaction if any
  if (previousReaction) {
    post.reactions[previousReaction]--;
  }
  
  // Add new reaction or remove if same
  if (previousReaction === reaction) {
    delete post.userReactions[userId];
  } else {
    post.reactions[reaction]++;
    post.userReactions[userId] = reaction;
  }

  const response: ApiResponse<Post> = {
    success: true,
    data: post,
    message: 'Reaction updated successfully'
  };
  res.json(response);
};

// Mark post as read
export const markPostAsRead: RequestHandler = (req, res) => {
  const { id } = req.params;
  const userId = '5'; // Mock current user
  
  const postIndex = mockPosts.findIndex(p => p.id === id);
  
  if (postIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Post not found'
    };
    return res.status(404).json(response);
  }

  const post = mockPosts[postIndex];
  
  if (!post.readBy.includes(userId)) {
    post.readBy.push(userId);
  }

  const response: ApiResponse<Post> = {
    success: true,
    data: post,
    message: 'Post marked as read'
  };
  res.json(response);
};

// Delete post
export const deletePost: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const postIndex = mockPosts.findIndex(p => p.id === id);
  
  if (postIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Post not found'
    };
    return res.status(404).json(response);
  }

  mockPosts.splice(postIndex, 1);

  const response: ApiResponse<null> = {
    success: true,
    message: 'Post deleted successfully'
  };
  res.json(response);
};
