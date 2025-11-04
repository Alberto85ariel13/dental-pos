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

  return (
    <span>
      {label}
    </span>
  );
};

export default PatientLink;
