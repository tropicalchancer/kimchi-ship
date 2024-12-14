import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '../types/project';
import { StreaksListProps } from '../types';

interface StreakUser extends Pick<User, 'id' | 'full_name' | 'avatar_url' | 'current_streak'> {
  isPro?: boolean;
}

const StreaksList = ({ currentUser }: StreaksListProps) => {
  const [users, setUsers] = useState<StreakUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTopStreaks();
  }, []);

  const fetchTopStreaks = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, current_streak')
        .order('current_streak', { ascending: false })
        .limit(20);

      if (supabaseError) throw supabaseError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching streaks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch streaks'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <h2 className="text-xl font-bold px-4 mb-4">Streaks</h2>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-12 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold px-4 mb-4">Streaks</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="text-sm">{error.message}</p>
          <button 
            onClick={fetchTopStreaks}
            className="text-sm underline hover:no-underline mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold px-4 mb-4">Streaks</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {user.full_name[0]}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-medium">{user.full_name}</span>
                {user.isPro && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{user.current_streak || 0}</span>
              <span className="text-red-500">🌶️</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StreaksList;