import api from './api';

export const listingApi = {
  getAllListings: async (params = {}) => {
    // params can include search, minPrice, maxPrice, condition, page, limit
    const response = await api.get('/listings', { params });
    return response.data.data; // { listings, meta }
  },

  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data.data.listing;
  },

  createListing: async (formData) => {
    const response = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.listing;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};
