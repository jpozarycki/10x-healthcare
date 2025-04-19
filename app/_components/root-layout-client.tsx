"use client"

import { useState } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success'
  });

  return (
    <div className={inter.className}>
      <div className="container">
        {children}
      </div>
    </div>
  )
} 