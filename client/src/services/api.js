let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

const request = async (url, options = {}) => {
  try {
    const isFormData = options.body instanceof FormData;

    const fetchOptions = {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      const msg =
        (typeof data.body === 'string' && data.body) ||
        data.msj ||
        data.message ||
        'Error en la comunicación';
      throw new Error(msg);
    }

    return { data, error: null };
  } catch (err) {
    console.error('API Error:', err.message);
    return { data: null, error: err.message };
  }
};

export const api = {
  get: (url) => request(url, { method: 'GET' }),

  post: (url, body) => {
    const finalBody = body instanceof FormData ? body : JSON.stringify(body);
    return request(url, { method: 'POST', body: finalBody });
  },

  put: (url, body) => {
    const finalBody = body instanceof FormData ? body : JSON.stringify(body);
    return request(url, { method: 'PUT', body: finalBody });
  },

  delete: (url) => request(url, { method: 'DELETE' }),
};
