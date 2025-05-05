import React, { useState } from 'react';

interface AuthErrorDialogProps {
  error: any;
  onClose: () => void;
}

export const AuthErrorDialog: React.FC<AuthErrorDialogProps> = ({ error, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="auth-error-dialog">
      <div className="auth-error-content">
        <h3>Authentication Error</h3>
        <div className="error-message">
          <strong>{error.message || 'Access Denied'}</strong>
          <p>Status code: {error.status}</p>
        </div>

        {error.tokenInfo && (
          <div className="token-info">
            <h4>Token Information:</h4>
            <ul>
              <li><strong>Username:</strong> {error.tokenInfo.username}</li>
              <li><strong>Roles:</strong> {error.tokenInfo.roles}</li>
              <li><strong>Expiration:</strong> {error.tokenInfo.exp}</li>
            </ul>
          </div>
        )}

        <div className="troubleshooting">
          <h4>Troubleshooting:</h4>
          <ul>
            <li>Verify you have the required role (ADMIN) for this operation</li>
            <li>Try logging out and logging back in</li>
            <li>Check that your token has not expired</li>
          </ul>
        </div>

        <div className="buttons">
          <button onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
          </button>
          <button onClick={onClose}>Close</button>
        </div>

        {showDetails && (
          <div className="technical-details">
            <h4>Technical Details:</h4>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthErrorDialog;