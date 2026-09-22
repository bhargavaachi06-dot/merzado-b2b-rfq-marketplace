import React from 'react';

const DashboardStatCard = ({
  icon = 'bi-activity',
  value = 0,
  label = '',
  variant = 'primary',
  subtitle = '',
  badge = '',
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${variant}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="stat-label text-truncate">{label}</span>
          {badge && <span className="stat-badge">{badge}</span>}
        </div>
        <div className="stat-value">{value}</div>
        {subtitle && <span className="stat-subtext text-truncate d-block">{subtitle}</span>}
      </div>
    </div>
  );
};

export default DashboardStatCard;
