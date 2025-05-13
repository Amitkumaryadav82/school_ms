declare module '../components/tables/TransportRouteTable' {
  import { TransportRoute } from '../services/feeService';
  
  interface TransportRouteTableProps {
    transportRoutes: TransportRoute[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onRefresh: () => void;
  }

  const TransportRouteTable: React.FC<TransportRouteTableProps>;
  export default TransportRouteTable;
}

declare module '../components/tables/FeeStructureTable' {
  import { FeeStructure } from '../services/feeService';
  
  interface FeeStructureTableProps {
    feeStructures: FeeStructure[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onRefresh: () => void;
  }

  const FeeStructureTable: React.FC<FeeStructureTableProps>;
  export default FeeStructureTable;
}

declare module '../components/StudentFeeDetails' {
  import { StudentFeeDetails as StudentFeeDetailsType } from '../services/feeService';
  
  interface StudentFeeDetailsProps {
    feeDetails: StudentFeeDetailsType;
  }

  const StudentFeeDetails: React.FC<StudentFeeDetailsProps>;
  export default StudentFeeDetails;
}
