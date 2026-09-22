import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';

const SupplierRFQDetails = () => {
  const { id } = useParams();

  const [rfq, setRfq] = useState(null);
  const [existingQuote, setExistingQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [quotedPrice, setQuotedPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchRFQData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        axiosClient.get(`/rfqs/${id}/`),
        axiosClient.get('/quotations/my/'),
      ]);
      setRfq(rfqRes.data);

      // Check if current supplier already submitted a quote for this RFQ
      const previousQuote = quotesRes.data.find(
        (q) => q.rfq === parseInt(id, 10) || q.rfq_details?.id === parseInt(id, 10)
      );
      if (previousQuote) {
        setExistingQuote(previousQuote);
      }
    } catch (err) {
      console.error('Failed to load RFQ:', err);
      setError('Unable to load RFQ details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQData();
  }, [id]);

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccess(false);

    const priceNum = parseFloat(quotedPrice);
    const timeNum = parseInt(deliveryTime, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid quoted price greater than $0.');
      return;
    }

    if (isNaN(timeNum) || timeNum <= 0) {
      setFormError('Estimated delivery time must be at least 1 day.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        quoted_price: priceNum.toFixed(2),
        estimated_delivery_time: timeNum,
        message: message.trim(),
      };
      const res = await axiosClient.post(`/rfqs/${id}/quotations/`, payload);
      setSubmitSuccess(true);
      setExistingQuote(res.data);
    } catch (err) {
      console.error('Quotation submission error:', err);
      let errMsg = 'Failed to submit quotation. Please verify the terms.';
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') errMsg = d;
        else if (d.non_field_errors) errMsg = d.non_field_errors[0];
        else if (d.detail) errMsg = d.detail;
        else {
          const k = Object.keys(d)[0];
          errMsg = `${k}: ${Array.isArray(d[k]) ? d[k][0] : d[k]}`;
        }
      }
      setFormError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ specifications &amp; terms..." />;
  }

  if (error || !rfq) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error || 'RFQ not found'} onRetry={fetchRFQData} />
        <div className="text-center mt-3">
          <Link to="/supplier/browse" className="btn btn-outline-primary">
            Back to Browse RFQs
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(rfq.deadline) < new Date();
  const isClosed = rfq.status === 'CLOSED';

  const deadlineFormatted = new Date(rfq.deadline).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="container py-4 page-container">
      {/* Back button & Title Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <Link to="/supplier/browse" className="btn btn-sm btn-light border" title="Back to RFQs">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold text-dark mb-0">{rfq.product_name}</h2>
              <StatusBadge status={rfq.status} isExpired={isExpired} />
            </div>
            <span className="text-muted small">
              Posted by <strong>{rfq.buyer?.username || 'Enterprise Buyer'}</strong> • RFQ #{rfq.id}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Complete RFQ Specifications */}
        <div className="col-12 col-lg-7">
          <div className="merzado-card p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-text text-primary"></i>
              Specifications &amp; Requirement Details
            </h5>
            <div className="bg-light p-3 rounded-3 mb-4 border">
              <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {rfq.description}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-box-seam text-primary me-1"></i> Required Quantity
                  </span>
                  <span className="fw-bold fs-5 text-dark">
                    {rfq.quantity.toLocaleString()} units
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-geo-alt text-danger me-1"></i> Delivery Location
                  </span>
                  <span className="fw-bold fs-5 text-dark">
                    {rfq.delivery_location}
                  </span>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 border rounded-3 bg-white">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-calendar-event text-warning me-1"></i> Bidding Deadline
                  </span>
                  <span className={`fw-bold fs-6 ${isExpired ? 'text-danger' : 'text-dark'}`}>
                    {deadlineFormatted}
                    {isExpired && <span className="ms-2 badge bg-danger text-white">Expired</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quotation Submission / Status */}
        <div className="col-12 col-lg-5">
          {existingQuote ? (
            <div className="merzado-card p-4 border-success">
              <div className="text-center mb-3">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success"
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className="bi bi-check-lg fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Quotation Submitted</h5>
                <p className="text-muted small mb-0">
                  You have already submitted an active bid for this RFQ.
                </p>
              </div>

              <div className="bg-light p-3 rounded-3 mb-3 border">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Your Quoted Price:</span>
                  <span className="fw-bold text-success fs-5">
                    ${parseFloat(existingQuote.quoted_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Estimated Lead Time:</span>
                  <span className="fw-bold text-dark">
                    {existingQuote.estimated_delivery_time} days
                  </span>
                </div>
                {existingQuote.message && (
                  <div className="pt-2 border-top">
                    <span className="text-secondary small d-block">Your Note:</span>
                    <span className="small text-muted fst-italic">"{existingQuote.message}"</span>
                  </div>
                )}
              </div>

              <Link to="/supplier/my-quotations" className="btn btn-outline-primary w-100 btn-sm">
                <i className="bi bi-list-check me-1"></i> View in My Quotations
              </Link>
            </div>
          ) : isClosed || isExpired ? (
            <div className="merzado-card p-4 text-center">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle text-secondary"
                style={{ width: '56px', height: '56px' }}
              >
                <i className="bi bi-lock-fill fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark">Bidding Closed</h5>
              <p className="text-muted small mb-3">
                {isClosed
                  ? 'This RFQ has been marked as closed by the buyer.'
                  : 'The submission deadline for this RFQ has expired.'}
              </p>
              <Link to="/supplier/browse" className="btn btn-outline-primary w-100">
                Browse Other RFQs
              </Link>
            </div>
          ) : (
            <div className="merzado-card p-4">
              <h5 className="fw-bold text-dark mb-1">Submit Your Quotation</h5>
              <p className="text-secondary small mb-3">
                Provide your competitive price and delivery timeline.
              </p>

              {/* Summary Card Above Form */}
              <div className="bg-light p-3 rounded-3 border mb-3">
                <span className="text-muted small fw-bold d-block mb-1 text-uppercase" style={{ fontSize: '0.72rem' }}>
                  You're quoting for:
                </span>
                <h6 className="fw-bold text-dark mb-2 text-truncate">{rfq.product_name}</h6>
                <div className="d-flex flex-wrap gap-2 small text-secondary">
                  <span><strong>Quantity:</strong> {rfq.quantity.toLocaleString()}</span>
                  <span>•</span>
                  <span><strong>Location:</strong> {rfq.delivery_location}</span>
                  <span>•</span>
                  <span><strong>Deadline:</strong> {deadlineFormatted}</span>
                </div>
              </div>

              {formError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
                  <i className="bi bi-exclamation-circle-fill fs-6 text-danger"></i>
                  <div>{formError}</div>
                </div>
              )}

              {submitSuccess && (
                <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
                  <i className="bi bi-check-circle-fill fs-6 text-success"></i>
                  <div>Quotation submitted successfully!</div>
                </div>
              )}

              <form onSubmit={handleSubmitQuotation}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="quotedPrice">
                    Total Quoted Price (USD) <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white fw-bold text-secondary border-end-0">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      id="quotedPrice"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. 14500.00"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="deliveryTime">
                    Estimated Delivery Time (Days) <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-secondary border-end-0">
                      <i className="bi bi-truck"></i>
                    </span>
                    <input
                      type="number"
                      min="1"
                      id="deliveryTime"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. 7"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="message">
                    Proposal Notes / Terms (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows="3"
                    className="form-control"
                    placeholder="Include warranty terms, shipping carriers, or volume discounts..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Submitting Quote...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      <span>Submit Quotation</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierRFQDetails;
