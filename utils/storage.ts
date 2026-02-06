export const getWeekId = (): string => {
  const now = new Date();
  // Adjust to nearest Monday to define the "Week"
  // If today is Sunday (0), we go back 6 days to Monday.
  // If today is Monday (1), we go back 0 days.
  // If today is Tuesday (2), we go back 1 day.
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return `issue_${monday.getFullYear()}_${monday.getMonth() + 1}_${monday.getDate()}`;
};

export const loadFromCache = <T>(key: string): T | null => {
  const issueId = getWeekId();
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    // Only return data if it belongs to the current week's issue
    if (parsed.issueId === issueId) {
      return parsed.data;
    }
  } catch (e) {
    console.warn("Failed to parse cached data", e);
    return null;
  }
  return null;
};

export const saveToCache = <T>(key: string, data: T) => {
  const issueId = getWeekId();
  localStorage.setItem(key, JSON.stringify({ issueId, data }));
};

export const CACHE_KEY_COMICS = 'weekly_comics_data';
export const CACHE_KEY_HERO = 'weekly_hero_image';
