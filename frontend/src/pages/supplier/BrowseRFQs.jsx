import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import RFQCard from '../../components/RFQCard';

const BrowseRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [location, setLocation] = useState('');

  const fetchRFQs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (location.trim()) params.delivery_location = location.trim();

      const response = await axiosClient.get('/rfqs/', { params });
      setRfqs(response.data);
    } catch (err) {
      console.error('Failed to load RFQs:', err);
      setError('Unable to load RFQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRFQs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('OPEN');
    setLocation('');
    setTimeout(fetchRFQs, 0);
  };

  return (
    <div className="container py-4 page-container">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Browse Available RFQs</h2>
          <p className="text-secondary mb-0">
            Search and filter active commercial buyer requests across industries and regions.
          </p>
        </div>
        <div className="text-muted small">
          Showing <span className="fw-bold text-dark">{rfqs.length}</span> {rfqs.length === 1 ? 'Opportunity' : 'Opportunities'}
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="merzado-card p-3 p-md-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small text-muted mb-1 d-none d-md-block">Keywords</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search products, services or requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label small text-muted mb-1 d-none d-md-block">Destination City / State</label>
            <div className="input-group">
              <span className="input-group-text bg-white text-secondary border-end-0">
                <i className="bi bi-geo-alt"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-2">
            <label className="form-label small text-muted mb-1 d-none d-md-block">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="OPEN">Open Only</option>
              <option value="">All Statuses</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex gap-2 align-self-end">
            <button type="submit" className="btn btn-primary flex-grow-1">
              <i className="bi bi-funnel"></i> Filter
            </button>
            {(search || location || status !== 'OPEN') && (
              <button
                type="button"
                className="btn btn-light border"
                onClick={handleClearFilters}
                title="Reset Filters"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchRFQs} />}

      {loading ? (
        <LoadingSpinner message="Searching available RFQs..." />
      ) : rfqs.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="No matching RFQs found"
          description="Try broadening your keyword query or resetting the status and location filters."
          actionText="Reset Filters"
          onActionClick={handleClearFilters}
        />
      ) : (
        <div className="row g-3">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="col-12 col-md-6 col-lg-4">
              <RFQCard rfq={rfq} userRole="SUPPLIER" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseRFQs;
