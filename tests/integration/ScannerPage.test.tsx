import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScannerPage from '@/app/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/src/actions/scan-actions', () => ({
  scanImageAction: vi.fn(),
  saveReceiptAction: vi.fn(),
}));

import { scanImageAction, saveReceiptAction } from '@/src/actions/scan-actions';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ScannerPage Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('flows from file selection to showing results', async () => {
    const mockData = [
      { name: 'Coffee', price: 5.50, category: 'Drinks' },
      { date: '2024-03-03' }
    ];
    (scanImageAction as any).mockResolvedValue(mockData);

    render(
      <QueryClientProvider client={queryClient}>
        <ScannerPage />
      </QueryClientProvider>
    );

    // Simulate file upload
    const file = new File(['hello'], 'receipt.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for ReceiptEditor to appear with data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument();
    });

    expect(screen.getByText('5.50 EUR')).toBeInTheDocument();
    expect(screen.getByText('2024-03-03')).toBeInTheDocument();
  });

  it('calls saveReceiptAction when Save is clicked', async () => {
     const mockData = [{ name: 'Bread', price: 2.00, category: 'Food' }];
    (scanImageAction as any).mockResolvedValue(mockData);
    (saveReceiptAction as any).mockResolvedValue({ success: true });

    render(
      <QueryClientProvider client={queryClient}>
        <ScannerPage />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [new File([''], 'test.png')] }
    });

    await waitFor(() => screen.getByText('Save'));
    
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(saveReceiptAction).toHaveBeenCalled();
    });
  });
});
