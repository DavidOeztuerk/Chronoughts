import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1/thoughts',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config.url,
      method: error.config.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const thoughtsApi = {

};


group.MapGet("/", async(
    group.MapGet("/{id}", async(
        group.MapPost("/", async
            group.MapPut("/{id}", 
                group.MapDelete("/{id}",