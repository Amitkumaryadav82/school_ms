import feeService, { FeeStructure, PaymentSchedule } from '../services/feeService';

/**
 * Process and validate a fee structure to ensure all required fields are set correctly
 */
export const processFeeStructureData = (feeStructure: FeeStructure): FeeStructure => {
  // Calculate total fees explicitly to ensure it's set correctly
  const totalFees = Number(feeStructure.annualFees || 0) + 
                    Number(feeStructure.buildingFees || 0) + 
                    Number(feeStructure.labFees || 0);
  
  // Make sure payment schedules have correct amounts based on annual fees
  const updatedSchedules = feeStructure.paymentSchedules.map(schedule => {
    let amount = 0;
    switch (schedule.scheduleType) {
      case 'MONTHLY':
        amount = Number((feeStructure.annualFees / 12).toFixed(2));
        break;
      case 'QUARTERLY':
        amount = Number((feeStructure.annualFees / 4).toFixed(2));
        break;
      case 'YEARLY':
        amount = Number(feeStructure.annualFees);
        break;
      default:
        amount = schedule.amount; // Keep existing amount if scheduleType is unknown
    }
    return { ...schedule, amount };
  });
  
  // Return complete fee structure
  return {
    ...feeStructure,
    totalFees: totalFees,
    paymentSchedules: updatedSchedules
  };
};

/**
 * Validate fee structure before submission
 */
export const validateFeeStructure = (feeStructure: FeeStructure): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  const errors: Record<string, string> = {};

  if (!feeStructure.classGrade) {
    errors.classGrade = 'Class/Grade is required';
  }

  if (feeStructure.annualFees < 0) {
    errors.annualFees = 'Annual fees cannot be negative';
  }

  if (feeStructure.buildingFees < 0) {
    errors.buildingFees = 'Building fees cannot be negative';
  }

  if (feeStructure.labFees < 0) {
    errors.labFees = 'Lab fees cannot be negative';
  }

  // Validate at least one payment schedule is enabled
  if (!feeStructure.paymentSchedules.some(schedule => schedule.isEnabled)) {
    errors.paymentSchedules = 'At least one payment schedule must be enabled';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Creates a default fee structure for the specified grade
 * This utility function creates a basic fee structure with default payment schedules
 * which can be used to fix the "Fee not found" error when processing payments
 */
export const createDefaultFeeStructure = async (grade: number): Promise<FeeStructure> => {
  // Create a basic fee structure with default values
  const annualFees = 25000; // Default annual fee amount
  const buildingFees = 5000; // Default building fee amount
  const labFees = 3000; // Default lab fee amount
  
  const newFeeStructure: FeeStructure = {
    classGrade: grade,
    annualFees: annualFees,
    buildingFees: buildingFees,
    labFees: labFees,
    totalFees: annualFees + buildingFees + labFees,
    // Default payment schedules
    paymentSchedules: [
      { scheduleType: 'MONTHLY', amount: Number((annualFees / 12).toFixed(2)), isEnabled: true },
      { scheduleType: 'QUARTERLY', amount: Number((annualFees / 4).toFixed(2)), isEnabled: true },
      { scheduleType: 'YEARLY', amount: annualFees, isEnabled: true }
    ],
    // No late fees by default
    lateFees: []
  };

  try {
    // Submit to the API
    const createdFeeStructure = await feeService.createFeeStructure(newFeeStructure);
    console.log('Fee structure created successfully:', createdFeeStructure);
    return createdFeeStructure;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};

/**
 * Creates a fee structure with the provided data
 */
export const createFeeStructure = async (feeStructure: FeeStructure): Promise<FeeStructure> => {
  try {
    // Process and validate the fee structure data
    const { isValid, errors } = validateFeeStructure(feeStructure);
    
    if (!isValid) {
      const errorMessage = Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('; ');
      throw new Error(`Invalid fee structure: ${errorMessage}`);
    }
    
    // Ensure all fields are properly set
    const processedFeeStructure = processFeeStructureData(feeStructure);
    
    // Submit to the API
    const createdFeeStructure = await feeService.createFeeStructure(processedFeeStructure);
    console.log('Fee structure created successfully:', createdFeeStructure);
    return createdFeeStructure;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};
