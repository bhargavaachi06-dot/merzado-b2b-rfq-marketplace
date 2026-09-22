import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/supplier/dashboard', { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-card">
        {/* Left Hero Pane */}
        <div className="col-12 col-lg-5 auth-hero-pane">
          <div className="auth-hero-content">
            <div className="d-inline-flex align-items-center gap-2 mb-4">
              <span className="navbar-brand-badge fs-5">
                <i className="bi bi-boxes me-1"></i> MERZADO
              </span>
            </div>

            <h2 className="text-white fw-bold mb-3 display-6" style={{ fontSize: '1.85rem' }}>
              Connect Buyers &amp; Suppliers. Simplify Procurement.
            </h2>
            <p className="text-white-50 small mb-4">
              The modern B2B marketplace engineered for commercial RFQs, competitive bid comparisons, and transparent lead-time tracking.
            </p>

            <div className="mt-4 pt-2">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Role-Based Data Isolation</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Strict security ensures bids remain strictly confidential between buyer and supplier.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-stopwatch"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Enforced Bidding Deadlines</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Automated cut-offs prevent late quotation submissions across all published RFQs.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item mb-0">
                <div className="auth-feature-icon">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <div>
                  <div className="fw-semibold text-white small">Competitive Price Discovery</div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    Compare unit pricing, estimated shipping lead times, and terms side-by-side.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-content text-white-50 small mt-4 pt-3 border-top border-secondary border-opacity-25 d-none d-lg-block" style={{ fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} MERZADO Procurement Network. All rights reserved.
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="col-12 col-lg-7 auth-form-pane">
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Sign in to your account</h3>
            <p className="text-secondary small mb-0">
              Enter your credentials to access your procurement portal
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4 rounded-3" role="alert">
              <i className="bi bi-exclamation-circle-fill fs-6 text-danger"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Username or Email <span className="required-star">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white text-secondary border-end-0">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  id="username"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. buyer1 or supplier1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
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
                  className="form-control border-start-0 ps-0"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Picker for evaluators */}
          <div className="bg-light p-3 rounded-3 border mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">
                <i className="bi bi-key me-1 text-primary"></i> Demo Accounts (One-Click Fill)
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-white bg-white border flex-fill text-dark small"
                onClick={() => handleFillDemo('buyer1', 'Buyer123!')}
              >
                <i className="bi bi-briefcase text-primary me-1"></i> Buyer Demo
              </button>
              <button
                type="button"
                className="btn btn-sm btn-white bg-white border flex-fill text-dark small"
                onClick={() => handleFillDemo('supplier1', 'Supplier123!')}
              >
                <i className="bi bi-truck text-success me-1"></i> Supplier Demo
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-secondary small mb-0">
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                Register as Buyer or Supplier
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
