import { api } from './api';
import toast from 'react-hot-toast';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface StreakInfo {
  streakCount: number;
  lastStudyDate: string;
  studiedToday: boolean;
}

export const getStreakInfo = (): StreakInfo => {
  if (typeof window === 'undefined') {
    return { streakCount: 14, lastStudyDate: '', studiedToday: false };
  }

  let streakCount = 14;
  let lastStudyDate = '';

  const storedCount = localStorage.getItem('ielts_streak_count');
  const storedDate = localStorage.getItem('ielts_last_study_date');

  if (storedCount !== null && storedDate !== null) {
    streakCount = parseInt(storedCount, 10);
    lastStudyDate = storedDate;
  } else {
    // If not found in localStorage, check stored user object
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (typeof u.streak === 'number' && u.streak > 0) {
          streakCount = u.streak;
        }
        if (u.lastActive) {
          lastStudyDate = getLocalDateString(new Date(u.lastActive));
        }
      } catch (e) {}
    }

    // Default initializer if no prior date is set
    if (!lastStudyDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      lastStudyDate = getLocalDateString(yesterday);
      localStorage.setItem('ielts_streak_count', String(streakCount));
      localStorage.setItem('ielts_last_study_date', lastStudyDate);
    }
  }

  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));

  const studiedToday = (lastStudyDate === todayStr);

  // If last study date is older than yesterday, and they have not studied today, the streak resets
  if (lastStudyDate !== todayStr && lastStudyDate !== yesterdayStr) {
    streakCount = 0;
    localStorage.setItem('ielts_streak_count', '0');
  }

  return { streakCount, lastStudyDate, studiedToday };
};

export const recordStudyActivity = async () => {
  if (typeof window === 'undefined') return;

  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
  const { streakCount, lastStudyDate, studiedToday } = getStreakInfo();

  if (studiedToday) {
    // Already studied today, trigger update event just to ensure sync, but don't increment
    window.dispatchEvent(new CustomEvent('ielts_streak_updated', { detail: streakCount }));
    return streakCount;
  }

  let newStreak = 1;
  if (lastStudyDate === yesterdayStr) {
    newStreak = streakCount + 1;
  } else {
    // Streak was broken or fresh start, so reset to 1
    newStreak = 1;
  }

  // Update localStorage
  localStorage.setItem('ielts_streak_count', String(newStreak));
  localStorage.setItem('ielts_last_study_date', todayStr);

  // Sync user object streak property if it exists
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      u.streak = newStreak;
      u.lastActive = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(u));
    } catch (e) {}
  }

  // Dispatch custom window event so sibling components update their state instantly
  window.dispatchEvent(new CustomEvent('ielts_streak_updated', { detail: newStreak }));

  // Celebratory UI feedback with elegant custom design elements
  toast.success(`Streak Extended! You are on a ${newStreak}-day study streak! 🔥`, {
    duration: 5000,
    icon: '🔥',
    style: {
      background: '#0f172a',
      color: '#fff',
      border: '1px solid rgba(249, 115, 22, 0.4)',
      boxShadow: '0 0 15px rgba(249, 115, 22, 0.2)',
    },
  });

  // Attempt backend API sync
  try {
    const res = await api.post('/user/record-study', { date: new Date().toISOString() });
    if (res && typeof res.streak === 'number') {
      // If backend recalculation differs, trust backend but sync
      if (res.streak !== newStreak) {
        localStorage.setItem('ielts_streak_count', String(res.streak));
        window.dispatchEvent(new CustomEvent('ielts_streak_updated', { detail: res.streak }));
        return res.streak;
      }
    }
  } catch (err) {
    // Fail-silently on API sync errors (e.g. offline dev sandbox mode)
    console.warn('Backend streak sync skipped or offline:', err);
  }

  return newStreak;
};
