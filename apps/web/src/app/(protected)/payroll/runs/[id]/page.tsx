"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

const GET_PAYSLIPS = gql`
  query GetPayslips($runId: ID!) {
    payslips(runId: $runId) {
      id
      employeeId
      netSalary
      pdfUrl
    }
  }
`;

export default function PayrollRunDetailsPage() {
  const params = useParams();
  const runId = params.id as string;
  
  const { loading, error, data } = useQuery<any>(GET_PAYSLIPS, {
    variables: { runId },
  });

  if (loading) return <p className="p-4">Loading payslips...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Run Details</h1>
        <p className="text-sm text-gray-500">Run ID: {runId}</p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Net Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.payslips?.map((payslip: any) => (
              <tr key={payslip.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{payslip.employeeId}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${payslip.netSalary.toLocaleString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-indigo-600 hover:text-indigo-900">
                  <a href={payslip.pdfUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
