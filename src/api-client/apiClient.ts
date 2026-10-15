import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { notification } from 'antd';

export interface ApiRequestOptions extends AxiosRequestConfig {
  url: string;
  service?: boolean;
  skipAuth?: boolean;
}

export interface DownloadFileOptions {
  url: string;
  params?: any;
}

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register');
};

const showLogoutNotification = (): void => {
  notification.warning({
    message: 'Session Expired',
    description: 'Your session has expired. Please log in again.',
  });
};

const redirectToLogin = (): void => {
  showLogoutNotification();
  setTimeout(async () => {
    Cookies.remove('userId');
    Cookies.remove('accessToken');
    try {
      const { default: store } = await import('../redux/store');
      const { logout } = await import('../redux/slices/authSlice');
      store.dispatch(logout());
    } catch (err) {
      console.error('Error dispatching logout on session expiry:', err);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, 3000);
};

const request = async function (options: ApiRequestOptions, service: boolean = false): Promise<any> {
  const accessToken = Cookies.get('accessToken');

  let client: AxiosInstance;
  if (!accessToken && !options.skipAuth && !isAuthEndpoint(options.url)) {
    redirectToLogin();
    return;
  } else {
    axios.defaults.timeout = 100000;
    client = axios.create({
      withCredentials: false,
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    });
  }

  const onSuccess = function (response: AxiosResponse) {
    return response?.data;
  };

  const handleStatusCode = function (statusCode: number) {
    switch (statusCode) {
      case 200:
        console.log('statusCode: 200');
        break;
      case 404:
        console.log('statusCode: 404 - Resource not found');
        break;
      case 500:
        console.log('statusCode: 500 - Internal Server Error');
        break;
      case 403:
        console.log('statusCode: 403 - Forbidden');
        break;
      default:
        console.log('statusCode:', statusCode);
    }
  };

  const onError = function (error: any) {
    if (error?.response) {
      handleStatusCode(error?.response?.status);
    } else {
      console.log('error message:', error?.message);
    }
    return Promise.reject(error?.response || error?.message);
  };

  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

export const GetAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, ...otherOptions } = options;

  if (Cookies?.get('accessToken') || options.skipAuth || isAuthEndpoint(url)) {
    return request({
      url: url,
      withCredentials: false,
      method: 'GET',
      ...otherOptions,
    });
  } else {
    redirectToLogin();
  }
};

export const PostAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, ...otherOptions } = options;
  if (Cookies?.get('accessToken') || options.skipAuth || isAuthEndpoint(url)) {
    return request({
      url: url,
      withCredentials: false,
      method: 'POST',
      data: options.data,
      ...otherOptions,
    });
  } else {
    redirectToLogin();
  }
};

export const PatchAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, ...otherOptions } = options;
  if (Cookies?.get('accessToken')) {
    return request({
      url: url,
      withCredentials: false,
      method: 'PATCH',
      data: options.data,
      ...otherOptions,
    });
  } else {
    redirectToLogin();
  }
};

export const PutAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, ...otherOptions } = options;
  if (Cookies?.get('accessToken')) {
    return request({
      url: url,
      withCredentials: false,
      method: 'PUT',
      data: options.data,
      ...otherOptions,
    });
  } else {
    redirectToLogin();
  }
};

export const DeleteAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;
  if (Cookies?.get('accessToken')) {
    return request(
      {
        url: url,
        withCredentials: false,
        method: 'DELETE',
        ...otherOptions,
      },
      service
    );
  } else {
    redirectToLogin();
  }
};

export const downloadFile = async ({ url, params }: DownloadFileOptions): Promise<any> => {
  const queryString = new URLSearchParams(params || {}).toString();
  const URL = queryString ? `${url}?${queryString}` : url;

  if (Cookies?.get('accessToken')) {
    try {
      const response = await axios.get(URL, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      return response; // ✅ FIX HERE
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  } else {
    redirectToLogin();
  }
};

export const PutfileUpload = async (url: string, formData: FormData): Promise<any> => {
  if (Cookies?.get('accessToken')) {
    try {
      const response = await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: Cookies.get('accessToken')
            ? `Bearer ${Cookies.get('accessToken')}`
            : undefined,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to upload file: ' + error.message);
    }
  } else {
    redirectToLogin();
  }
};

export const fileUpload = async (url: string, formData: FormData): Promise<any> => {
  if (Cookies?.get('accessToken')) {
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: Cookies.get('accessToken')
            ? `Bearer ${Cookies.get('accessToken')}`
            : undefined,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to upload file: ' + error.message);
    }
  } else {
    redirectToLogin();
  }
};

export default request;
