import { useCallback, useEffect, useRef } from 'react';

// FedaPay public key (live)
const FEDAPAY_PK = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_live_aAUfRsADSFFOgUQFEWoH9sG0';

declare global {
  interface Window {
    FedaPay?: {
      init: (options: {
        public_key: string;
        environment: 'live' | 'sandbox';
        transaction: {
          amount: number;
          description: string;
          currency?: { iso: string };
        };
        customer?: {
          email?: string;
          lastname?: string;
          firstname?: string;
          phone_number?: { number: string; country: string };
        };
        onComplete?: (transaction: { reason: string; transaction?: { status: string } }) => void;
      }) => { open: () => void };
    };
  }
}

const FEDAPAY_SCRIPT = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: (() => void)[] = [];

function loadFedaPayScript(onReady: () => void) {
  if (scriptLoaded) { onReady(); return; }
  callbacks.push(onReady);
  if (scriptLoading) return;
  scriptLoading = true;
  const s = document.createElement('script');
  s.src = FEDAPAY_SCRIPT;
  s.async = true;
  s.onload = () => {
    scriptLoaded = true;
    scriptLoading = false;
    callbacks.forEach(cb => cb());
    callbacks.length = 0;
  };
  document.head.appendChild(s);
}

interface PayOptions {
  amount: number;
  description: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  onError?: (msg: string) => void;
}

export function useFedaPay() {
  const readyRef = useRef(false);

  useEffect(() => {
    loadFedaPayScript(() => { readyRef.current = true; });
  }, []);

  const pay = useCallback((opts: PayOptions) => {
    const doInit = () => {
      if (!window.FedaPay) {
        opts.onError?.('FedaPay non chargé');
        return;
      }
      const [firstname = '', ...rest] = (opts.customerName || '').split(' ');
      const lastname = rest.join(' ') || firstname;

      const widget = window.FedaPay.init({
        public_key: FEDAPAY_PK,
        environment: 'live',
        transaction: {
          amount: opts.amount,
          description: opts.description,
          currency: { iso: 'XOF' },
        },
        customer: {
          email: opts.customerEmail,
          firstname,
          lastname,
        },
        onComplete(trans) {
          if (trans.reason === 'SUCCESSFUL' || trans.transaction?.status === 'approved') {
            opts.onSuccess();
          } else if (trans.reason === 'CANCELED' || trans.reason === 'CLOSED') {
            opts.onCancel?.();
          } else {
            opts.onError?.('Paiement échoué. Veuillez réessayer.');
          }
        },
      });
      widget.open();
    };

    if (readyRef.current) {
      doInit();
    } else {
      loadFedaPayScript(doInit);
    }
  }, []);

  return { pay };
}
