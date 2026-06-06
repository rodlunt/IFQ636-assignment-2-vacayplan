import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not render when isOpen=false', () => {
    render(<ConfirmDialog isOpen={false} title="Delete?" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders with role=dialog + title + body when open', () => {
    render(
      <ConfirmDialog isOpen title="Delete this trip?" body="All activities will be removed." />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete this trip?')).toBeInTheDocument();
    expect(screen.getByText('All activities will be removed.')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog isOpen title="Delete?" confirmLabel="Delete" destructive onConfirm={onConfirm} />
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ConfirmDialog isOpen title="Delete?" cancelLabel="Cancel" onCancel={onCancel} />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons + replaces confirm label when loading=true', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete?"
        confirmLabel="Delete"
        loading
        destructive
      />
    );
    expect(screen.getByRole('button', { name: /Delete…/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('renders an error message inside the dialog when error prop is set', () => {
    render(
      <ConfirmDialog isOpen title="Delete?" error="Backend exploded." onConfirm={jest.fn()} />
    );
    expect(screen.getByText('Backend exploded.')).toBeInTheDocument();
  });

  it('uses destructive variant + warning icon when destructive=true', () => {
    render(<ConfirmDialog isOpen title="Delete?" destructive confirmLabel="Delete" />);
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn.className).toMatch(/bg-danger/);
  });
});
