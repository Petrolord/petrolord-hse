import Papa from 'papaparse';
import { saveAs } from 'file-saver';

/**
 * Export an array of plain objects to a downloaded CSV file.
 * Uses papaparse so values containing commas/quotes/newlines are escaped correctly.
 *
 * @param {string} filename - desired file name (".csv" appended if missing)
 * @param {Array<Object>} rows - row objects; keys become the header row
 */
export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) return false;
  const csv = Papa.unparse(rows);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
  return true;
}
