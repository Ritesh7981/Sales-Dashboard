'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { DashboardProvider } from '@/context/DashboardContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow py-6">
          <div className="md:w-[90%] w-[95%] 2xl:max-w-[90rem] max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </DashboardProvider>
  );
}