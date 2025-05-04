import React from 'react';
import { ReactNode } from 'react';
interface LayoutProps {
    children: ReactNode;
}
declare const Layout: ({ children }: LayoutProps) => React.JSX.Element;
export default Layout;
