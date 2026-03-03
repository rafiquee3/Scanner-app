import { render, screen, fireEvent } from '@testing-library/react';
import ReceiptEditor, { Product } from '@/src/components/ReceiptEditor';
import { expect, it, describe, vi } from 'vitest';

const mockItems: Product[] = [
  { id: '1', name: 'Milk', price: 2.5, category: 'Drinks' },
  { id: '2', name: 'Bread', price: 1.2, category: 'Other Food' },
];

describe('ReceiptEditor', () => {
  const onUpdateItem = vi.fn();
  const onDeleteItem = vi.fn();

  it('renders products correctly', () => {
    render(
      <ReceiptEditor
        items={mockItems}
        date="2024-03-03"
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
      />
    );

    expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bread')).toBeInTheDocument();
    expect(screen.getByText('3.70 EUR')).toBeInTheDocument(); // Correct total
  });

  it('calls onUpdateItem when name is changed', () => {
    render(
      <ReceiptEditor
        items={mockItems}
        date="2024-03-03"
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
      />
    );

    const input = screen.getByDisplayValue('Milk');
    fireEvent.change(input, { target: { value: 'Soy Milk' } });
    expect(onUpdateItem).toHaveBeenCalledWith(0, 'name', 'Soy Milk');
  });

  it('calls onDeleteItem when delete button is clicked', () => {
    render(
      <ReceiptEditor
        items={mockItems}
        date="2024-03-03"
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
      />
    );

    const deleteButtons = screen.getAllByTitle('Delete item');
    fireEvent.click(deleteButtons[0]);
    expect(onDeleteItem).toHaveBeenCalledWith(0);
  });

  it('toggles details visibility', () => {
    render(
      <ReceiptEditor
        items={mockItems}
        date="2024-03-03"
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
      />
    );

    const toggleButton = screen.getByText('More details');
    fireEvent.click(toggleButton);

    // After click, details should show category totals
    expect(screen.getAllByText('Drinks')[0]).toBeInTheDocument();
    expect(screen.getByText('2.50 EUR')).toBeInTheDocument();
  });
});
