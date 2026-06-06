import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploadZone from './FileUploadZone';

describe('FileUploadZone', () => {
  test('renders default label + sublabel when no value', () => {
    render(<FileUploadZone />);
    expect(screen.getByText('Upload cover photo')).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG up to 5MB/)).toBeInTheDocument();
  });

  test('respects custom label + sublabel', () => {
    render(<FileUploadZone label="Drop the file" sublabel="JPG only" />);
    expect(screen.getByText('Drop the file')).toBeInTheDocument();
    expect(screen.getByText('JPG only')).toBeInTheDocument();
  });

  test('calls onChange with file when input changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FileUploadZone onChange={onChange} />);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);
    expect(onChange).toHaveBeenCalledWith(file);
  });

  test('shows file name and size when value provided', () => {
    const file = new File(['hello'], 'beach.jpg', { type: 'image/jpeg' });
    render(<FileUploadZone value={file} />);
    expect(screen.getByText('beach.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove file/i })).toBeInTheDocument();
  });

  test('clear button calls onChange(null)', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const file = new File(['hello'], 'beach.jpg', { type: 'image/jpeg' });
    render(<FileUploadZone value={file} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Remove file/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
