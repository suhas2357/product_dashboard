/**
 * Normalizes any axios error into a friendly message string.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // No response (network issue)
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  // DummyJSON returns { message: "..." } on errors
  if (data && data.message) {
    return data.message;
  }

  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'You do not have permission to do this.';
    case 404:
      return 'Resource not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};