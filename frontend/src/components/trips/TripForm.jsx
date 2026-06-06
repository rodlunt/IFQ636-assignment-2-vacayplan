import { useState } from 'react';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AlertCallout from '../ui/AlertCallout';

const EMPTY_VALUES = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  notes: '',
};

const validate = (values) => {
  if (!values.destination.trim()) return 'Destination is required.';
  if (!values.startDate) return 'Start date is required.';
  if (!values.endDate) return 'End date is required.';
  if (values.endDate < values.startDate) {
    return 'End date must be on or after start date.';
  }
  if (values.budget !== '' && Number(values.budget) < 0) {
    return 'Budget cannot be negative.';
  }
  return '';
};

const buildPayload = (values) => {
  const payload = {
    destination: values.destination.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
  };
  payload.title = values.title.trim() || null;
  payload.budget = values.budget === '' ? null : Number(values.budget);
  payload.notes = values.notes.trim() || null;
  return payload;
};

const TripForm = ({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save',
  submittingLabel,
  externalError = '',
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitText = submitting ? (submittingLabel || `${submitLabel}…`) : submitLabel;

  const updateField = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');
    const err = validate(values);
    if (err) {
      setValidationError(err);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit?.(buildPayload(values));
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = validationError || externalError;

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-surface border border-surface-border rounded-xl p-6 flex flex-col gap-4">
      <FormField label="Title (optional)">
        <Input
          type="text"
          value={values.title}
          onChange={updateField('title')}
        />
      </FormField>

      <FormField label="Destination" required>
        <Input
          type="text"
          value={values.destination}
          onChange={updateField('destination')}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start date" required>
          <Input
            type="date"
            value={values.startDate}
            onChange={updateField('startDate')}
          />
        </FormField>
        <FormField label="End date" required>
          <Input
            type="date"
            value={values.endDate}
            onChange={updateField('endDate')}
          />
        </FormField>
      </div>

      <FormField label="Budget AUD (optional)">
        <Input
          type="number"
          min="0"
          value={values.budget}
          onChange={updateField('budget')}
        />
      </FormField>

      <FormField label="Notes (optional)">
        <Textarea
          rows={3}
          value={values.notes}
          onChange={updateField('notes')}
        />
      </FormField>

      {displayError ? (
        <AlertCallout tone="danger" className="self-start">
          {displayError}
        </AlertCallout>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className="flex-1"
        >
          {submitText}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
