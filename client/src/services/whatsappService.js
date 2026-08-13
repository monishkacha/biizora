/**
 * WhatsApp Service Abstraction
 * Handles phone normalization, PDF document dispatching, and honest fallback behaviors.
 */

export function normalizePhoneForWhatsApp(phone) {
  if (!phone) return '';
  // Strip all non-digit characters
  let digits = String(phone).replace(/\D/g, '');
  
  // Strip leading zeros
  digits = digits.replace(/^0+/, '');

  // If 10 digits (Standard Indian phone number without country code)
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If starts with 91 and has 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return digits;
}

export async function sendInvoiceToWhatsApp({
  phone,
  pdfBlob,
  filename,
  customerName,
  invoiceNumber,
  totalAmount,
  salonName = 'Glow Salon Studio'
}) {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  if (!normalizedPhone) {
    throw new Error('Invalid or missing customer phone number.');
  }

  const formData = new FormData();
  formData.append('invoice', pdfBlob, filename || `${invoiceNumber}.pdf`);
  formData.append('customerName', customerName);
  formData.append('phone', normalizedPhone);

  let apiSuccess = false;

  try {
    const res = await fetch('http://localhost:5000/api/send-whatsapp-invoice', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        apiSuccess = true;
      }
    }
  } catch (err) {
    console.warn('Backend WhatsApp API not reachable or unconfigured. Proceeding with fallback.', err);
  }

  // Generate downloadable PDF file locally
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || `${salonName.replace(/\s+/g, '-')}-Invoice-${invoiceNumber}.pdf`;
  link.click();

  // Create WhatsApp message string
  const message =
    `Hello ${customerName},%0A%0A` +
    `Thank you for visiting ${salonName}! ✨%0A` +
    `Invoice No: ${invoiceNumber}%0A` +
    `Total Amount: ₹${Number(totalAmount).toFixed(2)}%0A%0A` +
    `Please find your official invoice attached.%0A%0A` +
    `Powered by Biizora`;

  // Open WhatsApp chat
  window.open(`https://wa.me/${normalizedPhone}?text=${message}`, '_blank');

  return {
    apiSuccess,
    normalizedPhone,
    filename: link.download
  };
}
