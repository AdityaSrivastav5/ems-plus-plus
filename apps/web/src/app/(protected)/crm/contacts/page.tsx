"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';

const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      id
      name
      email
      phone
      company
      position
      createdAt
    }
  }
`;

const CREATE_CONTACT = gql`
  mutation CreateContact($input: ContactInput!) {
    createContact(input: $input) {
      id
      name
    }
  }
`;

const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, loading, refetch } = useQuery(GET_CONTACTS, {
    fetchPolicy: 'network-only'
  });

  const [createContact] = useMutation(CREATE_CONTACT);
  const [deleteContact] = useMutation(DELETE_CONTACT);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    try {
      await createContact({
        variables: {
          input: formData
        }
      });
      toast.success('Contact created successfully');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to create contact');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact({ variables: { id } });
        toast.success('Contact deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
  ];

  return (
    <div className="space-y-6">
      <Toaster />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business contacts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Contact
        </button>
      </div>

      <Table
        columns={columns}
        data={data?.contacts || []}
        total={data?.contacts?.length || 0}
        page={1}
        pageSize={100}
        onPageChange={() => {}}
        loading={loading}
        actions={(item) => (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Contact"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name', { required: true })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                {...register('company')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                {...register('position')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
            >
              Create Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
