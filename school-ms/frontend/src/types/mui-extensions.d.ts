// Custom type definitions for Material-UI components
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: React.CSSProperties | any;
        [key: string]: any;
      };
      defaultProps?: {
        [key: string]: any;
      };
      variants?: {
        [key: string]: any;
      };
    };
  }
}
