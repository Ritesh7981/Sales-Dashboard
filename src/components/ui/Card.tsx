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
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
     <div className='h-full'>
      {children}
     </div>
    </div>
  );
}