import { useState, useCallback } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type UseToastReturn = {
  toast: (props: ToastProps) => void;
};

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    setToasts(prev => [...prev, { id: Date.now(), ...props }]);
  }, []);

  // In a real application, you would have a toast component that displays these toasts
  // For now, we'll just log to console
  // You can replace this with a proper toast implementation like sonner or react-hot-toast
  return { toast };
}