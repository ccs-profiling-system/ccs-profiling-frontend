interface PDFTemplateProps {
  title: string;
  subtitle?: string;
  totalCount: number;
  children: React.ReactNode;
  icon?: string;
  primaryColor?: string;
}

export function PDFTemplate({
  title,
  subtitle = 'College of Computer Studies',
  totalCount,
  children,
  icon = '📄',
  primaryColor = '#2563eb',
}: PDFTemplateProps) {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f5f5f5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${primaryColor};
    }
    
    .header h1 {
      color: #1e293b;
      font-size: 32px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .header .subtitle {
      color: #64748b;
      font-size: 16px;
      margin-top: 8px;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 8px;
      border-left: 4px solid ${primaryColor};
    }
    
    .meta-info div {
      color: #475569;
      font-size: 14px;
    }
    
    .meta-info strong {
      color: #1e293b;
      font-weight: 600;
      font-size: 16px;
    }
    
    .meta-badge {
      background: ${primaryColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    thead {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%);
      color: white;
    }
    
    th {
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s;
    }
    
    tbody tr:hover {
      background-color: #f8fafc;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    td {
      padding: 14px 12px;
      color: #334155;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .status-active {
      background: #dcfce7;
      color: #166534;
    }
    
    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-graduated {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-dropped {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-on-leave {
      background: #fef3c7;
      color: #92400e;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 28px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    
    .print-button:active {
      transform: translateY(0);
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
      
      .print-button {
        display: none;
      }
      
      tbody tr:hover {
        background-color: transparent;
      }
      
      .meta-info {
        background: #f8fafc;
      }
    }
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
  <button class="print-button" onclick="window.print()">
    <span>🖨️</span>
    <span>Print / Save as PDF</span>
  </button>
  
  <div class="container">
    <div class="header">
      <h1>
        <span>${icon}</span>
        <span>${title}</span>
      </h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    
    <div class="meta-info">
      <div>
        <strong>Generated:</strong><br>
        ${new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </div>
      <div class="meta-badge">
        Total: ${totalCount}
      </div>
    </div>
    
    ${children}
    
    <div class="footer">
      <p><strong>This is an official document generated from the CCS Profiling System</strong></p>
      <p>© ${new Date().getFullYear()} College of Computer Studies. All rights reserved.</p>
      <p style="margin-top: 10px; font-size: 11px;">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

function adjustColor(color: string, amount: number): string {
  // Simple color adjustment (darken/lighten)
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
