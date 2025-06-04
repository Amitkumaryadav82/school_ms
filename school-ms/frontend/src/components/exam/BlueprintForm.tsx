import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  NumberInput,
  NumberInputField,
  Select,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { ExamBlueprint, ChapterDistribution, QuestionType, ApprovalStatus } from '../../services/examService';
import { examService } from '../../services/examService';

interface BlueprintFormProps {
  examConfigurationId: number;
  initialData?: ExamBlueprint;
  onSubmitSuccess?: (blueprint: ExamBlueprint) => void;
}

const BlueprintForm: React.FC<BlueprintFormProps> = ({ examConfigurationId, initialData, onSubmitSuccess }) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExamBlueprint>({
    name: '',
    examConfigurationId,
    totalMarks: 0,
    description: '',
    createdBy: 0,
    approvalStatus: ApprovalStatus.PENDING,
    chapterDistributions: [],
  });
  const [currentChapter, setCurrentChapter] = useState<ChapterDistribution>({
    chapterName: '',
    weightPercentage: 0,
    totalMarks: 0,
    questionTypeDistribution: [],
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string) => (valueAsString: string, valueAsNumber: number) => {
    setFormData(prev => ({ ...prev, [name]: valueAsNumber }));
  };

  // Chapter Distribution Handlers
  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentChapter(prev => ({ ...prev, [name]: value }));
  };
  const handleChapterNumberChange = (name: string) => (valueAsString: string, valueAsNumber: number) => {
    setCurrentChapter(prev => ({ ...prev, [name]: valueAsNumber }));
  };
  const handleQuestionTypeDistributionChange = (index: number, field: string, value: any) => {
    setCurrentChapter(prev => {
      const updated = [...prev.questionTypeDistribution];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questionTypeDistribution: updated };
    });
  };
  const addQuestionTypeDistribution = () => {
    setCurrentChapter(prev => ({
      ...prev,
      questionTypeDistribution: [
        ...prev.questionTypeDistribution,
        { questionType: QuestionType.MULTIPLE_CHOICE, marks: 0 },
      ],
    }));
  };
  const removeQuestionTypeDistribution = (index: number) => {
    setCurrentChapter(prev => ({
      ...prev,
      questionTypeDistribution: prev.questionTypeDistribution.filter((_, i) => i !== index),
    }));
  };
  const addChapter = () => {
    if (!currentChapter.chapterName || currentChapter.weightPercentage <= 0) return;
    if (editingIndex !== null) {
      const updated = [...formData.chapterDistributions];
      updated[editingIndex] = currentChapter;
      setFormData(prev => ({ ...prev, chapterDistributions: updated }));
      setEditingIndex(null);
    } else {
      setFormData(prev => ({ ...prev, chapterDistributions: [...prev.chapterDistributions, currentChapter] }));
    }
    setCurrentChapter({ chapterName: '', weightPercentage: 0, totalMarks: 0, questionTypeDistribution: [] });
  };
  const editChapter = (index: number) => {
    setEditingIndex(index);
    setCurrentChapter(formData.chapterDistributions[index]);
  };
  const deleteChapter = (index: number) => {
    setFormData(prev => ({ ...prev, chapterDistributions: prev.chapterDistributions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (initialData?.id) {
        response = await examService.updateBlueprint(initialData.id, formData);
        toast({ title: 'Blueprint updated', status: 'success', duration: 3000, isClosable: true });
      } else {
        response = await examService.createBlueprint(formData);
        toast({ title: 'Blueprint created', status: 'success', duration: 3000, isClosable: true });
      }
      if (onSubmitSuccess) onSubmitSuccess(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save blueprint', status: 'error', duration: 3000, isClosable: true });
      console.error('Error saving blueprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="md" mb={4}>{initialData?.id ? 'Edit Blueprint' : 'Create New Blueprint'}</Heading>
      <Stack spacing={4}>
        <FormControl id="name" isRequired>
          <FormLabel>Blueprint Name</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Term 1 Blueprint" />
        </FormControl>
        <FormControl id="description">
          <FormLabel>Description</FormLabel>
          <Input name="description" value={formData.description} onChange={handleChange} placeholder="Optional description" />
        </FormControl>
        <FormControl id="totalMarks" isRequired>
          <FormLabel>Total Marks</FormLabel>
          <NumberInput min={0} value={formData.totalMarks} onChange={handleNumberChange('totalMarks')}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <Divider />
        <Heading size="sm">Chapter Distribution</Heading>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Chapter</Th>
              <Th isNumeric>Weight %</Th>
              <Th isNumeric>Total Marks</Th>
              <Th>Question Type Distribution</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {formData.chapterDistributions.map((chapter, idx) => (
              <Tr key={idx}>
                <Td>{chapter.chapterName}</Td>
                <Td isNumeric>{chapter.weightPercentage}</Td>
                <Td isNumeric>{chapter.totalMarks}</Td>
                <Td>
                  {chapter.questionTypeDistribution.map((qtd, i) => (
                    <span key={i}>{qtd.questionType.replace(/_/g, ' ')}: {qtd.marks} </span>
                  ))}
                </Td>
                <Td>
                  <IconButton aria-label="Edit chapter" icon={<EditIcon />} size="sm" mr={2} onClick={() => editChapter(idx)} />
                  <IconButton aria-label="Delete chapter" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => deleteChapter(idx)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Box borderWidth="1px" borderRadius="md" p={3} mt={2}>
          <Heading size="xs" mb={2}>{editingIndex !== null ? 'Edit Chapter' : 'Add Chapter'}</Heading>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={2} align="flex-end">
            <FormControl isRequired>
              <FormLabel>Chapter Name</FormLabel>
              <Input name="chapterName" value={currentChapter.chapterName} onChange={handleChapterChange} placeholder="e.g., Algebra" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Weight %</FormLabel>
              <NumberInput min={0} max={100} value={currentChapter.weightPercentage} onChange={handleChapterNumberChange('weightPercentage')}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Total Marks</FormLabel>
              <NumberInput min={0} value={currentChapter.totalMarks} onChange={handleChapterNumberChange('totalMarks')}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <Button onClick={addChapter} colorScheme="teal">{editingIndex !== null ? 'Update' : 'Add'} Chapter</Button>
          </Stack>
          <Box mt={2}>
            <Heading size="xs">Question Type Distribution</Heading>
            <Button size="xs" leftIcon={<AddIcon />} onClick={addQuestionTypeDistribution} mt={1} mb={2}>Add Type</Button>
            <Stack spacing={1}>
              {currentChapter.questionTypeDistribution.map((qtd, i) => (
                <Stack key={i} direction="row" align="center">
                  <Select value={qtd.questionType} onChange={e => handleQuestionTypeDistributionChange(i, 'questionType', e.target.value)} size="sm">
                    {Object.values(QuestionType).map(type => (
                      <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                  <NumberInput min={0} value={qtd.marks} onChange={(_, val) => handleQuestionTypeDistributionChange(i, 'marks', val)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                  <IconButton aria-label="Remove" icon={<DeleteIcon />} size="xs" colorScheme="red" onClick={() => removeQuestionTypeDistribution(i)} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
        <Button mt={6} colorScheme="blue" isLoading={isSubmitting} type="submit" size="lg">{initialData?.id ? 'Update Blueprint' : 'Create Blueprint'}</Button>
      </Stack>
    </Box>
  );
};

export default BlueprintForm;
