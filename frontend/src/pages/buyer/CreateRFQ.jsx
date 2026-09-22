import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const CreateRFQ = () => {
  // Default deadline to 7 days in future formatted as YYYY-MM-DDTHH:MM
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: '',
    delivery_location: '',
    deadline: getDefaultDeadline(),
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name.trim()) {
      setError('Product/Service name is required.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Detailed description is required.');
      return;
    }

    if (parseInt(formData.quantity, 10) <= 0 || isNaN(parseInt(formData.quantity, 10))) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (!formData.delivery_location.trim()) {
      setError('Delivery location is required.');
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be set to a future date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        deadline: new Date(formData.deadline).toISOString(),
      };
      await axiosClient.post('/rfqs/', payload);
      navigate('/buyer/my-rfqs');
    } catch (err) {
      console.error('Failed to create RFQ:', err);
      let msg = 'Failed to create RFQ. Please review the inputs.';
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

  return (
    <div className="container py-4 page-container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Title Header */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <Link to="/buyer/my-rfqs" className="btn btn-sm btn-light border" title="Back to RFQs">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h3 className="fw-bold text-dark mb-0">Publish New Request for Quotation</h3>
              <p className="text-secondary small mb-0">
                Specify item requirements, quantities, and submission deadline for suppliers
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
              <div className="mb-3">
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
                    placeholder="e.g. Industrial Hydraulic Valves or Enterprise Laptops"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  Detailed Specifications &amp; Requirements <span className="required-star">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="form-control"
                  placeholder="Provide technical specifications, required certifications, packaging, warranty expectations..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
                <div className="form-text text-muted small">
                  Be as specific as possible to receive accurate pricing proposals.
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="quantity">
                    Required Quantity (Units) <span className="required-star">*</span>
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
                      placeholder="e.g. 50"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="delivery_location">
                    Delivery Destination <span className="required-star">*</span>
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
                      placeholder="e.g. Chicago Fulfillment Hub, IL"
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
                <div className="form-text text-muted small">
                  Suppliers cannot submit new quotations after this date and time.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link to="/buyer/my-rfqs" className="btn btn-light border px-4">
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
                      <span>Publishing RFQ...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check"></i>
                      <span>Publish RFQ</span>
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

export default CreateRFQ;
