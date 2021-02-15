import moment from 'moment';

export const getDateFromString = (dateString: string): Date | null => {
  return dateString && moment(dateString, 'YYYY-MM-DDTHH:mm:ss.sssZ').toDate();
};

export const getDateStringFromDate = (date: Date): string => {
  return moment(date.toUTCString()).format('YYYY-MM-DDTHH:mm:ss.sssZ');
};
