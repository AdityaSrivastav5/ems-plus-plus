"use client";

import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon, 
  ArrowTrendingUpIcon 
} from "@heroicons/react/24/outline";

const stats = [
  { name: 'Total Employees', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase', icon: UsersIcon },
  { name: 'Avg. Attendance', stat: '96.5%', previousStat: '94.2%', change: '2.3%', changeType: 'increase', icon: ArrowTrendingUpIcon },
  { name: 'Total Payroll', stat: '$5.4M', previousStat: '$5.2M', change: '4.05%', changeType: 'increase', icon: CurrencyDollarIcon },
  { name: 'Active Deals', stat: '245', previousStat: '210', change: '16.6%', changeType: 'increase', icon: BriefcaseIcon },
];

const activity = [
  {
    id: 1,
    person: { name: 'Lindsay Walton', href: '#' },
    assigned: { name: 'Front-end Developer', href: '#' },
    date: '1h ago',
    dateTime: '2023-01-23T11:00',
  },
  {
    id: 2,
    person: { name: 'Courtney Henry', href: '#' },
    assigned: { name: 'Designer', href: '#' },
    date: '3h ago',
    dateTime: '2023-01-23T09:00',
  },
  {
    id: 3,
    person: { name: 'Tom Cook', href: '#' },
    assigned: { name: 'Director of Product', href: '#' },
    date: '5h ago',
    dateTime: '2023-01-23T07:00',
  },
  {
    id: 4,
    person: { name: 'Whitney Francis', href: '#' },
    assigned: { name: 'Copywriter', href: '#' },
    date: '8h ago',
    dateTime: '2023-01-23T04:00',
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>
      
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
                ) : (
                  <ArrowTrendingUpIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                )}
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Activity</h3>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <ul role="list" className="divide-y divide-gray-200">
            {activity.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex space-x-3">
                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                    {item.person.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        <span className="text-gray-900">{item.person.name}</span>
                        <span className="text-gray-500"> assigned </span>
                        <span className="text-gray-900">{item.assigned.name}</span>
                      </h3>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
