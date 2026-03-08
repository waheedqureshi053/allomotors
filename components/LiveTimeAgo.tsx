import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

interface LiveTimeAgoProps {
  timestamp: string | Date;
  style?: any;
}

const LiveTimeAgo: React.FC<LiveTimeAgoProps> = ({ timestamp, style }) => {
  const [timeAgo, setTimeAgo] = useState('Maintenant');

  useEffect(() => {
    if (!timestamp) {
      setTimeAgo('');
      return;
    }

    const updateTime = () => {
      try {
        const now = dayjs().utc();
        const messageTime = dayjs(timestamp).utc();
        const diffSeconds = now.diff(messageTime, 'second');

        // French translations (without "ago")
        if (diffSeconds < 10) {
          setTimeAgo('Maintenant');
          return;
        }

        if (diffSeconds < 60) {
          setTimeAgo(`${diffSeconds} Seconde${diffSeconds > 1 ? 's' : ''}`);
          return;
        }

        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) {
          setTimeAgo(`${diffMinutes} Minute${diffMinutes > 1 ? 's' : ''}`);
          return;
        }

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          setTimeAgo(`${diffHours} Heure${diffHours > 1 ? 's' : ''}`);
          return;
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) {
          setTimeAgo(`${diffDays} Jour${diffDays > 1 ? 's' : ''}`);
          return;
        }

        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) {
          setTimeAgo(`${diffMonths} Mois`);
          return;
        }

        // After 12 months, show years ("Année")
        const diffYears = Math.floor(diffMonths / 12);
        setTimeAgo(`${diffYears} Année${diffYears > 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Error formatting time:', error);
        setTimeAgo('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [timestamp]);

  return <Text style={style}>{timeAgo}</Text>;
};

export default LiveTimeAgo;