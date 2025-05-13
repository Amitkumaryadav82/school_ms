import { Components } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import React from 'react';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: React.CSSProperties | any;
        cell?: React.CSSProperties | any;
        row?: React.CSSProperties | any;
        columnHeader?: React.CSSProperties | any;
        [key: string]: any;
      };
      variants?: any[];
      defaultProps?: any;
    };
  }
}

declare const theme: import("@mui/material").Theme;
export default theme;
