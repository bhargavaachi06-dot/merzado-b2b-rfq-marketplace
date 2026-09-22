import React from 'react';
import StatusBadge from './StatusBadge';

const QuotationCard = ({ quotation, isBuyerView = false }) => {
  const formattedDate = new Date(quotation.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="merzado-card p-4 mb-3 border">
      {/* Top Meta Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 pb-3 border-bottom mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border fw-bold small">
            Quote #{quotation.id}
          </span>
          {isBuyerView ? (
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small">Submitted by:</span>
              <span className="fw-bold text-dark d-flex align-items-center gap-1">
                <i className="bi bi-person-badge text-primary"></i>
                {quotation.supplier?.username}
              </span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small">For RFQ:</span>
              <span className="fw-bold text-dark d-flex align-items-center gap-1">
                <i className="bi bi-file-earmark-text text-primary"></i>
                {quotation.rfq_details?.product_name || `RFQ #${quotation.rfq}`}
              </span>
              {quotation.rfq_details?.status && (
                <StatusBadge status={quotation.rfq_details.status} className="ms-1" />
              )}
            </div>
          )}
        </div>
        <div className="text-muted small">
          <i className="bi bi-clock me-1"></i> Submitted on {formattedDate}
        </div>
      </div>

      {/* Main Quote Metrics Row */}
      <div className="row g-3 align-items-center">
        <div className="col-12 col-md-4">
          <div className="quote-highlight-box text-start">
            <span className="text-muted small d-block mb-1 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>
              Total Quoted Price
            </span>
            <span className="fs-4 fw-bold text-success">
              ${parseFloat(quotation.quoted_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="quote-highlight-box text-start">
            <span className="text-muted small d-block mb-1 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>
              Estimated Lead Time
            </span>
            <span className="fs-5 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-truck text-primary"></i>
              {quotation.estimated_delivery_time} {quotation.estimated_delivery_time === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="quote-highlight-box text-start">
            <span className="text-muted small d-block mb-1 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>
              {isBuyerView ? 'Supplier Contact' : 'Buyer'}
            </span>
            <span className="text-truncate d-block small fw-semibold text-secondary">
              <i className="bi bi-envelope me-1 text-muted"></i>
              {isBuyerView
                ? quotation.supplier?.email || 'Confidential'
                : quotation.rfq_details?.buyer_username || 'Buyer'}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Message / Proposal Terms */}
      {quotation.message && (
        <div className="mt-3 pt-3 border-top">
          <span className="text-muted small d-block mb-1 fw-semibold">
            <i className="bi bi-chat-square-quote me-1 text-primary"></i> Proposal Notes &amp; Terms:
          </span>
          <p className="small text-secondary mb-0 bg-light p-2 rounded-2 fst-italic border">
            "{quotation.message}"
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotationCard;
