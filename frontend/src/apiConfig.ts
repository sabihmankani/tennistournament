import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // This will be replaced with your actual Bluehost backend URL
    return 'https://tennistournament-7ixe.vercel.app'; 
  } else {
    return 'http://localhost:3001/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
});