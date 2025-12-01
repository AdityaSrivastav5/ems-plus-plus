"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_LEAVE_REQUESTS = gql`
  query GetLeaveRequests($employeeId: ID!) {
    leaveRequests(employeeId: $employeeId) {
      id
      type
      startDate
      endDate
      status
    }
  }
`;

export default function LeavesPage() {
  const employeeId = "1";
  const { loading, error, data } = useQuery<any>(GET_LEAVE_REQUESTS, {
    variables: { employeeId },
  });

  if (loading) return <p className="p-4">Loading leaves...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Apply for Leave
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Sick Leave</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">12 <span className="text-sm text-gray-500 font-normal">days left</span></p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Casual Leave</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">8 <span className="text-sm text-gray-500 font-normal">days left</span></p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Privilege Leave</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">15 <span className="text-sm text-gray-500 font-normal">days left</span></p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.leaveRequests?.map((leave: any) => (
              <tr key={leave.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{leave.type}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {leave.startDate} - {leave.endDate}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                    leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data?.leaveRequests || data.leaveRequests.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
