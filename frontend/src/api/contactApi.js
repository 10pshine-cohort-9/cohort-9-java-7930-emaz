import axios from './axiosConfig';

// Get all contacts with pagination
export const getContacts = (page = 0, size = 10, sort = 'firstName') => {
  return axios.get('/contacts', {
    params: { page, size, sort }
  });
};

// Search contacts
export const searchContacts = (query, page = 0, size = 10) => {
  return axios.get('/contacts/search', {
    params: { query, page, size, sort: 'firstName' }
  });
};

// Get contact by ID
export const getContact = (id) => {
  return axios.get(`/contacts/${id}`);
};

// Create contact
export const createContact = (contactData) => {
  return axios.post('/contacts', contactData);
};

// Update contact
export const updateContact = (id, contactData) => {
  return axios.put(`/contacts/${id}`, contactData);
};

// Delete contact
export const deleteContact = (id) => {
  return axios.delete(`/contacts/${id}`);
};

// Export contacts as CSV file
export const exportContacts = () => {
  return axios.get('/contacts/export', {
    responseType: 'blob'
  });
};