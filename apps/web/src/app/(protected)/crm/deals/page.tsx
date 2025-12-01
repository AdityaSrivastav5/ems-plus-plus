"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import KanbanBoard from '@/components/KanbanBoard';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';

const GET_DEALS = gql`
  query GetDeals($stage: String) {
    deals(stage: $stage) {
      id
      title
      value
      stage
      closeDate
      contactName
      company
      createdAt
    }
  }
`;

const CREATE_DEAL = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      title
      stage
    }
  }
`;

const UPDATE_DEAL_STAGE = gql`
  mutation UpdateDealStage($id: ID!, $stage: String!) {
    updateDealStage(id: $id, stage: $stage) {
      id
      stage
    }
  }
`;

const DELETE_DEAL = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;

const STAGES = [
  { id: 'prospecting', title: 'Prospecting' },
  { id: 'qualification', title: 'Qualification' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'negotiation', title: 'Negotiation' },
  { id: 'closed-won', title: 'Closed Won' },
  { id: 'closed-lost', title: 'Closed Lost' },
];

export default function DealsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, loading, refetch } = useQuery(GET_DEALS, {
    fetchPolicy: 'network-only'
  });

  const [createDeal] = useMutation(CREATE_DEAL);
  const [updateStage] = useMutation(UPDATE_DEAL_STAGE);
  const [deleteDeal] = useMutation(DELETE_DEAL);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    try {
      await createDeal({
        variables: {
          input: {
            ...formData,
            value: parseFloat(formData.value) || 0,
            stage: 'prospecting' // Default stage
          }
        }
      });
      toast.success('Deal created successfully');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to create deal');
      console.error(error);
    }
  };

  const handleDragEnd = async (activeId: string, newStage: string) => {
    // Optimistic update could be done here, but for now we'll just wait for server
    try {
      await updateStage({ variables: { id: activeId, stage: newStage } });
      toast.success('Deal moved');
      refetch();
    } catch (error) {
      toast.error('Failed to move deal');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent drag start
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDeal({ variables: { id } });
        toast.success('Deal deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete deal');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <Toaster />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your sales pipeline</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Deal
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <KanbanBoard
            columns={STAGES}
            items={data?.deals || []}
            onDragEnd={handleDragEnd}
            renderItem={(deal) => (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 truncate pr-6">{deal.title}</h4>
                  <button 
                    onClick={(e) => handleDelete(e, deal.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-600">${deal.value.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Company:</span> {deal.company || '-'}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Contact:</span> {deal.contactName || '-'}
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Deal"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Deal Title</label>
            <input
              {...register('title', { required: true })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              placeholder="e.g. Enterprise License - Acme Corp"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Value ($)</label>
            <input
              {...register('value', { required: true })}
              type="number"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
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
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                {...register('contactName')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
            <input
              {...register('closeDate')}
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
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
              Create Deal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
