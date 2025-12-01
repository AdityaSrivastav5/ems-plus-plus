"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  HomeIcon, 
  UsersIcon, 
  ClockIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon },
  { name: 'Leaves', href: '/leaves', icon: CalendarIcon },
  { name: 'Payroll', href: '/payroll/runs', icon: CurrencyDollarIcon },
  { name: 'CRM', href: '/crm/leads', icon: BriefcaseIcon },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentOrgId, setCurrentOrgId] = useState("");

  useEffect(() => {
    setCurrentOrgId(localStorage.getItem('currentOrgId') || "");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white shadow-sm">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight text-gray-900">EMS++</span>
            </div>
            
            <div className="mt-8 px-4">
               <div className="relative">
                 <select
                   id="org-select"
                   className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium"
                   value={currentOrgId}
                   onChange={(e) => {
                     localStorage.setItem('currentOrgId', e.target.value);
                     setCurrentOrgId(e.target.value);
                     window.location.reload();
                   }}
                 >
                   <option value="" disabled>Select Organization</option>
                   <option value="org-1">Acme Corp</option>
                   <option value="org-2">Beta Inc</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                   <ChevronDownIcon className="h-4 w-4" />
                 </div>
               </div>
            </div>

            <nav className="mt-8 flex-1 space-y-1 px-4">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50/50">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Tom Cook</p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">View profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8 focus:outline-none">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
