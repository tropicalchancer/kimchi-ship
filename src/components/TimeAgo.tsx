import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string | Date;
}

const TimeAgo = ({ date }: TimeAgoProps) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const past = new Date(date);
      const diffInMilliseconds = now.getTime() - past.getTime();
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds} seconds ago`);
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        setTimeAgo(`${days} day${days !== 1 ? 's' : ''} ago`);
      } else {
        setTimeAgo(past.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const timer = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return <span className="text-gray-500 text-sm">{timeAgo}</span>;
};

export default TimeAgo;