import React from 'react';

const StatusBadge = ({ status, isExpired = false, className = '' }) => {
  if (status === 'CLOSED') {
    return (
      <span className={`badge-status badge-closed ${className}`}>
        <i className="bi bi-lock-fill me-1"></i> Closed
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className={`badge-status badge-expired ${className}`}>
        <i className="bi bi-clock-history me-1"></i> Expired
      </span>
    );
  }

  if (status === 'OPEN') {
    return (
      <span className={`badge-status badge-open ${className}`}>
        <span className="status-dot-pulse me-1"></span> Open
      </span>
    );
  }

  if (status === 'BUYER') {
    return (
      <span className={`badge-status badge-buyer ${className}`}>
        <i className="bi bi-briefcase me-1"></i> Buyer
      </span>
    );
  }

  if (status === 'SUPPLIER') {
    return (
      <span className={`badge-status badge-supplier ${className}`}>
        <i className="bi bi-truck me-1"></i> Supplier
      </span>
    );
  }

  return (
    <span className={`badge bg-light text-secondary border ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
