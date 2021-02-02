import { Request, Response } from 'express';

export const getUser = (req: Request, res: Response): void => {
  console.log('Get user');
  res.send('getUser!');
};

export const addUser = (req: Request, res: Response): void => {
  console.log('Add user');
  res.send('addUser!');
};

export const deleteUser = (req: Request, res: Response): void => {
  console.log('Delete user');
  res.send('deleteUser!');
};
