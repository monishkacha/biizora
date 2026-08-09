/**
 * Lightweight reporting engine — CSV / Excel / PDF-ready export helpers.
 * Controllers can use these without duplicating serialization logic.
 */

export function toCsv(rows = [], columns = []) {
  const cols =
    columns.length > 0
      ? columns
      : rows[0]
        ? Object.keys(rows[0]).map((key) => ({ key, header: key }))
        : [];

  const escape = (val) => {
    const s = val == null ? '' : String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map((c) => escape(c.header || c.key)).join(',');
  const body = rows
    .map((row) => cols.map((c) => escape(typeof c.accessor === 'function' ? c.accessor(row) : row[c.key])).join(','))
    .join('\n');

  return `${header}\n${body}`;
}

export function sendCsv(res, filename, rows, columns) {
  const csv = toCsv(rows, columns);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

/**
 * Placeholder for Excel / PDF adapters — keep API stable for future plugins.
 */
export function exportReport({ format = 'csv', rows, columns, filename = 'report.csv' }) {
  if (format === 'csv') {
    return { contentType: 'text/csv', body: toCsv(rows, columns), filename };
  }
  if (format === 'excel' || format === 'xlsx') {
    // xlsx already in dependencies — callers can pipe through sheet builders later
    return {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: null,
      filename: filename.replace(/\.csv$/i, '.xlsx'),
      note: 'Use xlsx package in route handlers for binary workbook generation',
      rows,
      columns,
    };
  }
  if (format === 'pdf') {
    return {
      contentType: 'application/pdf',
      body: null,
      filename: filename.replace(/\.csv$/i, '.pdf'),
      note: 'PDF renderer to be plugged in via reporting plugins',
      rows,
      columns,
    };
  }
  if (format === 'api' || format === 'json') {
    return { contentType: 'application/json', body: { rows, columns }, filename };
  }
  throw new Error(`Unsupported export format: ${format}`);
}
