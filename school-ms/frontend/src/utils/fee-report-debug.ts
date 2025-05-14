/**
 * Utility functions for debugging fee reports
 */
import { FeePaymentSummary } from '../services/feeService';

/**
 * Analyze fee report data for potential issues
 * @param reportType The type of fee report
 * @param classGrade The optional class grade filter
 * @param data The report data
 * @returns Diagnostic information
 */
export const analyzeFeeReportData = (
  reportType: 'students-with-fees-due' | 'fee-payment-status',
  classGrade: number | null,
  data: any[]
): { 
  diagnostics: string[],
  hasIssues: boolean,
  dataValid: boolean
} => {
  const diagnostics: string[] = [];
  let hasIssues = false;
  
  // Check basic data structure
  if (!Array.isArray(data)) {
    diagnostics.push(`Error: Report data is not an array (type: ${typeof data})`);
    return { diagnostics, hasIssues: true, dataValid: false };
  }
  
  // Log record count
  diagnostics.push(`Report type: ${reportType}, Class grade: ${classGrade || 'All'}, Records: ${data.length}`);
  
  if (data.length === 0) {
    diagnostics.push('Warning: No data records in response');
    hasIssues = true;
  }
  
  // Check for missing fields
  const records = data.slice(0, 5); // Examine up to 5 records
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordDiagnostics: string[] = [];
    
    // Check student identification fields
    if (!record.studentId) recordDiagnostics.push('Missing studentId');
    if (!record.studentName && !record.feeName) recordDiagnostics.push('Missing student name (both studentName and feeName are empty)');
    
    // Check fee amount fields
    if (record.totalAmount === undefined && record.totalDue === undefined) 
      recordDiagnostics.push('Missing total amount (both totalAmount and totalDue are undefined)');
      
    if (record.paidAmount === undefined && record.totalPaid === undefined)
      recordDiagnostics.push('Missing paid amount (both paidAmount and totalPaid are undefined)');
      
    if (record.remainingAmount === undefined && record.balance === undefined)
      recordDiagnostics.push('Missing balance (both remainingAmount and balance are undefined)');
    
    // Check status fields
    if (record.status === undefined && record.paymentStatus === undefined)
      recordDiagnostics.push('Missing payment status');
      
    if (recordDiagnostics.length > 0) {
      diagnostics.push(`Issues in record ${i + 1} (ID: ${record.studentId || 'unknown'}):`);
      recordDiagnostics.forEach(d => diagnostics.push(`  - ${d}`));
      hasIssues = true;
    }
  }    // Special checks for specific grades that may need extra attention
  if (classGrade !== null) {
    diagnostics.push(`\nPerforming additional checks for Grade ${classGrade}:`);
    if (data.length === 0) {
      diagnostics.push(`Warning: No data found for Grade ${classGrade}`);
      hasIssues = true;
    }
  }
  
  // Suggest possible fixes
  if (hasIssues) {
    diagnostics.push('\nPossible solutions:');
    diagnostics.push('1. Check backend FeeService.getFeeStatusReport implementation');
    diagnostics.push('2. Verify that createReportSummary correctly populates all required fields');
    diagnostics.push('3. Ensure the selected grade has properly configured fee structures');
    diagnostics.push('4. Check if students exist for the selected grade and have correctly assigned grade values');
    diagnostics.push('5. Verify special handling for null grades is working correctly');
  } else {
    diagnostics.push('\nAPI data structure appears valid');
  }
  
  return {
    diagnostics,
    hasIssues,
    dataValid: true, // Even with issues, we can still process the data
  };
};

/**
 * Export all diagnostic functions
 */
export default {
  analyzeFeeReportData
};
