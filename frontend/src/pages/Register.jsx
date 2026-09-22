import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
    });
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/supplier/dashboard', { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-card" style={{ maxWidth: '1080px' }}>
        {/* Left Hero Pane */}
        <div className="col-12 col-lg-5 auth-hero-pane">
          <div className="auth-hero-content">
            <div className="d-inline-flex align-items-center gap-2 mb-4">
              <span className="navbar-brand-badge fs-5">
                <i className="bi bi-boxes me-1"></i> MERZADO
              </span>
            </div>

            <h2 className="text-white fw-bold mb-3 display-6" style={{ fontSize: '1.85rem' }}>
              Empower Your Procurement Operations
            </h2>
            <p className="text-white-50 small mb-4">
              Join leading enterprise buyers and certified suppliers exchanging millions in commercial quotations annually.
            </p>

            <div className="mt-4 pt-2">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-person-badge"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">For Corporate Buyers</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Publish structured specifications, enforce strict bid deadlines, and compare quotes.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">For Verified Suppliers</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Access targeted commercial demand, search regional orders, and submit competitive bids.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item mb-0">
                <div className="auth-feature-icon">
                  <i className="bi bi-lock-fill"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Enterprise Security</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Stateless JWT authentication and automated server-side RBAC protection.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-content text-white-50 small mt-4 pt-3 border-top border-secondary border-opacity-25 d-none d-lg-block" style={{ fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} MERZADO Marketplace. All rights reserved.
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="col-12 col-lg-7 auth-form-pane">
          <div className="mb-3">
            <h3 className="fw-bold text-dark mb-1">Create your account</h3>
            <p className="text-secondary small mb-0">
              Select your role and enter your organization details
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
              <i className="bi bi-exclamation-circle-fill fs-6 text-danger"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-3">
              <label className="form-label d-block">
                Select Your Account Role <span className="required-star">*</span>
              </label>
              <div className="row g-2">
                <div className="col-6">
                  <div
                    className={`role-selection-card ${formData.role === 'BUYER' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('BUYER')}
                  >
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <i className={`bi bi-briefcase fs-4 ${formData.role === 'BUYER' ? 'text-primary' : 'text-secondary'}`}></i>
                    </div>
                    <span className="fw-bold text-dark d-block small">Corporate Buyer</span>
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                      Publish RFQs &amp; evaluate bids
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className={`role-selection-card ${formData.role === 'SUPPLIER' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('SUPPLIER')}
                  >
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <i className={`bi bi-truck fs-4 ${formData.role === 'SUPPLIER' ? 'text-primary' : 'text-secondary'}`}></i>
                    </div>
                    <span className="fw-bold text-dark d-block small">Verified Supplier</span>
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                      Browse RFQs &amp; quote prices
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="username">
                  Username <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary border-end-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. apex_industrial"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="email">
                  Business Email <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="procurement@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="password">
                  Password <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary border-end-0">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control border-start-0 ps-0"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration as {formData.role}</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-top">
            <p className="text-secondary small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
