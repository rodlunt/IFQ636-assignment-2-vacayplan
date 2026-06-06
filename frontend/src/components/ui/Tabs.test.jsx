import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from './Tabs';

const baseItems = [
  { label: 'Overview', content: <div>Overview panel</div> },
  { label: 'Itinerary', content: <div>Itinerary panel</div> },
  { label: 'Budget', content: <div>Budget panel</div> },
];

describe('Tabs', () => {
  test('renders nothing when items is empty', () => {
    const { container } = render(<Tabs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders all tab labels as tab roles', () => {
    render(<Tabs items={baseItems} />);
    expect(
      screen.getAllByRole('tab').map((t) => t.textContent),
    ).toEqual(['Overview', 'Itinerary', 'Budget']);
  });

  test('first tab is selected by default', () => {
    render(<Tabs items={baseItems} />);
    expect(screen.getByText('Overview panel')).toBeInTheDocument();
    expect(screen.queryByText('Itinerary panel')).not.toBeInTheDocument();
  });

  test('defaultIndex picks the initial tab', () => {
    render(<Tabs items={baseItems} defaultIndex={1} />);
    expect(screen.getByText('Itinerary panel')).toBeInTheDocument();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });

  test('clicking a tab switches the visible panel', async () => {
    const user = userEvent.setup();
    render(<Tabs items={baseItems} />);
    await user.click(screen.getByRole('tab', { name: 'Budget' }));
    expect(screen.getByText('Budget panel')).toBeInTheDocument();
  });

  test('onChange fires with the new index', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Tabs items={baseItems} onChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Itinerary' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('selected tab has the brand colour class', () => {
    render(<Tabs items={baseItems} defaultIndex={0} />);
    expect(screen.getByRole('tab', { selected: true })).toHaveClass(
      'text-brand',
    );
  });
});
