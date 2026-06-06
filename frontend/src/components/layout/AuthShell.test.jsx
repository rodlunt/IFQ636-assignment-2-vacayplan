import { render, screen } from '@testing-library/react';
import AuthShell from './AuthShell';

describe('AuthShell', () => {
  test('renders children inside main form panel', () => {
    render(
      <AuthShell>
        <form aria-label="login">
          <button>Sign in</button>
        </form>
      </AuthShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByRole('form', { name: 'login' }));
  });

  test('renders default brand panel when brandPanel prop is omitted', () => {
    render(
      <AuthShell>
        <div>form</div>
      </AuthShell>,
    );
    expect(screen.getByText('VacayPlan')).toBeInTheDocument();
  });

  test('honours custom brandPanel slot', () => {
    render(
      <AuthShell brandPanel={<div data-testid="brand">Custom brand</div>}>
        <div>form</div>
      </AuthShell>,
    );
    expect(screen.getByTestId('brand')).toHaveTextContent('Custom brand');
    expect(screen.queryByText('VacayPlan')).not.toBeInTheDocument();
  });

  test('aside has brand-dark background for the dark navy panel', () => {
    render(
      <AuthShell>
        <div>form</div>
      </AuthShell>,
    );
    expect(screen.getByRole('complementary')).toHaveClass('bg-brand-dark');
  });

  test('uses md:flex for 2-panel split at md+ breakpoints', () => {
    const { container } = render(
      <AuthShell>
        <div>form</div>
      </AuthShell>,
    );
    expect(container.firstChild).toHaveClass('md:flex');
  });

  test('caller className is appended to the root wrapper', () => {
    const { container } = render(
      <AuthShell className="custom">
        <div>form</div>
      </AuthShell>,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
