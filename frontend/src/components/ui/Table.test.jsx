import { render, screen } from '@testing-library/react';
import Table from './Table';

describe('Table', () => {
  test('renders a <table> element', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>x</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('Table.Head + Body + Row + Th + Td compose into a full table', () => {
    render(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Td>Jane</Table.Td>
            <Table.Td>jane@example.com</Table.Td>
          </Table.Row>
          <Table.Row>
            <Table.Td>John</Table.Td>
            <Table.Td>john@example.com</Table.Td>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('Th has scope="col" for a11y', () => {
    render(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Th>X</Table.Th>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Td>y</Table.Td>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('scope', 'col');
  });

  test('caller className appended on Table', () => {
    render(
      <Table className="custom">
        <tbody>
          <tr>
            <td>x</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(screen.getByRole('table')).toHaveClass('custom');
  });

  test('caller className appended on Td', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Td className="custom-cell">x</Table.Td>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('cell')).toHaveClass('custom-cell');
  });

  test('Row has border class by default', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Row data-testid="r">
            <Table.Td>x</Table.Td>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByTestId('r')).toHaveClass('border-b');
  });
});
