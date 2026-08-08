export interface StatusInfo {
  statusText: string;
  isAvailable: boolean;
  badgeStyle: string;
  dotColor: string;
}

/**
 * Checks if current local time is within campus working hours:
 * 10:30 AM (630 mins from midnight) to 5:30 PM (1050 mins from midnight)
 */
export const isWithinWorkingHours = (): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 10 * 60 + 30; // 10:30 AM = 630
  const endMinutes = 17 * 60 + 30;   // 5:30 PM = 1050

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Evaluates faculty status based on current time and stored status string.
 */
export const getEffectiveStatus = (savedStatus: string = 'Available'): StatusInfo => {
  const inWorkingHours = isWithinWorkingHours();

  // Outside 10:30 AM - 5:30 PM window
  if (!inWorkingHours) {
    return {
      statusText: 'Unavailable',
      isAvailable: false,
      badgeStyle: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
      dotColor: 'bg-red-500',
    };
  }

  // Inside working hours (10:30 AM - 5:30 PM)
  switch (savedStatus) {
    case 'Busy':
      return {
        statusText: 'Busy',
        isAvailable: false,
        badgeStyle: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        dotColor: 'bg-amber-500',
      };
    case 'In Lecture':
      return {
        statusText: 'In Lecture',
        isAvailable: false,
        badgeStyle: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        dotColor: 'bg-blue-500',
      };
    case 'In Meeting':
      return {
        statusText: 'In Meeting',
        isAvailable: false,
        badgeStyle: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        dotColor: 'bg-purple-500',
      };
    case 'Offline':
      return {
        statusText: 'Offline',
        isAvailable: false,
        badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        dotColor: 'bg-gray-400',
      };
    case 'Available':
    case 'Auto':
    default:
      return {
        statusText: 'Available',
        isAvailable: true,
        badgeStyle: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
        dotColor: 'bg-green-500',
      };
  }
};