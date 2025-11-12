import { useRef, useCallback, useContext } from 'react';
import { ToastContext } from '@/app/components/contexts/ToastContext';

/**
 * Hook to prevent duplicate toast notifications during initialization
 *
 * Tracks shown toasts per page load to ensure each initialization toast
 * (e.g., "User Initialized", "Connected to RiskGuard") only appears once.
 *
 * @example
 * const { showUniqueSuccessToast } = useUniqueToast();
 * showUniqueSuccessToast('user_initialized', 'User Initialized');
 */
export const useUniqueToast = () => {
  const { showSuccessToast, showErrorToast, showWarningToast } = useContext(ToastContext);
  const shownToasts = useRef<Set<string>>(new Set());

  const showUniqueSuccessToast = useCallback(
    (key: string, title: string, description?: string) => {
      if (!shownToasts.current.has(key)) {
        shownToasts.current.add(key);
        showSuccessToast(title, description);
      }
    },
    [showSuccessToast]
  );

  const showUniqueErrorToast = useCallback(
    (key: string, title: string, description?: string) => {
      if (!shownToasts.current.has(key)) {
        shownToasts.current.add(key);
        showErrorToast(title, description);
      }
    },
    [showErrorToast]
  );

  const showUniqueWarningToast = useCallback(
    (key: string, title: string, description?: string) => {
      if (!shownToasts.current.has(key)) {
        shownToasts.current.add(key);
        showWarningToast(title, description);
      }
    },
    [showWarningToast]
  );

  return {
    showUniqueSuccessToast,
    showUniqueErrorToast,
    showUniqueWarningToast,
  };
};
