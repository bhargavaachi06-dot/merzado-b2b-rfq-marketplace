import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="merzado-card text-center p-5 my-4">
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
        style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}
      >
        <i className={`bi ${icon} fs-2`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <div>
          <Link to={actionLink} className="btn btn-primary">
            {actionText}
          </Link>
        </div>
      )}
      {actionText && onActionClick && (
        <div>
          <button onClick={onActionClick} className="btn btn-primary">
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
