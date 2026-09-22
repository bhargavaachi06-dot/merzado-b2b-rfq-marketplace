import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import QuotationCard from '../../components/QuotationCard';
import DashboardStatCard from '../../components/DashboardStatCard';

const MyQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/quotations/my/');
      setQuotations(response.data);
    } catch (err) {
      console.error('Failed to load my quotations:', err);
      setError('Unable to load your quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuotations();
  }, []);

  const totalValue = quotations.reduce(
    (acc, curr) => acc + parseFloat(curr.quoted_price || 0),
    0
  );

  if (loading) {
    return <LoadingSpinner message="Loading your submitted quotations..." />;
  }

  return (
    <div className="container py-4 page-container">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Submitted Quotations</h2>
          <p className="text-secondary mb-0">Track active proposals, pricing terms, and lead times across buyer RFQs.</p>
        </div>
        <div>
          <Link to="/supplier/browse" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-search"></i>
            <span>Browse More RFQs</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMyQuotations} />}

      {/* Summary Metrics */}
      {quotations.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <DashboardStatCard
              icon="bi-file-earmark-check"
              value={quotations.length}
              label="Total Quotations Submitted"
              variant="primary"
              subtitle="Active bids in commercial review"
            />
          </div>
          <div className="col-12 col-md-6">
            <DashboardStatCard
              icon="bi-cash-stack"
              value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              label="Total Quoted Pipeline"
              variant="warning"
              subtitle="Cumulative proposal pricing"
            />
          </div>
        </div>
      )}

      {quotations.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-text"
          title="You haven't submitted any quotations yet"
          description="Browse available RFQs from commercial buyers and submit your first competitive quotation."
          actionText="Browse Available RFQs"
          actionLink="/supplier/browse"
        />
      ) : (
        <div className="quotations-container">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Submitted Proposals</h5>
            <span className="text-muted small">
              Showing {quotations.length} {quotations.length === 1 ? 'Proposal' : 'Proposals'}
            </span>
          </div>
          {quotations.map((quote) => (
            <QuotationCard key={quote.id} quotation={quote} isBuyerView={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuotations;
