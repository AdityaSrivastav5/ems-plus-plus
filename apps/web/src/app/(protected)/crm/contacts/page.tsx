"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      id
      name
      email
      phone
    }
  }
`;

export default function ContactsPage() {
  const { loading, error, data } = useQuery<any>(GET_CONTACTS);

  if (loading) return <p className="p-4">Loading contacts...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.contacts?.map((contact: any) => (
          <div key={contact.id} className="flex items-center space-x-4 rounded-lg bg-white p-6 shadow">
            <div className="flex-shrink-0">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 text-lg font-medium text-white">
                {contact.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{contact.name}</p>
              <p className="truncate text-sm text-gray-500">{contact.email}</p>
              <p className="truncate text-sm text-gray-500">{contact.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
