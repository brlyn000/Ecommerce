import { BadRequest, Unauthorized, Forbidden, NotFound, ServerError } from '../pages/ErrorPages';

export const handleApiError = (error, navigate) => {
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        navigate('/error/400');
        break;
      case 401:
        navigate('/error/401');
        break;
      case 403:
        navigate('/error/403');
        break;
      case 404:
        navigate('/error/404');
        break;
      case 500:
      case 502:
      case 503:
        navigate('/error/500');
        break;
      default:
        console.error('Unhandled error:', error);
    }
  } else if (error.request) {
    // Network error
    navigate('/error/500');
  } else {
    console.error('Error:', error.message);
  }
};

export const getErrorComponent = (code) => {
  switch (code) {
    case '400': return BadRequest;
    case '401': return Unauthorized;
    case '403': return Forbidden;
    case '404': return NotFound;
    case '500': return ServerError;
    default: return NotFound;
  }
};