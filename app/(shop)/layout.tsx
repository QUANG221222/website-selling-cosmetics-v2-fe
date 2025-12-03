"use client"
import React, { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
const Layout = ({children} :  { children: React.ReactNode }) => {
  const [selectedTab, setSelectedTab] = useState<{ href: string; label: string; }>({ href: '', label: '' });
  
  return (
    <> 
    <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        <main>
            <div className="min-h-screen py-10">
                {children}
            </div>
        </main>
    <Footer/>
    </>
  )
}

export default Layout
