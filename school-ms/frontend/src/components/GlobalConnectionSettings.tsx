import React from 'react';
import ConnectionSettings from './ConnectionSettings';

/**
 * Global ConnectionSettings component
 * This component renders the ConnectionSettings dialog and can be placed at the root of the app
 * to make the connection settings always available.
 */
const GlobalConnectionSettings: React.FC = () => {
  return <ConnectionSettings />;
};

export default GlobalConnectionSettings;
