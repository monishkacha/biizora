import xlsx from 'xlsx';
import admZip from 'adm-zip';
import initSqlJs from 'sql.js';
import xml2js from 'xml2js';

// Simple CSV/TSV parser that handles quotes and escape characters
export function parseCsv(text, delimiter = ',') {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }

  if (lines.length === 0) return [];
  const headers = lines[0].map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 1 && values[0] === "") continue;
    const record = {};
    headers.forEach((h, idx) => {
      record[h || `Column_${idx + 1}`] = (values[idx] || '').trim();
    });
    records.push(record);
  }
  return records;
}

export async function parseFile(buffer, fileName) {
  const ext = '.' + fileName.split('.').pop().toLowerCase();

  switch (ext) {
    case '.csv':
      return parseCsv(buffer.toString('utf-8'), ',');
    case '.tsv':
      return parseCsv(buffer.toString('utf-8'), '\t');
    case '.json': {
      const parsed = JSON.parse(buffer.toString('utf-8'));
      return Array.isArray(parsed) ? parsed : (parsed.items || parsed.records || [parsed]);
    }
    case '.xlsx':
    case '.xls': {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    }
    case '.xml': {
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
      const parsed = await parser.parseStringPromise(buffer.toString('utf-8'));
      // Find the list of elements in parsed object
      const rootKey = Object.keys(parsed)[0];
      const root = parsed[rootKey];
      const itemsKey = Object.keys(root).find(k => Array.isArray(root[k])) || Object.keys(root)[0];
      const items = root[itemsKey];
      return Array.isArray(items) ? items : [items];
    }
    case '.sql': {
      // Execute SQL commands in an in-memory SQLite DB and extract data
      const SQL = await initSqlJs();
      const db = new SQL.Database();
      const sqlText = buffer.toString('utf-8');
      db.run(sqlText);
      // Retrieve the table names
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      if (tablesResult.length === 0 || !tablesResult[0].values.length) {
        throw new Error('No tables found in SQL dump.');
      }
      const tableName = tablesResult[0].values[0][0];
      const dataResult = db.exec(`SELECT * FROM ${tableName}`);
      if (dataResult.length === 0) return [];
      const columns = dataResult[0].columns;
      return dataResult[0].values.map(vals => {
        const row = {};
        columns.forEach((col, idx) => {
          row[col] = vals[idx] !== null ? String(vals[idx]) : '';
        });
        return row;
      });
    }
    case '.db':
    case '.sqlite':
    case '.sqlite3': {
      const SQL = await initSqlJs();
      const db = new SQL.Database(buffer);
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      if (tablesResult.length === 0 || !tablesResult[0].values.length) {
        throw new Error('No tables found in SQLite database.');
      }
      const tableName = tablesResult[0].values[0][0];
      const dataResult = db.exec(`SELECT * FROM ${tableName}`);
      if (dataResult.length === 0) return [];
      const columns = dataResult[0].columns;
      return dataResult[0].values.map(vals => {
        const row = {};
        columns.forEach((col, idx) => {
          row[col] = vals[idx] !== null ? String(vals[idx]) : '';
        });
        return row;
      });
    }
    case '.zip': {
      const zip = new admZip(buffer);
      const zipEntries = zip.getEntries();
      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          const innerName = entry.entryName;
          const innerExt = '.' + innerName.split('.').pop().toLowerCase();
          const supported = ['.xlsx', '.xls', '.csv', '.tsv', '.json', '.xml', '.db', '.sqlite', '.sqlite3', '.sql'];
          if (supported.includes(innerExt)) {
            return await parseFile(entry.getData(), innerName);
          }
        }
      }
      throw new Error('No supported files found inside zip archive.');
    }
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
}
