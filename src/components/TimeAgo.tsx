import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string | Date | null;
  className?: string;
}

const TimeAgo = ({ date, className = "text-gray-500 text-sm" }: TimeAgoProps) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      // Handle null or invalid date
      if (!date) {
        setTimeAgo('No date');
        return;
      }

      try {
        const now = new Date();
        const past = date instanceof Date ? date : new Date(date);

        // Check for invalid date
        if (isNaN(past.getTime())) {
          setTimeAgo('Invalid date');
          return;
        }

        const diffInMilliseconds = now.getTime() - past.getTime();
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

        if (diffInSeconds < 30) {
          setTimeAgo('just now');
        } else if (diffInSeconds < 60) {
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
      } catch (error) {
        console.error('Error formatting date:', error);
        setTimeAgo('Invalid date');
      }
    };

    updateTimeAgo();
    const timer = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return <span className={className} title={date?.toString()}>{timeAgo}</span>;
};

export default TimeAgo;