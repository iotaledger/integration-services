import moment from 'moment';

export const getDateFromString = (dateString: string): Date | null => {
  return dateString && moment(dateString, 'DD-MM-YYYY').toDate();
};

export const getDateStringFromDate = (date: Date): string => {
  return moment(date.toUTCString()).format('DD-MM-YYYY');
};
