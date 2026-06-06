const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-red-600 text-sm mb-4 text-center" role="alert">
      {message}
    </p>
  );
};

export default ErrorMessage;
