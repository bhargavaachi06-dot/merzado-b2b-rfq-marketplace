import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import RFQCard from '../../components/RFQCard';
import DashboardStatCard from '../../components/DashboardStatCard';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/rfqs/my/');
      setRfqs(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRFQs = rfqs.length;
  const openRFQs = rfqs.filter((r) => r.status === 'OPEN' && !r.is_expired).length;
  const closedRFQs = rfqs.filter((r) => r.status === 'CLOSED' || r.is_expired).length;
  const totalBids = rfqs.reduce((acc, curr) => acc + (curr.quotations_count || 0), 0);

  if (loading) {
    return <LoadingSpinner message="Loading your procurement dashboard..." />;
  }

  return (
    <div className="container py-4 page-container">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            Welcome back, {user?.username || 'Buyer'} 👋
          </h2>
          <p className="text-secondary mb-0">
            Manage your RFQs and evaluate competitive supplier quotations.
          </p>
        </div>
        <div>
          <Link to="/buyer/create-rfq" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-plus-lg"></i>
            <span>Create New RFQ</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* 4 Summary Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-folder2-open"
            value={totalRFQs}
            label="Total RFQs"
            variant="primary"
            subtitle="All procurement requests"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-broadcast"
            value={openRFQs}
            label="Open RFQs"
            variant="success"
            subtitle="Actively accepting bids"
            badge="Live"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-lock"
            value={closedRFQs}
            label="Closed / Expired"
            variant="secondary"
            subtitle="Past deadline or finalized"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            icon="bi-chat-left-quote"
            value={totalBids}
            label="Quotations Received"
            variant="warning"
            subtitle="Total supplier proposals"
          />
        </div>
      </div>

      {/* Recent RFQs Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-0">Recent RFQs</h4>
          <span className="text-muted small">Latest procurement requisitions posted by your organization</span>
        </div>
        {totalRFQs > 0 && (
          <Link to="/buyer/my-rfqs" className="text-primary text-decoration-none small fw-semibold d-flex align-items-center gap-1">
            <span>View All ({totalRFQs})</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        )}
      </div>

      {rfqs.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="You haven't created any RFQs yet"
          description="Publish your first Request For Quotation to invite competitive pricing and delivery proposals from verified suppliers."
          actionText="Create Your First RFQ"
          actionLink="/buyer/create-rfq"
        />
      ) : (
        <div className="row g-3">
          {rfqs.slice(0, 4).map((rfq) => (
            <div key={rfq.id} className="col-12 col-md-6 col-lg-6">
              <RFQCard rfq={rfq} userRole="BUYER" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
