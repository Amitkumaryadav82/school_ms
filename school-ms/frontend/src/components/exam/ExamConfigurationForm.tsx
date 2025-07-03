import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  Stack, 
  Typography,
  TextField,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExamConfiguration, ExamType } from '../../services/examService';
import { examService } from '../../services/examService';
import QuestionPaperStructureForm from './QuestionPaperStructureForm';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface ExamConfigurationFormProps {
  initialData?: ExamConfiguration;
  onSubmitSuccess?: (config: ExamConfiguration) => void;
}

const ExamConfigurationForm: React.FC<ExamConfigurationFormProps> = ({ initialData, onSubmitSuccess }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExamConfiguration>({
    name: '',
    subject: '',
    grade: 0,
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    passingPercentage: 33,
    examType: ExamType.MIDTERM,
    isActive: true,
    requiresApproval: true,
    approvalStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' }.PENDING,
    academicYear: new Date().getFullYear(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string) => (valueAsString: string, valueAsNumber: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: valueAsNumber
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleQuestionPaperStructureChange = (questionPaperStructure: any) => {
    setFormData(prev => ({
      ...prev,
      questionPaperStructure
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (initialData?.id) {
        response = await examService.updateExamConfiguration(initialData.id, formData);
        toast({
          title: 'Configuration updated',
          description: 'Exam configuration has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await examService.createExamConfiguration(formData);
        toast({
          title: 'Configuration created',
          description: 'Exam configuration has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save exam configuration',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error saving exam configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <HStack mb={4}>
        <IconButton 
          aria-label="Back" 
          icon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
        />
        <Heading size="md">
          {initialData?.id ? 'Edit Exam Configuration' : 'Create New Exam Configuration'}
        </Heading>
      </HStack>
      
      <Stack spacing={4}>
        <FormControl id="name" isRequired>
          <FormLabel>Configuration Name</FormLabel>
          <Input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g., First Term Maths Exam 2025"
          />
        </FormControl>

        <FormControl id="subject" isRequired>
          <FormLabel>Subject</FormLabel>
          <Input 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange} 
            placeholder="e.g., Mathematics"
          />
        </FormControl>

        <FormControl id="grade" isRequired>
          <FormLabel>Grade/Class</FormLabel>
          <Select name="grade" value={formData.grade} onChange={handleChange}>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="examType" isRequired>
          <FormLabel>Exam Type</FormLabel>
          <Select name="examType" value={formData.examType} onChange={handleChange}>
            {Object.entries(ExamType).map(([key, value]) => (
              <option key={key} value={value}>{key}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="academicYear" isRequired>
          <FormLabel>Academic Year</FormLabel>
          <NumberInput 
            min={2000} 
            max={2100} 
            value={formData.academicYear} 
            onChange={handleNumberChange('academicYear')}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <Heading size="sm" mt={4}>Marks Distribution</Heading>
        <Flex gap={4}>
          <FormControl id="theoryMaxMarks" isRequired>
            <FormLabel>Theory Max Marks</FormLabel>
            <NumberInput 
              min={0} 
              value={formData.theoryMaxMarks} 
              onChange={handleNumberChange('theoryMaxMarks')}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl id="practicalMaxMarks" isRequired>
            <FormLabel>Practical Max Marks</FormLabel>
            <NumberInput 
              min={0} 
              value={formData.practicalMaxMarks} 
              onChange={handleNumberChange('practicalMaxMarks')}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl id="passingPercentage" isRequired>
            <FormLabel>Passing Percentage</FormLabel>
            <NumberInput 
              min={0} 
              max={100} 
              value={formData.passingPercentage} 
              onChange={handleNumberChange('passingPercentage')}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </Flex>

        <Flex gap={4} mt={2}>
          <FormControl id="isActive">
            <Checkbox 
              name="isActive" 
              isChecked={formData.isActive} 
              onChange={handleCheckboxChange}
            >
              Active Configuration
            </Checkbox>
          </FormControl>

          <FormControl id="requiresApproval">
            <Checkbox 
              name="requiresApproval" 
              isChecked={formData.requiresApproval} 
              onChange={handleCheckboxChange}
            >
              Requires HOD/Principal Approval
            </Checkbox>
          </FormControl>
        </Flex>

        <Divider my={4} />
        
        <Heading size="sm">Question Paper Structure</Heading>
        <QuestionPaperStructureForm 
          initialData={formData.questionPaperStructure} 
          onChange={handleQuestionPaperStructureChange} 
        />

        <Button 
          mt={6} 
          colorScheme="blue" 
          isLoading={isSubmitting} 
          type="submit"
          size="lg"
        >
          {initialData?.id ? 'Update Configuration' : 'Create Configuration'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ExamConfigurationForm;
