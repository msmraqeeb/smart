'use client';
import { useAuth } from '../provider';
import { User } from 'firebase/auth';

export const useUser = (): User | null => {
  return useAuth().user;
};
