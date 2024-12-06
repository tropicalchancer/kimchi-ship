import { useState } from 'react';
import { Link } from 'lucide-react';

type Post = {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

const ShipFeed = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: { name: 'Anonymous', avatar: '/api/placeholder/32/32' },
      content: "Shipped the first version of Kimchi Ship! 🚀",
      timestamp: new Date().toISOString()
    }
  ]);

  const [newPost, setNewPost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosts([{
      id: Date.now(),
      user: { name: 'Anonymous', avatar: '/api/placeholder/32/32' },
      content: newPost,
      timestamp: new Date().toISOString()
    }, ...posts]);
    
    setNewPost('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kimchi Ship</h1>
        <p className="text-gray-600">Share what you shipped today</p>
      </div>

      {/* Post Form */}
      <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-gray-600 mb-2">What did you ship?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Share what you shipped today..."
            />
          </div>
          <div className="flex justify-between items-center">
            <button 
              type="button" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Link size={20} />
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                A
              </div>
              <div className="flex-1">
                <div className="font-medium">{post.content}</div>
                <div className="text-gray-500 text-sm mt-1">
                  {new Date(post.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipFeed;