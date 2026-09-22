import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditRFQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: '',
    delivery_location: '',
    deadline: '',
    status: 'OPEN',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRFQ = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosClient.get(`/rfqs/${id}/`);
        const rfq = response.data;

        // Format deadline to datetime-local
        let formattedDeadline = '';
        if (rfq.deadline) {
          const d = new Date(rfq.deadline);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          formattedDeadline = d.toISOString().slice(0, 16);
        }

        setFormData({
          product_name: rfq.product_name,
          description: rfq.description,
          quantity: rfq.quantity,
          delivery_location: rfq.delivery_location,
          deadline: formattedDeadline,
          status: rfq.status,
        });
      } catch (err) {
        console.error('Failed to load RFQ:', err);
        setError('Unable to load RFQ details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchRFQ();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (parseInt(formData.quantity, 10) <= 0 || isNaN(parseInt(formData.quantity, 10))) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        deadline: new Date(formData.deadline).toISOString(),
      };
      await axiosClient.patch(`/rfqs/${id}/`, payload);
      navigate(`/buyer/rfqs/${id}`);
    } catch (err) {
      console.error('Failed to update RFQ:', err);
      let msg = 'Failed to update RFQ. Please check inputs.';
      if (err.response?.data) {
        const errors = err.response.data;
        const firstKey = Object.keys(errors)[0];
        msg = `${firstKey}: ${Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]}`;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ data for editing..." />;
  }

  return (
    <div className="container py-4 page-container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Link to={`/buyer/rfqs/${id}`} className="btn btn-sm btn-light border" title="Cancel and Return">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h3 className="fw-bold text-dark mb-0">Edit RFQ #{id}</h3>
              <p className="text-secondary small mb-0">
                Update requisition specifications or toggle acceptance status
              </p>
            </div>
          </div>

          <div className="merzado-card p-4 p-md-5">
            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4 rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill fs-6 text-danger"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-8">
                  <label className="form-label" htmlFor="product_name">
                    Product / Service Name <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-secondary border-end-0">
                      <i className="bi bi-tag"></i>
                    </span>
                    <input
                      type="text"
                      id="product_name"
                      name="product_name"
                      className="form-control border-start-0 ps-0"
                      value={formData.product_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="status">
                    RFQ Status <span className="required-star">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="OPEN">OPEN (Accepting Bids)</option>
                    <option value="CLOSED">CLOSED (No Bids)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  Detailed Specifications <span className="required-star">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="quantity">
                    Quantity (Units) <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-secondary border-end-0">
                      <i className="bi bi-box-seam"></i>
                    </span>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      className="form-control border-start-0 ps-0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="delivery_location">
                    Delivery Location <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-secondary border-end-0">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <input
                      type="text"
                      id="delivery_location"
                      name="delivery_location"
                      className="form-control border-start-0 ps-0"
                      value={formData.delivery_location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="deadline">
                  Submission Deadline <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary border-end-0">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <input
                    type="datetime-local"
                    id="deadline"
                    name="deadline"
                    className="form-control border-start-0 ps-0"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link to={`/buyer/rfqs/${id}`} className="btn btn-light border px-4">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRFQ;
