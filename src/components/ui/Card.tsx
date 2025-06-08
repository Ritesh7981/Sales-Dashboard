import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export default function Card({ 
  title, 
  children, 
  className = '', 
  actions,
  isLoading = false,
  error = null
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className={`h-96`}>
{children}
          </div>
          
        )}
      </div>
    </div>
  );
}