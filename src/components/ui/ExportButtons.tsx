import { FileDown, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  loading?: boolean;
  className?: string;
}

export function ExportButtons({ 
  onExportPDF, 
  onExportExcel, 
  loading = false,
  className = '' 
}: ExportButtonsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
        >
          <FileDown className="w-4 h-4" />
          <span className="text-sm font-medium">Export PDF</span>
        </button>
      )}
      
      {onExportExcel && (
        <button
          onClick={onExportExcel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-sm font-medium">Export Excel</span>
        </button>
      )}
    </div>
  );
}
