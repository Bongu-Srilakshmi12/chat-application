import axios from 'axios';

// Create an instance of Axios with the base URL for the backend
const API = axios.create({ baseURL: 'http://localhost:5000' });

// Use the API instance for all requests
export const createChat = (data) => API.post('/chat/', data);
export const userChats = (userId) => API.get(`/chat/${userId}`);  // Now using the API instance
export const findChat = (firstId, secondId) => API.get(`/chat/find/${firstId}/${secondId}`);
