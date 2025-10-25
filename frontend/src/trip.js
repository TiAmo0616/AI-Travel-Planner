import api from './api';

export const getTrips = () => api.get('/trips');

export const createTrip = (data) => api.post('/trips', data);

export const getTrip = (id) => api.get(`/trips/${id}`);