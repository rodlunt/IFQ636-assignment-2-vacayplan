import { Children, cloneElement, useId } from 'react';

const FormField = ({ label, helper, error, required = false, children }) => {
  const generatedId = useId();
  const child = Children.only(children);
  const id = child.props.id || generatedId;
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = errorId || helperId;

  const cloned = cloneElement(child, {
    id,
    required: required || child.props.required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  });

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {cloned}
      {error ? (
        <p id={errorId} className="text-mini text-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-mini text-ink-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
