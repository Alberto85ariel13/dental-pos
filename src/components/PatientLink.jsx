import React from 'react';
import { Link } from 'react-router-dom';

const mergeClassNames = (...values) => values.filter(Boolean).join(' ');

const PatientLink = ({
  patNum,
  name,
  children,
  className = '',
  stopPropagation = false,
  onClick,
  ...rest
}) => {
  const label = children ?? name;

  if (!patNum || !label) {
    return <span className={className}>{label}</span>;
  }

  const handleClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link
      to={`/portal-patient/${patNum}`}
      className={mergeClassNames('patient-link', className)}
      onClick={handleClick}
      {...rest}
    >
      {label}
    </Link>
  );
};

export default PatientLink;
