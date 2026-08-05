const STATE_MAPPING = {
  '01': { state: 'Jammu and Kashmir', code: 'JK' },
  '02': { state: 'Himachal Pradesh', code: 'HP' },
  '03': { state: 'Punjab', code: 'PB' },
  '04': { state: 'Chandigarh', code: 'CH' },
  '05': { state: 'Uttarakhand', code: 'UT' },
  '06': { state: 'Haryana', code: 'HR' },
  '07': { state: 'Delhi', code: 'DL' },
  '08': { state: 'Rajasthan', code: 'RJ' },
  '09': { state: 'Uttar Pradesh', code: 'UP' },
  '10': { state: 'Bihar', code: 'BH' },
  '11': { state: 'Sikkim', code: 'SK' },
  '12': { state: 'Arunachal Pradesh', code: 'AR' },
  '13': { state: 'Nagaland', code: 'NL' },
  '14': { state: 'Manipur', code: 'MN' },
  '15': { state: 'Mizoram', code: 'MZ' },
  '16': { state: 'Tripura', code: 'TR' },
  '17': { state: 'Meghalaya', code: 'ML' },
  '18': { state: 'Assam', code: 'AS' },
  '19': { state: 'West Bengal', code: 'WB' },
  '20': { state: 'Jharkhand', code: 'JH' },
  '21': { state: 'Odisha', code: 'OR' },
  '22': { state: 'Chhattisgarh', code: 'CG' },
  '23': { state: 'Madhya Pradesh', code: 'MP' },
  '24': { state: 'Gujarat', code: 'GJ' },
  '26': { state: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
  '27': { state: 'Maharashtra', code: 'MH' },
  '29': { state: 'Karnataka', code: 'KA' },
  '30': { state: 'Goa', code: 'GA' },
  '31': { state: 'Lakshadweep', code: 'LD' },
  '32': { state: 'Kerala', code: 'KL' },
  '33': { state: 'Tamil Nadu', code: 'TN' },
  '34': { state: 'Puducherry', code: 'PY' },
  '35': { state: 'Andaman and Nicobar Islands', code: 'AN' },
  '36': { state: 'Telangana', code: 'TS' },
  '37': { state: 'Andhra Pradesh', code: 'AP' },
  '38': { state: 'Ladakh', code: 'LA' },
};

export async function lookupGstin(gstin) {
  const apiKey = process.env.GST_API_KEY;
  const apiUrl = process.env.GST_API_URL;

  const normalizedGstin = gstin.trim().toUpperCase();

  // GSTIN Format Validation
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(normalizedGstin)) {
    throw new Error('Invalid GST Number');
  }

  // If credentials are provided, attempt live lookup
  if (apiKey && apiUrl) {
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/gstin/${normalizedGstin}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Adapt response structure depending on standard clear/masters india response format
        const result = data.data || data;
        
        // Check if inactive or not found
        if (result.status?.toLowerCase() === 'inactive') {
          throw new Error('GST Registration Inactive');
        }
        if (!result.lgnm && !result.legalName) {
          throw new Error('GST Not Found');
        }

        // Return a normalized object matching requirements
        return {
          legalName: result.lgnm || result.legalName || '',
          tradeName: result.tradeNam || result.tradeName || result.lgnm || result.legalName || '',
          gstin: normalizedGstin,
          status: result.sts || result.status || 'Active',
          constitution: result.ctb || result.constitution || 'Proprietorship',
          registrationDate: result.rgdt || result.registrationDate || '',
          address: result.adr || result.address || '',
          buildingNumber: result.bno || result.buildingNumber || '',
          street: result.st || result.street || '',
          locality: result.loc || result.locality || '',
          city: result.dst || result.city || '',
          district: result.dst || result.district || '',
          state: result.stcd || result.state || '',
          stateCode: normalizedGstin.slice(0, 2),
          pincode: result.pncd || result.pincode || '',
          rawResponse: result,
        };
      } else {
        const errText = await response.text();
        console.error('GST API Error:', errText);
        throw new Error('Unable to Fetch Data');
      }
    } catch (apiErr) {
      if (['Invalid GST Number', 'GST Not Found', 'GST Registration Inactive', 'Unable to Fetch Data'].includes(apiErr.message)) {
        throw apiErr;
      }
      throw new Error('Network Error');
    }
  }

  // Mock Fallback Lookup if credentials are not configured
  const stateCode = normalizedGstin.slice(0, 2);
  const stateInfo = STATE_MAPPING[stateCode] || { state: 'Karnataka', code: 'KA' };

  // Generate realistic details based on GSTIN characters
  const pan = normalizedGstin.slice(2, 12);
  const companyPrefix = pan.slice(0, 4);

  // Return simulated data
  return {
    legalName: `${companyPrefix} ENTERPRISES PRIVATE LIMITED`,
    tradeName: `${companyPrefix} SOLUTIONS`,
    gstin: normalizedGstin,
    status: 'Active',
    constitution: 'Private Limited Company',
    registrationDate: '2018-04-12',
    address: 'Plot No. 42, Electronics City Phase 1',
    buildingNumber: 'Plot No. 42',
    street: 'Electronics City Phase 1',
    locality: 'Hosur Road',
    city: stateInfo.state === 'Delhi' ? 'New Delhi' : 'Bengaluru',
    district: stateInfo.state === 'Delhi' ? 'New Delhi' : 'Bengaluru Urban',
    state: stateInfo.state,
    stateCode: stateCode,
    pincode: '560100',
    rawResponse: { mock: true },
  };
}
