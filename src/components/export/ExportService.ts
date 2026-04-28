import { PDFTemplate } from './PDFTemplate';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => string;
}

export interface ExportConfig<T> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title: string;
  subtitle?: string;
  icon?: string;
  primaryColor?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T>(config: ExportConfig<T>): void {
  const { data, columns, filename } = config;

  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      if (col.render) {
        const rendered = col.render(item);
        // Strip HTML tags for CSV
        return rendered.replace(/<[^>]*>/g, '');
      }
      return String((item as any)[col.key] || '');
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((field) => `"${field}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data to PDF format (direct download)
 */
export function exportToPDF<T>(config: ExportConfig<T>): void {
  const { data, columns, title, subtitle, filename, primaryColor = '#f97316' } = config;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 249, g: 115, b: 22 }; // Default orange
  };

  const primaryRgb = hexToRgb(primaryColor);

  // Add header
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, doc.internal.pageSize.width / 2, 30, { align: 'center' });
  }

  // Add meta information
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);
  doc.text(`Total Records: ${data.length}`, doc.internal.pageSize.width - 14, 48, {
    align: 'right',
  });

  // Prepare table data
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      if (col.render) {
        const rendered = col.render(item);
        // Strip HTML tags for PDF
        return rendered.replace(/<[^>]*>/g, '');
      }
      return String((item as any)[col.key] || '—');
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 55,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { top: 55, left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      const pageNumber = doc.getCurrentPageInfo().pageNumber;

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      doc.text(
        `© ${new Date().getFullYear()} College of Computer Studies`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Helper function to create status badge HTML
 */
export function createStatusBadge(status: string): string {
  return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
}

/**
 * Helper function to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
