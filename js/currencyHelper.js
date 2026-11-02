/**
 * Big Minds — Multi-Currency Helper Module
 * Provides currency catalog, formatting via Intl.NumberFormat, and state persistence.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'bigminds_preferred_currency';
  const DEFAULT_CURRENCY = 'NGN'; // Default for Nigerian senior secondary cohort context

  const CURRENCIES = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' }
  ];

  const CurrencyHelper = {
    CURRENCIES,

    getPreferredCurrency() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && CURRENCIES.some(c => c.code === saved)) {
          return saved;
        }
      } catch (e) {
        console.warn('Could not read currency preference from storage', e);
      }
      return DEFAULT_CURRENCY;
    },

    setPreferredCurrency(code) {
      if (!CURRENCIES.some(c => c.code === code)) return;
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (e) {
        console.warn('Could not save currency preference', e);
      }
      // Notify listeners
      window.dispatchEvent(new CustomEvent('bigminds:currencyChanged', { detail: { currency: code } }));
    },

    getCurrencyInfo(code) {
      const target = code || this.getPreferredCurrency();
      return CURRENCIES.find(c => c.code === target) || CURRENCIES[0];
    },

    format(amount, code) {
      const currency = code || this.getPreferredCurrency();
      const num = Number(amount) || 0;
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: 2
        }).format(num);
      } catch (e) {
        const info = this.getCurrencyInfo(currency);
        return `${info.symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    },

    renderSelector(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const current = options.selected || this.getPreferredCurrency();
      const select = document.createElement('select');
      select.className = options.className || 'currency-select';
      select.setAttribute('aria-label', 'Select display currency');

      CURRENCIES.forEach(curr => {
        const opt = document.createElement('option');
        opt.value = curr.code;
        opt.textContent = `${curr.code} (${curr.symbol} - ${curr.name})`;
        if (curr.code === current) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        const newCode = e.target.value;
        this.setPreferredCurrency(newCode);
        if (typeof options.onChange === 'function') {
          options.onChange(newCode);
        }
      });

      container.replaceChildren(select);
    }
  };

  window.CurrencyHelper = CurrencyHelper;
})(window);
