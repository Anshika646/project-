import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  dataKey: string;
}

export function exportToPDF(
  title: string,
  columns: ExportColumn[],
  data: Record<string, unknown>[],
  fileName = 'report.pdf'
) {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(16);
  doc.setTextColor(40, 56, 44);
  doc.text(title, 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(110, 126, 115);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • Edunexa ERP`, 14, 28);

  // Table
  const tableHeaders = columns.map((c) => c.header);
  const tableRows = data.map((row) => columns.map((col) => String(row[col.dataKey] ?? '')));

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 34,
    theme: 'striped',
    headStyles: {
      fillColor: [91, 110, 94], // Olive green from Edunexa palette
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [247, 246, 242],
    },
  });

  doc.save(fileName);
}

export function exportToExcel(
  data: Record<string, unknown>[],
  fileName = 'export.xlsx',
  sheetName = 'Sheet1'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
