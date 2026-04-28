import type { Student } from '@/types/students';
import type { Faculty } from '@/types/faculty';

/**
 * Export students to CSV format (compatible with Excel)
 */
export function exportStudentsToCSV(students: Student[], filename?: string): void {
  const headers = [
    'Student ID',
    'First Name',
    'Last Name',
    'Email',
    'Program',
    'Year Level',
    'Section',
    'Status',
    'Enrollment Date',
  ];

  const rows = students.map((s) => [
    s.studentId,
    s.firstName,
    s.lastName,
    s.email || '',
    s.program || '',
    s.yearLevel?.toString() || '',
    s.section || '',
    s.status || '',
    s.enrollmentDate || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((field) => `"${field}"`).join(',')),
  ].join('\n');

  downloadFile(
    csvContent,
    filename || `students_${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export students to printable HTML/PDF format
 */
export function exportStudentsToPDF(students: Student[]): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Students Report</title>
  <style>
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
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      color: #1e293b;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .meta-info div {
      color: #475569;
    }
    
    .meta-info strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    thead {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
    }
    
    th {
      padding: 14px 12px;
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
      padding: 12px;
      color: #334155;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .status-active {
      background: #dcfce7;
      color: #166534;
    }
    
    .status-inactive {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-graduated {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-dropped {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
      transition: all 0.3s;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.4);
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
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  
  <div class="container">
    <div class="header">
      <h1>📚 Students Report</h1>
      <p class="subtitle">College of Computer Studies</p>
    </div>
    
    <div class="meta-info">
      <div>
        <strong>Generated:</strong> ${new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </div>
      <div>
        <strong>Total Students:</strong> ${students.length}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Program</th>
          <th>Year</th>
          <th>Section</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${students
          .map(
            (s) => `
          <tr>
            <td><strong>${s.studentId}</strong></td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email || '—'}</td>
            <td>${s.program || '—'}</td>
            <td>${s.yearLevel || '—'}</td>
            <td>${s.section || '—'}</td>
            <td>
              <span class="status-badge status-${s.status || 'inactive'}">
                ${s.status || 'unknown'}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>This is an official document generated from the CCS Profiling System</p>
      <p>© ${new Date().getFullYear()} College of Computer Studies. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Export faculty to CSV format
 */
export function exportFacultyToCSV(faculty: Faculty[], filename?: string): void {
  const headers = [
    'Faculty ID',
    'First Name',
    'Last Name',
    'Email',
    'Department',
    'Position',
    'Status',
  ];

  const rows = faculty.map((f) => [
    f.facultyId,
    f.firstName,
    f.lastName,
    f.email || '',
    f.department || '',
    f.position || '',
    f.status || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((field) => `"${field}"`).join(',')),
  ].join('\n');

  downloadFile(
    csvContent,
    filename || `faculty_${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export faculty to printable HTML/PDF format
 */
export function exportFacultyToPDF(faculty: Faculty[]): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty Report</title>
  <style>
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
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }
    
    .header h1 {
      color: #1e293b;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .meta-info div {
      color: #475569;
    }
    
    .meta-info strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    thead {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
    }
    
    th {
      padding: 14px 12px;
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
      padding: 12px;
      color: #334155;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
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
    
    .status-on-leave {
      background: #fef3c7;
      color: #92400e;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
      transition: all 0.3s;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(124, 58, 237, 0.4);
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
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  
  <div class="container">
    <div class="header">
      <h1>👨‍🏫 Faculty Report</h1>
      <p class="subtitle">College of Computer Studies</p>
    </div>
    
    <div class="meta-info">
      <div>
        <strong>Generated:</strong> ${new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </div>
      <div>
        <strong>Total Faculty:</strong> ${faculty.length}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Faculty ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Position</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${faculty
          .map(
            (f) => `
          <tr>
            <td><strong>${f.facultyId}</strong></td>
            <td>${f.firstName} ${f.lastName}</td>
            <td>${f.email || '—'}</td>
            <td>${f.department || '—'}</td>
            <td>${f.position || '—'}</td>
            <td>
              <span class="status-badge status-${f.status || 'inactive'}">
                ${f.status || 'unknown'}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>This is an official document generated from the CCS Profiling System</p>
      <p>© ${new Date().getFullYear()} College of Computer Studies. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
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
