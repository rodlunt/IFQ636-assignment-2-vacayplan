import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import ErrorMessage from './ErrorMessage';

const toDateInputValue = (iso) => (iso ? iso.slice(0, 10) : undefined);

const AddActivityForm = ({ tripId, tripStartDate, tripEndDate, onActivityAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ date: '', time: '', location: '', description: '' });
    setError('');
  };

  const validate = () => {
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.date) return 'Date is required.';
    if (!formData.time) return 'Time is required.';
    const minDate = toDateInputValue(tripStartDate);
    const maxDate = toDateInputValue(tripEndDate);
    if (minDate && formData.date < minDate) {
      return 'Date must fall within the trip date range.';
    }
    if (maxDate && formData.date > maxDate) {
      return 'Date must fall within the trip date range.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
      };
      if (formData.description.trim()) payload.description = formData.description.trim();
      const response = await axiosInstance.post(`/api/trips/${tripId}/activities`, payload);
      onActivityAdded?.(response.data);
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add activity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-brand text-ink-inverse px-4 py-2 rounded hover:bg-brand-hover"
      >
        + Add activity
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded border">
      <h3 className="text-lg font-semibold mb-3">Add activity</h3>
      <label className="block mb-3">
        <span className="text-sm font-medium text-gray-700">Location *</span>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date *</span>
          <input
            type="date"
            value={formData.date}
            min={toDateInputValue(tripStartDate)}
            max={toDateInputValue(tripEndDate)}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Time *</span>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
      </div>
      <label className="block mb-3">
        <span className="text-sm font-medium text-gray-700">Description (optional)</span>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>
      <ErrorMessage message={error} />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-brand text-ink-inverse p-2 rounded hover:bg-brand-hover disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add activity'}
        </button>
        <button
          type="button"
          onClick={() => { resetForm(); setIsOpen(false); }}
          disabled={submitting}
          className="flex-1 bg-gray-200 text-gray-800 p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddActivityForm;
