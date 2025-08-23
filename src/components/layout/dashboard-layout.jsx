'use client'

import { Sidebar } from './sidebar'

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pl-0 md:pl-72">
        <div className="pt-16 md:pt-6 px-6 pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}