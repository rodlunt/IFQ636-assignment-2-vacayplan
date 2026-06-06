import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dialog from './Dialog';

describe('Dialog', () => {
  test('renders nothing when open=false', () => {
    render(
      <Dialog open={false} onClose={() => {}} title="Hidden">
        body
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  test('renders dialog + title + body when open=true', () => {
    render(
      <Dialog open onClose={() => {}} title="Delete Trip?">
        Body content here
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Trip?')).toBeInTheDocument();
    expect(screen.getByText('Body content here')).toBeInTheDocument();
  });

  test('renders icon when icon prop provided', () => {
    const FakeIcon = (props) => <svg data-testid="dialog-icon" {...props} />;
    render(
      <Dialog open onClose={() => {}} title="X" icon={FakeIcon}>
        body
      </Dialog>,
    );
    expect(screen.getByTestId('dialog-icon')).toBeInTheDocument();
  });

  test('does not render icon when icon prop is omitted', () => {
    render(
      <Dialog open onClose={() => {}} title="X">
        body
      </Dialog>,
    );
    expect(screen.queryByTestId('dialog-icon')).not.toBeInTheDocument();
  });

  test.each([
    ['brand', 'bg-brand/10'],
    ['danger', 'bg-danger-bg'],
    ['success', 'bg-success-bg'],
    ['info', 'bg-info-bg'],
  ])('iconTone "%s" applies its bg class', (iconTone, expectedClass) => {
    const FakeIcon = (props) => <svg data-testid="dialog-icon" {...props} />;
    render(
      <Dialog
        open
        onClose={() => {}}
        title="X"
        icon={FakeIcon}
        iconTone={iconTone}
      >
        body
      </Dialog>,
    );
    const iconContainer = screen.getByTestId('dialog-icon').parentElement;
    expect(iconContainer.className).toContain(expectedClass);
  });

  test('ESC key calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Dialog open onClose={onClose} title="X">
        body
      </Dialog>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  test('caller className is appended to panel', () => {
    render(
      <Dialog open onClose={() => {}} title="X" className="custom-panel">
        body
      </Dialog>,
    );
    expect(screen.getByRole('dialog').querySelector('.custom-panel')).toBeInTheDocument();
  });
});
