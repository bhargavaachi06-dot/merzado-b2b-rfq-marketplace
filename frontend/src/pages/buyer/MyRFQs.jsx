import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import RFQCard from '../../components/RFQCard';
import ConfirmationModal from '../../components/ConfirmationModal';

const MyRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  const fetchMyRFQs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/rfqs/my/');
      setRfqs(response.data);
    } catch (err) {
      console.error('Failed to fetch my RFQs:', err);
      setError('Unable to load your RFQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRFQs();
  }, []);

  const handleDeleteClick = (rfq) => {
    setSelectedRFQ(rfq);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRFQ) return;
    try {
      await axiosClient.delete(`/rfqs/${selectedRFQ.id}/`);
      setRfqs(rfqs.filter((r) => r.id !== selectedRFQ.id));
      setModalOpen(false);
      setSelectedRFQ(null);
    } catch (err) {
      console.error('Failed to delete RFQ:', err);
      alert('Failed to delete RFQ. Please try again.');
    }
  };

  // Filtered RFQs
  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearch =
      rfq.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.delivery_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && rfq.status === statusFilter;
  });

  if (loading) {
    return <LoadingSpinner message="Loading your published RFQs..." />;
  }

  return (
    <div className="container py-4 page-container">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Requests for Quotation</h2>
          <p className="text-secondary mb-0">Track received bids, adjust specs, and manage RFQ lifecycles.</p>
        </div>
        <div>
          <Link to="/buyer/create-rfq" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-plus-lg"></i>
            <span>Create New RFQ</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMyRFQs} />}

      {/* Search & Filter Toolbar */}
      <div className="merzado-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by product name, keywords, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-white bg-white border border-start-0 text-muted"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({rfqs.length})</option>
              <option value="OPEN">Open RFQs Only</option>
              <option value="CLOSED">Closed RFQs Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFQ List Grid */}
      {rfqs.length === 0 ? (
        <EmptyState
          icon="bi-journal-plus"
          title="You haven't created any RFQs yet"
          description="Create your first RFQ to start receiving competitive price quotations from suppliers."
          actionText="Create RFQ"
          actionLink="/buyer/create-rfq"
        />
      ) : filteredRFQs.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="No matching RFQs found"
          description={`No RFQs matched your search query "${searchTerm}".`}
          actionText="Clear Filters"
          onActionClick={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="row g-3">
          {filteredRFQs.map((rfq) => (
            <div key={rfq.id} className="col-12 col-md-6 col-lg-4">
              <RFQCard rfq={rfq} userRole="BUYER" onDeleteClick={handleDeleteClick} />
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title="Delete RFQ"
        message={`Are you sure you want to delete RFQ #${selectedRFQ?.id} ("${selectedRFQ?.product_name}")? This action is permanent and will remove all received bids.`}
        confirmText="Yes, Delete RFQ"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRFQ(null);
        }}
      />
    </div>
  );
};

export default MyRFQs;
