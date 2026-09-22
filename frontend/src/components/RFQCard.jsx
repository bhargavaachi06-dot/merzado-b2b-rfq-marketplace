import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const RFQCard = ({ rfq, userRole, onDeleteClick }) => {
  const isExpired = new Date(rfq.deadline) < new Date();
  
  // Format deadline to e.g. "30 Sep 2026"
  const deadlineFormatted = new Date(rfq.deadline).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="merzado-card merzado-card-hover p-4 h-100 d-flex flex-column">
      {/* Top Header: Title & Status */}
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <h5 className="fw-bold text-dark mb-0 text-truncate">
          <Link
            to={userRole === 'BUYER' ? `/buyer/rfqs/${rfq.id}` : `/supplier/rfqs/${rfq.id}`}
            className="text-decoration-none text-dark"
            title={rfq.product_name}
          >
            {rfq.product_name}
          </Link>
        </h5>
        <StatusBadge status={rfq.status} isExpired={isExpired} className="flex-shrink-0" />
      </div>

      {/* Description */}
      <p className="text-secondary small mb-3 flex-grow-1" style={{ minHeight: '38px', lineHeight: '1.4' }}>
        {rfq.description.length > 115
          ? `${rfq.description.substring(0, 115)}...`
          : rfq.description}
      </p>

      {/* Clean Metadata Block */}
      <div className="bg-light p-3 rounded-3 mb-3 border">
        <div className="rfq-card-meta-row">
          <span className="rfq-card-meta-label">
            <i className="bi bi-box-seam me-1 text-primary"></i> Quantity
          </span>
          <span className="rfq-card-meta-val">{rfq.quantity.toLocaleString()} units</span>
        </div>
        <div className="rfq-card-meta-row">
          <span className="rfq-card-meta-label">
            <i className="bi bi-geo-alt me-1 text-danger"></i> Location
          </span>
          <span className="rfq-card-meta-val text-truncate" style={{ maxWidth: '140px' }}>
            {rfq.delivery_location}
          </span>
        </div>
        <div className="rfq-card-meta-row">
          <span className="rfq-card-meta-label">
            <i className="bi bi-calendar-event me-1 text-warning"></i> Deadline
          </span>
          <span className={`rfq-card-meta-val ${isExpired ? 'text-danger' : 'text-dark'}`}>
            {deadlineFormatted}
          </span>
        </div>
        {userRole === 'BUYER' && (
          <div className="rfq-card-meta-row pt-1 border-top mt-1">
            <span className="rfq-card-meta-label">
              <i className="bi bi-chat-left-quote me-1 text-primary"></i> Received Bids
            </span>
            <span className="badge bg-primary text-white px-2 py-0">
              {rfq.quotations_count || 0}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 mt-auto">
        {userRole === 'BUYER' ? (
          <div className="d-flex gap-2">
            <Link
              to={`/buyer/rfqs/${rfq.id}`}
              className="btn btn-sm btn-outline-primary flex-grow-1"
            >
              <i className="bi bi-eye"></i> View &amp; Quotes ({rfq.quotations_count || 0})
            </Link>
            <Link
              to={`/buyer/edit-rfq/${rfq.id}`}
              className="btn btn-sm btn-light border"
              title="Edit RFQ"
            >
              <i className="bi bi-pencil"></i>
            </Link>
            {onDeleteClick && (
              <button
                onClick={() => onDeleteClick(rfq)}
                className="btn btn-sm btn-light border text-danger"
                title="Delete RFQ"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        ) : (
          <Link
            to={`/supplier/rfqs/${rfq.id}`}
            className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
          >
            <span>View RFQ &amp; Quote</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        )}
      </div>
    </div>
  );
};

export default RFQCard;
