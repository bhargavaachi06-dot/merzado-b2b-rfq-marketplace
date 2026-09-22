import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const Navbar = () => {
  const { user, isAuthenticated, isBuyer, isSupplier, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <span className="navbar-brand-badge">
            <i className="bi bi-boxes me-1"></i> MERZADO
          </span>
          <span className="fw-semibold text-secondary small d-none d-sm-inline">
            B2B Marketplace
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#merzadoNavbar"
          aria-controls="merzadoNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="merzadoNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            {isAuthenticated && isBuyer && (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/buyer/dashboard"
                  >
                    <i className="bi bi-grid-1x2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/buyer/my-rfqs"
                  >
                    <i className="bi bi-file-earmark-text me-1"></i> My RFQs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/buyer/create-rfq"
                  >
                    <i className="bi bi-plus-circle me-1"></i> Create RFQ
                  </NavLink>
                </li>
              </>
            )}

            {isAuthenticated && isSupplier && (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/supplier/dashboard"
                  >
                    <i className="bi bi-grid-1x2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/supplier/browse"
                  >
                    <i className="bi bi-search me-1"></i> Browse RFQs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/supplier/my-quotations"
                  >
                    <i className="bi bi-cash-stack me-1"></i> My Quotations
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0 border-top border-lg-0 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2 w-100 justify-content-between justify-content-lg-end">
                <div className="user-profile-pill">
                  <StatusBadge status={user?.role} />
                  <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-light border d-flex align-items-center gap-1"
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2 w-100 justify-content-end">
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
