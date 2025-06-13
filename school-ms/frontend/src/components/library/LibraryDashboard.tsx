import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FaBook, FaExchangeAlt, FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import { libraryService } from '../../services/libraryService';
import BookManagement from './BookManagement';
import BookIssueReturn from './BookIssueReturn';
import LibraryReports from './LibraryReports';

const LibraryDashboard: React.FC = () => {
  const [bookCounts, setBookCounts] = useState<Record<string, number>>({
    total: 0,
    available: 0,
    issued: 0,
    lost: 0,
    damaged: 0
  });
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const statBgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [booksCountsResponse, overdueResponse] = await Promise.all([
          libraryService.getBookCounts(),
          libraryService.getOverdueBookIssues()
        ]);
        
        setBookCounts(booksCountsResponse.data);
        setOverdueCount(overdueResponse.data.length);
      } catch (error) {
        console.error('Error fetching library dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <Box p={4}>
      <Heading mb={6}>Library Management</Heading>
      
      <StatGroup mb={8} spacing={8}>
        <Flex width="full" justify="space-between" wrap="wrap" gap={4}>
          <Stat 
            p={4} 
            shadow="md" 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            bg={statBgColor}
            minW="200px"
            flexGrow={1}
          >
            <Flex align="center">
              <Box mr={4}>
                <Icon as={FaBook} w={6} h={6} color="blue.500" />
              </Box>
              <Box>
                <StatLabel>Total Books</StatLabel>
                <StatNumber>{bookCounts.total}</StatNumber>
              </Box>
            </Flex>
          </Stat>
          
          <Stat 
            p={4} 
            shadow="md" 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            bg={statBgColor}
            minW="200px"
            flexGrow={1}
          >
            <Flex align="center">
              <Box mr={4}>
                <Icon as={FaBook} w={6} h={6} color="green.500" />
              </Box>
              <Box>
                <StatLabel>Available</StatLabel>
                <StatNumber>{bookCounts.available}</StatNumber>
              </Box>
            </Flex>
          </Stat>
          
          <Stat 
            p={4} 
            shadow="md" 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            bg={statBgColor}
            minW="200px"
            flexGrow={1}
          >
            <Flex align="center">
              <Box mr={4}>
                <Icon as={FaExchangeAlt} w={6} h={6} color="purple.500" />
              </Box>
              <Box>
                <StatLabel>Issued</StatLabel>
                <StatNumber>{bookCounts.issued}</StatNumber>
              </Box>
            </Flex>
          </Stat>
          
          <Stat 
            p={4} 
            shadow="md" 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            bg={statBgColor}
            minW="200px"
            flexGrow={1}
          >
            <Flex align="center">
              <Box mr={4}>
                <Icon as={FaExclamationTriangle} w={6} h={6} color="orange.500" />
              </Box>
              <Box>
                <StatLabel>Overdue</StatLabel>
                <StatNumber>{overdueCount}</StatNumber>
              </Box>
            </Flex>
          </Stat>
        </Flex>
      </StatGroup>

      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab><Icon as={FaBook} mr={2} /> Books</Tab>
          <Tab><Icon as={FaExchangeAlt} mr={2} /> Issue/Return</Tab>
          <Tab><Icon as={FaChartBar} mr={2} /> Reports</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BookManagement />
          </TabPanel>
          <TabPanel>
            <BookIssueReturn onIssueComplete={() => {
              // Refresh dashboard data when a book is issued/returned
              libraryService.getBookCounts().then(res => setBookCounts(res.data));
              libraryService.getOverdueBookIssues().then(res => setOverdueCount(res.data.length));
            }} />
          </TabPanel>
          <TabPanel>
            <LibraryReports />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default LibraryDashboard;
