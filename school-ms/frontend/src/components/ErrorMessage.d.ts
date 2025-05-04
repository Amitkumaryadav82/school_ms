import React from 'react';
interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}
declare const ErrorMessage: ({ message, onRetry }: ErrorMessageProps) => React.JSX.Element;
export default ErrorMessage;
