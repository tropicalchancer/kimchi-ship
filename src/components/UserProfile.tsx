// src/components/UserProfile.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User as UserIcon, Flame, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

// Type definitions
type DbUser = Database['public']['Tables']['users']['Row'];
type DbPost = Database['public']['Tables']['posts']['Row'];

interface PostWithUser extends DbPost {
  users: DbUser;
}

interface UserProfileProps {
  currentUser: DbUser | null; // Accept the currentUser prop
}

// Define the exact parameter type expected from the URL
type ProfileParams = {
  userId?: string; // Make it optional since useParams can return undefined
};

const UserProfile: React.FC<UserProfileProps> = ({ currentUser }) => {
  // Use the correct type for params
  const params = useParams<ProfileParams>();
  const userId = params.userId || currentUser?.id || ''; // Use currentUser ID if no userId in URL

  const [profile, setProfile] = useState<DbUser | null>(null);
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error('User not found');

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            users (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        setProfile(userData);
        setPosts((postsData as PostWithUser[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Safe date formatting function that handles null/undefined
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-red-500">
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || 'User avatar'} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.full_name || 'Anonymous User'}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <Flame className="h-4 w-4" />
              <span>{profile.current_streak || 0} day streak</span>
              <span className="text-sm">
                (Longest: {profile.longest_streak || 0})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Recent Ships</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500">No ships yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border-b last:border-0 pb-4 last:pb-0">
                <p className="mb-2">{post.content}</p>
                <div className="text-sm text-gray-500">
                  {formatDateTime(post.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
