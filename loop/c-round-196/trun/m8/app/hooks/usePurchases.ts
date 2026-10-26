import { useContext } from 'react';
import { PurchasesContext } from '~/contexts/PurchasesContext';

export function usePurchases() {
  const context = useContext(PurchasesContext);

  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }

  return context;
}
