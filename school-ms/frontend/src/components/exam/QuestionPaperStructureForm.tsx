import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  NumberInput,
  NumberInputField,
  Heading,
  Divider,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { QuestionPaperStructure, QuestionSection, QuestionType } from '../../services/examService';


interface QuestionPaperStructureFormProps {
  initialData?: QuestionPaperStructure;
  onChange: (structure: QuestionPaperStructure) => void;
  examId?: number;
  classId?: number;
  subjectId?: number | string;
}

const QuestionPaperStructureForm: React.FC<QuestionPaperStructureFormProps> = ({
  initialData,
  onChange,
  examId,
  classId,
  subjectId,
}) => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  // Save all rows to backend (batch save)
  const handleSave = async () => {
    if (!examId || !classId || !subjectId) {
      toast({ status: 'error', title: 'Missing exam, class, or subject', description: 'Please select and save exam configuration first.' });
      return;
    }
    setIsSaving(true);
    try {
      // Prepare rows for backend (flatten sections to rows)
      const rows = structure.sections.map((section, idx) => ({
        // Backend expects: id (if editing), examId, classId, subjectId, questionNumber, unitName, marks
        id: section.id,
        examId,
        classId,
        subjectId,
        questionNumber: idx + 1,
        unitName: section.name,
        marks: section.marksPerQuestion * section.totalQuestions,
        // Optionally add more fields if backend expects
      }));
      const res = await axios.post('/api/question-paper-format/batch', rows, {
        params: { examId, classId, subjectId },
      });
      toast({ status: 'success', title: 'Saved', description: 'Question paper format saved successfully.' });
      // Optionally reload data or call onChange
    } catch (err: any) {
      toast({ status: 'error', title: 'Save failed', description: err?.response?.data?.message || 'Could not save question paper format.' });
    } finally {
      setIsSaving(false);
    }
  };
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  // Fetch units/chapters from Blueprint API when examId, classId, or subjectId changes
  useEffect(() => {
    if (examId && classId && subjectId) {
      axios
        .get('/api/blueprint', {
          params: {
            examId,
            classId,
            subjectId,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setUnits(res.data.map((u: any) => ({ id: u.id, name: u.name })));
          } else {
            setUnits([]);
          }
        })
        .catch(() => setUnits([]));
    } else {
      setUnits([]);
    }
  }, [examId, classId, subjectId]);
  const [structure, setStructure] = useState<QuestionPaperStructure>({
    name: '',
    totalQuestions: 0,
    mandatoryQuestions: 0,
    optionalQuestions: 0,
    totalMarks: 0,
    sections: [],
  });

  const [currentSection, setCurrentSection] = useState<QuestionSection>({
    name: '',
    questionType: QuestionType.MULTIPLE_CHOICE,
    totalQuestions: 0,
    mandatoryQuestions: 0,
    marksPerQuestion: 0,
  });
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (initialData) {
      setStructure(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    // Update parent component when structure changes
    onChange(structure);
    
    // Calculate totals
    const totalQuestions = structure.sections.reduce(
      (sum, section) => sum + section.totalQuestions,
      0
    );
    const mandatoryQuestions = structure.sections.reduce(
      (sum, section) => sum + section.mandatoryQuestions,
      0
    );
    const totalMarks = structure.sections.reduce(
      (sum, section) => sum + section.totalQuestions * section.marksPerQuestion,
      0
    );

    setStructure(prev => ({
      ...prev,
      totalQuestions,
      mandatoryQuestions,
      optionalQuestions: totalQuestions - mandatoryQuestions,
      totalMarks,
    }));
  }, [structure.sections, onChange]);

  const handleStructureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStructure(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSection(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (field: keyof QuestionSection) => (valueAsString: string, valueAsNumber: number) => {
    setCurrentSection(prev => ({
      ...prev,
      [field]: valueAsNumber,
    }));
  };

  const addSection = () => {
    if (
      !currentSection.name ||
      currentSection.totalQuestions <= 0 ||
      currentSection.mandatoryQuestions < 0 ||
      currentSection.marksPerQuestion <= 0
    ) {
      return;
    }

    if (editingIndex !== null) {
      // Update existing section
      const updatedSections = [...structure.sections];
      updatedSections[editingIndex] = currentSection;

      setStructure(prev => ({
        ...prev,
        sections: updatedSections,
      }));
      setEditingIndex(null);
    } else {
      // Add new section
      setStructure(prev => ({
        ...prev,
        sections: [...prev.sections, currentSection],
      }));
    }

    // Reset form
    setCurrentSection({
      name: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
      totalQuestions: 0,
      mandatoryQuestions: 0,
      marksPerQuestion: 0,
    });
    onClose();
  };

  const editSection = (index: number) => {
    setEditingIndex(index);
    setCurrentSection(structure.sections[index]);
    onOpen();
  };

  const deleteSection = (index: number) => {
    setStructure(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Structure Name</FormLabel>
          <Input
            name="name"
            value={structure.name}
            onChange={handleStructureChange}
            placeholder="e.g., Standard Math Paper Structure"
          />
        </FormControl>

        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Section Name</Th>
              <Th>Question Type</Th>
              <Th isNumeric>Total Questions</Th>
              <Th isNumeric>Mandatory</Th>
              <Th isNumeric>Marks Each</Th>
              <Th isNumeric>Total Marks</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {structure.sections.map((section, index) => (
              <Tr key={index}>
                <Td>{section.name}</Td>
                <Td>{section.questionType.replace(/_/g, ' ')}</Td>
                <Td isNumeric>{section.totalQuestions}</Td>
                <Td isNumeric>{section.mandatoryQuestions}</Td>
                <Td isNumeric>{section.marksPerQuestion}</Td>
                <Td isNumeric>{section.totalQuestions * section.marksPerQuestion}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit section"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => editSection(index)}
                  />
                  <IconButton
                    aria-label="Delete section"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => deleteSection(index)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onOpen}>
          Add Question Section
        </Button>

        <Divider />

        <Box>
          <Heading size="sm" mb={2}>
            Paper Summary
          </Heading>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
            <Box>
              <FormLabel>Total Questions</FormLabel>
              <NumberInput isReadOnly value={structure.totalQuestions}>
                <NumberInputField />
              </NumberInput>
            </Box>
            <Box>
              <FormLabel>Mandatory Questions</FormLabel>
              <NumberInput isReadOnly value={structure.mandatoryQuestions}>
                <NumberInputField />
              </NumberInput>
            </Box>
            <Box>
              <FormLabel>Total Marks</FormLabel>
              <NumberInput isReadOnly value={structure.totalMarks}>
                <NumberInputField />
              </NumberInput>
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Save Button */}
      <Box mt={6} textAlign="right">
        <Button colorScheme="blue" onClick={handleSave} isLoading={isSaving} leftIcon={isSaving ? <Spinner size="sm" /> : undefined}>
          Save
        </Button>
      </Box>

      {/* Question Section Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingIndex !== null ? 'Edit Question Section' : 'Add Question Section'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>

              <FormControl isRequired>
                <FormLabel>Unit Name</FormLabel>
                <Select
                  name="name"
                  placeholder={
                    !examId
                      ? 'Save exam configuration to select units'
                      : units.length === 0
                        ? 'No units available'
                        : 'Select unit'
                  }
                  value={currentSection.name}
                  onChange={handleSectionChange}
                  isDisabled={!examId || units.length === 0}
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Question Type</FormLabel>
                <Select
                  name="questionType"
                  value={currentSection.questionType}
                  onChange={handleSectionChange}
                >
                  {Object.values(QuestionType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Instructions (Optional)</FormLabel>
                <Input
                  name="instructions"
                  placeholder="e.g., Answer any 5 questions from this section"
                  value={currentSection.instructions || ''}
                  onChange={handleSectionChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Number of Questions</FormLabel>
                <NumberInput
                  min={1}
                  value={currentSection.totalQuestions}
                  onChange={handleNumberChange('totalQuestions')}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Mandatory Questions</FormLabel>
                <NumberInput
                  min={0}
                  max={currentSection.totalQuestions}
                  value={currentSection.mandatoryQuestions}
                  onChange={handleNumberChange('mandatoryQuestions')}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Marks per Question</FormLabel>
                <NumberInput
                  min={0.5}
                  step={0.5}
                  value={currentSection.marksPerQuestion}
                  onChange={handleNumberChange('marksPerQuestion')}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={addSection}>
              {editingIndex !== null ? 'Update' : 'Add'} Section
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionPaperStructureForm;
