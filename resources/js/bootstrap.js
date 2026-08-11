import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
window.axios.defaults.withCredentials = true;

if (typeof window !== 'undefined' && window.Ziggy && window.location?.origin) {
    window.Ziggy.url = window.location.origin;
}

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 419) {
            window.location.reload();
        }

        return Promise.reject(error);
    },
);

const originalFetch = window.fetch?.bind(window);

if (originalFetch) {
    window.fetch = (input, init = {}) => {
        const requestUrl = typeof input === 'string' ? input : input?.url;

        let isSameOrigin = false;
        try {
            const resolved = new URL(requestUrl, window.location.href);
            isSameOrigin = resolved.origin === window.location.origin;
        } catch {
            isSameOrigin = false;
        }

        if (!isSameOrigin) {
            return originalFetch(input, init);
        }

        const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined) || {});

        if (csrfToken && !headers.has('X-CSRF-TOKEN')) {
            headers.set('X-CSRF-TOKEN', csrfToken);
        }

        if (!headers.has('X-Requested-With')) {
            headers.set('X-Requested-With', 'XMLHttpRequest');
        }

        if (!init.credentials) {
            init.credentials = 'same-origin';
        }

        init.headers = headers;

        return originalFetch(input, init);
    };
}
