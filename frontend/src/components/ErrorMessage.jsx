import React from 'react';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 my-3" role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <div>{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-outline-danger ms-3">
          <i className="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
