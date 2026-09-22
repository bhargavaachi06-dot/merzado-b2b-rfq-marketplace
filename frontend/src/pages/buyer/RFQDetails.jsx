import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import QuotationCard from '../../components/QuotationCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import StatusBadge from '../../components/StatusBadge';

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchRFQAndQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        axiosClient.get(`/rfqs/${id}/`),
        axiosClient.get(`/rfqs/${id}/quotations/`),
      ]);
      setRfq(rfqRes.data);
      setQuotations(quotesRes.data);
    } catch (err) {
      console.error('Failed to load RFQ details:', err);
      setError('Unable to load RFQ details and quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQAndQuotations();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!rfq) return;
    setIsUpdatingStatus(true);
    const newStatus = rfq.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const response = await axiosClient.patch(`/rfqs/${id}/`, { status: newStatus });
      setRfq(response.data);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update RFQ status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosClient.delete(`/rfqs/${id}/`);
      navigate('/buyer/my-rfqs');
    } catch (err) {
      console.error('Failed to delete RFQ:', err);
      alert('Failed to delete RFQ.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ specifications &amp; received quotations..." />;
  }

  if (error || !rfq) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error || 'RFQ not found'} onRetry={fetchRFQAndQuotations} />
        <div className="text-center mt-3">
          <Link to="/buyer/my-rfqs" className="btn btn-outline-primary">
            Back to My RFQs
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(rfq.deadline) < new Date();
  const deadlineDate = new Date(rfq.deadline).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="container py-4 page-container">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <Link to="/buyer/my-rfqs" className="btn btn-sm btn-light border" title="Back to My RFQs">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold text-dark mb-0">{rfq.product_name}</h2>
              <StatusBadge status={rfq.status} isExpired={isExpired} />
            </div>
            <span className="text-muted small">
              RFQ #{rfq.id} • Posted on {new Date(rfq.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button
            onClick={handleToggleStatus}
            className={`btn btn-sm ${rfq.status === 'OPEN' ? 'btn-outline-warning' : 'btn-outline-success'}`}
            disabled={isUpdatingStatus}
          >
            <i className={`bi ${rfq.status === 'OPEN' ? 'bi-lock' : 'bi-unlock'} me-1`}></i>
            {rfq.status === 'OPEN' ? 'Close RFQ' : 'Reopen RFQ'}
          </button>
          <Link to={`/buyer/edit-rfq/${rfq.id}`} className="btn btn-sm btn-light border">
            <i className="bi bi-pencil me-1"></i> Edit RFQ
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-sm btn-outline-danger"
          >
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>

      {/* Two-Column Detail Layout on Desktop */}
      <div className="row g-4 mb-4">
        {/* Left Column: Specifications */}
        <div className="col-12 col-lg-8">
          <div className="merzado-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-file-text text-primary"></i> Specifications &amp; Delivery Terms
            </h5>
            <div className="bg-light p-3 rounded-3 mb-3 border">
              <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {rfq.description}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-box-seam me-1 text-primary"></i> Quantity
                  </span>
                  <span className="fw-bold fs-5 text-dark">
                    {rfq.quantity.toLocaleString()} units
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-geo-alt me-1 text-danger"></i> Location
                  </span>
                  <span className="fw-bold fs-6 text-dark text-truncate d-block">
                    {rfq.delivery_location}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-calendar-event me-1 text-warning"></i> Deadline
                  </span>
                  <span className={`fw-bold fs-6 ${isExpired ? 'text-danger' : 'text-dark'}`}>
                    {deadlineDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: RFQ Status Summary Panel */}
        <div className="col-12 col-lg-4">
          <div className="merzado-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">RFQ Management</h5>
            <div className="bg-light p-3 rounded-3 border mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Status:</span>
                <StatusBadge status={rfq.status} isExpired={isExpired} />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Total Bids:</span>
                <span className="fw-bold text-primary">{quotations.length}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary small">Can Receive Bids:</span>
                <span className={`fw-bold ${rfq.status === 'OPEN' && !isExpired ? 'text-success' : 'text-danger'}`}>
                  {rfq.status === 'OPEN' && !isExpired ? 'Yes (Active)' : 'No (Closed)'}
                </span>
              </div>
            </div>

            <div className="d-grid gap-2">
              <Link to={`/buyer/edit-rfq/${rfq.id}`} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-pencil me-1"></i> Edit Specifications
              </Link>
              <button
                onClick={handleToggleStatus}
                className={`btn btn-sm ${rfq.status === 'OPEN' ? 'btn-light border' : 'btn-success'}`}
                disabled={isUpdatingStatus}
              >
                <i className={`bi ${rfq.status === 'OPEN' ? 'bi-lock' : 'bi-unlock'} me-1`}></i>
                {rfq.status === 'OPEN' ? 'Mark as Closed' : 'Reopen for Bidding'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Received Quotations Comparison Section */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold text-dark mb-0">Received Quotations</h4>
          <p className="text-secondary small mb-0">
            Compare bids submitted by registered suppliers for this RFQ.
          </p>
        </div>
        <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
          {quotations.length} {quotations.length === 1 ? 'Bid Received' : 'Bids Received'}
        </span>
      </div>

      {quotations.length === 0 ? (
        <EmptyState
          icon="bi-inbox"
          title="No quotations have been received"
          description="Verified suppliers are reviewing your specifications. Once bids are submitted, they will appear here for comparison."
        />
      ) : (
        <div className="quotations-list">
          {quotations.map((quote) => (
            <QuotationCard key={quote.id} quotation={quote} isBuyerView={true} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete RFQ"
        message={`Are you sure you want to permanently delete "${rfq.product_name}" and its ${quotations.length} received quotation(s)? This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default RFQDetails;
