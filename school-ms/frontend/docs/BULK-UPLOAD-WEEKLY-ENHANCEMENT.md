# Weekly Attendance Bulk Upload Enhancement

## Overview

This document outlines the plan to enhance the Bulk Upload functionality in the Staff Attendance Management system to support weekly attendance uploads, similar to the functionality available in the Weekly tab.

## Current State

Currently, the Bulk Upload feature only supports uploading attendance data for a single date. The process involves:
1. Downloading a template CSV file
2. Filling in attendance data for a single day
3. Uploading the file

## Enhancement Goals

1. Allow users to upload attendance data for an entire week at once
2. Leverage existing backend APIs where possible
3. Provide clear validation and feedback
4. Maintain compatibility with the single-day upload format

## Implementation Approach

### Frontend Changes

#### 1. Update AttendanceUpload.tsx

1. **Date Range Selection:**
   - Add start date and end date pickers
   - Add toggle between "Single Day" and "Weekly" upload modes
   - Update validation rules based on selected mode

2. **Template Download:**
   - Update the template download function to create a weekly template when in weekly mode
   - Weekly template will have columns for each day in the selected range

3. **File Validation:**
   - Update validation logic to handle weekly format
   - Add appropriate warnings/errors for the weekly format

4. **Upload Process:**
   - Process the uploaded file based on the selected mode
   - For weekly uploads, transform the data into the appropriate format for the API

#### 2. Component Changes

```tsx
// Example changes for AttendanceUpload.tsx

// Add state for upload mode
const [uploadMode, setUploadMode] = useState<'single' | 'weekly'>('single');
const [weekStartDate, setWeekStartDate] = useState<Dayjs | null>(dayjs().startOf('week'));
const [weekEndDate, setWeekEndDate] = useState<Dayjs | null>(dayjs().endOf('week'));

// Update download template function
const handleDownloadTemplate = async () => {
  try {
    if (uploadMode === 'single') {
      await downloadTemplate({});
    } else {
      // Download weekly template
      await downloadWeeklyTemplate({
        startDate: weekStartDate?.format('YYYY-MM-DD') || '',
        endDate: weekEndDate?.format('YYYY-MM-DD') || ''
      });
    }
  } catch (error) {
    console.error('Error downloading template:', error);
  }
};

// Add new API mutation for weekly template
const { mutateAsync: downloadWeeklyTemplate, isLoading: isDownloadingWeekly } = useApiMutation(
  (dates: {startDate: string, endDate: string}) => 
    employeeAttendanceService.downloadWeeklyAttendanceTemplate(dates.startDate, dates.endDate),
  {
    onSuccess: (data) => {
      // Create a download link for the template
      // Similar to single day download
    }
  }
);

// Update upload function
const handleUpload = async () => {
  if (!selectedFile) {
    showNotification('Please select a file to upload', 'error');
    return;
  }
  
  // Check if there are validation errors and if we should proceed
  if (uploadValidation.errors.length > 0 && !skipValidation) {
    showNotification('Please fix validation errors or check "Skip validation"', 'error');
    return;
  }
  
  try {
    setActiveStep(2); // Move to uploading step
    
    if (uploadMode === 'single') {
      await uploadFile(selectedFile);
    } else {
      await uploadWeeklyFile({
        file: selectedFile,
        startDate: weekStartDate?.format('YYYY-MM-DD') || '',
        endDate: weekEndDate?.format('YYYY-MM-DD') || ''
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    setActiveStep(1); // Move back to validation step
  }
};
```

### API Extensions

#### 1. Create new service methods in employeeAttendanceService.ts

```typescript
// Add to employeeAttendanceService.ts

downloadWeeklyAttendanceTemplate: (startDate: string, endDate: string) => {
  return api.get(`/api/staff/attendance/weekly-template?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob'
  });
},

uploadWeeklyAttendanceFile: (file: File, startDate: string, endDate: string, employeeType: string = 'ALL') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('employeeType', employeeType);
  
  return api.post('/api/staff/attendance/upload-weekly', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

### Integration with Existing Backend APIs

Since we're instructed not to modify the backend code, we'll need to work with existing APIs. Here are two approaches:

#### Option A: Client-side Processing with Existing APIs

1. Parse the weekly CSV file in the frontend
2. For each day in the week, create a separate request using the existing single-day upload API
3. Track progress and consolidate results

#### Option B: Use the Bulk Attendance API

If the backend already has a bulk attendance API, we can potentially repurpose it:

1. Parse the weekly CSV file in the frontend
2. For each day in the week, create a `BulkAttendanceRequest` object
3. Call `markBulkAttendance` for each day

## Recommended Approach

Since we want to avoid backend changes, the recommended approach is **Option A: Client-side Processing with Existing APIs**. This approach allows us to leverage existing APIs while providing a seamless weekly upload experience to the user.

## UI Mockup

```
+-----------------------+
| Bulk Attendance Upload |
+-----------------------+
| Upload Mode:           |
| ○ Single Day ● Weekly  |
+-----------------------+
| Week range:            |
| [Start Date][End Date] |
+-----------------------+
| [Download Template]    |
+-----------------------+
| [Upload CSV File]      |
+-----------------------+
```

## Next Steps

1. Implement the UI changes in AttendanceUpload.tsx
2. Add the new service methods in employeeAttendanceService.ts
3. Implement the client-side processing logic for weekly uploads
4. Add comprehensive error handling and validation
5. Test with various scenarios (partial weeks, holidays, etc.)
