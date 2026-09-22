import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import RFQCard from '../../components/RFQCard';
import DashboardStatCard from '../../components/DashboardStatCard';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const [openRfqs, setOpenRfqs] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSupplierData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rfqRes, quoteRes] = await Promise.all([
        axiosClient.get('/rfqs/?status=OPEN'),
        axiosClient.get('/quotations/my/'),
      ]);
      setOpenRfqs(rfqRes.data);
      setMyQuotes(quoteRes.data);
    } catch (err) {
      console.error('Error fetching supplier dashboard data:', err);
      setError('Unable to load supplier dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const totalQuotesValue = myQuotes.reduce(
    (acc, curr) => acc + parseFloat(curr.quoted_price || 0),
    0
  );

  if (loading) {
    return <LoadingSpinner message="Loading supplier opportunities..." />;
  }

  return (
    <div className="container py-4 page-container">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            Find the right opportunities 👋
          </h2>
          <p className="text-secondary mb-0">
            Browse active buyer RFQs and submit competitive price &amp; lead-time quotations.
          </p>
        </div>
        <div>
          <Link to="/supplier/browse" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-search"></i>
            <span>Browse Available RFQs</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSupplierData} />}

      {/* 4 Summary Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-box-seam"
            value={openRfqs.length}
            label="Available RFQs"
            variant="primary"
            subtitle="Verified buyer requests"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-broadcast"
            value={openRfqs.filter((r) => !r.is_expired).length}
            label="Open for Bidding"
            variant="success"
            subtitle="Before deadline cutoff"
            badge="Active"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-file-earmark-check"
            value={myQuotes.length}
            label="My Submitted Quotes"
            variant="secondary"
            subtitle="Proposals across RFQs"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-cash-stack"
            value={`$${totalQuotesValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            label="Pipeline Value"
            variant="warning"
            subtitle="Cumulative active bids"
          />
        </div>
      </div>

      {/* Latest Opportunities */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-0">Latest Opportunities</h4>
          <span className="text-muted small">Recent requests posted by verified commercial buyers</span>
        </div>
        {openRfqs.length > 0 && (
          <Link to="/supplier/browse" className="text-primary text-decoration-none small fw-semibold d-flex align-items-center gap-1">
            <span>View All ({openRfqs.length})</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        )}
      </div>

      {openRfqs.length === 0 ? (
        <EmptyState
          icon="bi-hourglass-split"
          title="No open RFQs available right now"
          description="Check back shortly as corporate buyers publish new procurement requisitions."
        />
      ) : (
        <div className="row g-3">
          {openRfqs.slice(0, 4).map((rfq) => (
            <div key={rfq.id} className="col-12 col-md-6 col-lg-6">
              <RFQCard rfq={rfq} userRole="SUPPLIER" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
