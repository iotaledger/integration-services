import { parseISO, formatISO } from 'date-fns';

export const getDateFromString = (dateString: string): Date | null => {
  return dateString && parseISO(dateString);
};

export const getDateStringFromDate = (date: Date): string => {
  return formatISO(date);
};
