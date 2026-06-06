import { render, screen } from '@testing-library/react';
import PageContainer from './PageContainer';

describe('PageContainer', () => {
  test('renders children', () => {
    render(<PageContainer>hello</PageContainer>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('default variant is "default" (max-w-4xl)', () => {
    render(<PageContainer data-testid="c">x</PageContainer>);
    expect(screen.getByTestId('c')).toHaveClass('max-w-4xl');
  });

  test.each([
    ['narrow', 'max-w-2xl'],
    ['default', 'max-w-4xl'],
    ['wide', 'max-w-7xl'],
  ])('variant "%s" applies its max-width class', (variant, expected) => {
    render(
      <PageContainer variant={variant} data-testid="c">
        x
      </PageContainer>,
    );
    expect(screen.getByTestId('c')).toHaveClass(expected);
  });

  test('unknown variant falls back to default', () => {
    render(
      <PageContainer variant="bogus" data-testid="c">
        x
      </PageContainer>,
    );
    expect(screen.getByTestId('c')).toHaveClass('max-w-4xl');
  });

  test('caller className is appended', () => {
    render(
      <PageContainer className="custom" data-testid="c">
        x
      </PageContainer>,
    );
    expect(screen.getByTestId('c')).toHaveClass('custom');
  });

  test('always applies mx-auto + px + py base classes', () => {
    render(<PageContainer data-testid="c">x</PageContainer>);
    expect(screen.getByTestId('c')).toHaveClass('mx-auto', 'px-4', 'py-6');
  });
});
