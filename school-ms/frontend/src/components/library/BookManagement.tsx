import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { libraryService, Book, BookStatus } from '../../services/libraryService';

const BookManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentBook, setCurrentBook] = useState<Book>({
    title: '',
    author: '',
    category: '',
    status: BookStatus.AVAILABLE
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await libraryService.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch books',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await libraryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && !selectedStatus && !selectedCategory) {
      fetchBooks();
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (searchQuery) {
        response = await libraryService.searchBooks(searchQuery);
      } else if (selectedCategory) {
        response = await libraryService.searchBooksByCategory(selectedCategory);
      } else if (selectedStatus) {
        response = await libraryService.getBooksByStatus(selectedStatus);
      }
      
      if (response) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to search books',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentBook({
      ...currentBook,
      [name]: value
    });
  };

  const openAddModal = () => {
    setCurrentBook({
      title: '',
      author: '',
      category: '',
      status: BookStatus.AVAILABLE
    });
    onOpen();
  };

  const openEditModal = (book: Book) => {
    setCurrentBook(book);
    onOpen();
  };

  const handleSubmit = async () => {
    if (!currentBook.title || !currentBook.author || !currentBook.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentBook.id) {
        await libraryService.updateBook(currentBook.id, currentBook);
        toast({
          title: 'Success',
          description: 'Book updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await libraryService.createBook(currentBook);
        toast({
          title: 'Success',
          description: 'Book added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        title: 'Error',
        description: 'Failed to save book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await libraryService.deleteBook(id);
        toast({
          title: 'Success',
          description: 'Book deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete book',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge colorScheme="green">Available</Badge>;
      case 'Issued':
        return <Badge colorScheme="blue">Issued</Badge>;
      case 'Lost':
        return <Badge colorScheme="red">Lost</Badge>;
      case 'Damaged':
        return <Badge colorScheme="orange">Damaged</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Book Management</Heading>
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={openAddModal}>
          Add Book
        </Button>
      </Flex>

      <Stack direction={{ base: 'column', md: 'row' }} mb={4} spacing={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Select
          placeholder="Filter by status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
          <option value="Lost">Lost</option>
          <option value="Damaged">Damaged</option>
        </Select>
        
        <Select
          placeholder="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Select>
        
        <Button colorScheme="blue" onClick={handleSearch}>
          Search
        </Button>
      </Stack>

      {isLoading ? (
        <Text>Loading books...</Text>
      ) : books.length === 0 ? (
        <Text>No books found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Author</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {books.map((book) => (
                <Tr key={book.id}>
                  <Td>{book.title}</Td>
                  <Td>{book.author}</Td>
                  <Td>{book.category}</Td>
                  <Td>{getStatusBadge(book.status)}</Td>
                  <Td>
                    <IconButton
                      aria-label="Edit book"
                      icon={<FaEdit />}
                      size="sm"
                      mr={2}
                      onClick={() => openEditModal(book)}
                    />
                    <IconButton
                      aria-label="Delete book"
                      icon={<FaTrash />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => book.id && handleDelete(book.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentBook.id ? 'Edit Book' : 'Add New Book'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={currentBook.title}
                onChange={handleInputChange}
                placeholder="Enter book title"
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Author</FormLabel>
              <Input
                name="author"
                value={currentBook.author}
                onChange={handleInputChange}
                placeholder="Enter author name"
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Category</FormLabel>
              <Input
                name="category"
                value={currentBook.category}
                onChange={handleInputChange}
                placeholder="Enter category (e.g., Fiction, Science)"
                list="categoryOptions"
              />
              <datalist id="categoryOptions">
                {categories.map((category, index) => (
                  <option key={index} value={category} />
                ))}
              </datalist>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Status</FormLabel>
              <Select 
                name="status" 
                value={currentBook.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Lost">Lost</option>
                <option value="Damaged">Damaged</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BookManagement;
