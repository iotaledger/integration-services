import { parseISO, formatISO } from 'date-fns';

export const getDateFromString = (dateString: string): Date | null | undefined => {
  return dateString && parseISO(dateString);
};

export const getDateStringFromDate = (date: Date): string | null | undefined => {
  return date && formatISO(date);
};
