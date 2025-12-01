"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_DEALS = gql`
  query GetDeals {
    deals {
      id
      title
      value
      stage
      closeDate
    }
  }
`;

export default function DealsPage() {
  const { loading, error, data } = useQuery<any>(GET_DEALS);

  if (loading) return <p className="p-4">Loading deals...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Create Deal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].map((stage) => (
          <div key={stage} className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-4 text-sm font-medium uppercase text-gray-500">{stage.replace('_', ' ')}</h3>
            <div className="space-y-4">
              {data?.deals?.filter((deal: any) => deal.stage === stage).map((deal: any) => (
                <div key={deal.id} className="rounded-md bg-white p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900">{deal.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">${deal.value.toLocaleString()}</p>
                  <p className="mt-2 text-xs text-gray-400">Close: {deal.closeDate || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
