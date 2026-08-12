/**
 * Locale-aware formatting utilities for Biizora
 * Supports English ('en-IN') and Gujarati ('gu-IN')
 */

export const getLocale = (lang = 'en') => (lang.startsWith('gu') ? 'gu-IN' : 'en-IN');

export const formatCurrency = (amount, lang = 'en') => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat(getLocale(lang), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(numericAmount);
};

export const formatNumber = (num, lang = 'en') => {
  const val = Number(num) || 0;
  return new Intl.NumberFormat(getLocale(lang)).format(val);
};

export const formatDate = (dateStr, lang = 'en', options = {}) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(getLocale(lang), defaultOptions).format(date);
};

export const formatTime = (dateStr, lang = 'en') => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  return new Intl.DateTimeFormat(getLocale(lang), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};
