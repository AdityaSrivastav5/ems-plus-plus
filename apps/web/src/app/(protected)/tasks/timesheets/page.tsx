"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';

const GET_TIMESHEETS = gql`
  query GetTimesheets {
    timesheets {
      id
      date
      hours
      description
      task {
        id
        title
      }
    }
    tasks {
      id
      title
    }
  }
`;

const CREATE_TIMESHEET = gql`
  mutation CreateTimesheet($input: TimesheetInput!) {
    createTimesheet(input: $input) {
      id
      hours
    }
  }
`;

const DELETE_TIMESHEET = gql`
  mutation DeleteTimesheet($id: ID!) {
    deleteTimesheet(id: $id)
  }
`;

export default function TimesheetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, loading, refetch } = useQuery(GET_TIMESHEETS, {
    fetchPolicy: 'network-only'
  });

  const [createTimesheet] = useMutation(CREATE_TIMESHEET);
  const [deleteTimesheet] = useMutation(DELETE_TIMESHEET);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    try {
      await createTimesheet({
        variables: {
          input: {
            ...formData,
            hours: parseFloat(formData.hours)
          }
        }
      });
      toast.success('Time entry logged');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to log time');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteTimesheet({ variables: { id } });
        toast.success('Entry deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (item: any) => new Date(parseInt(item.date)).toLocaleDateString()
    },
    { 
      key: 'task', 
      label: 'Task',
      render: (item: any) => item.task?.title || '-'
    },
    { key: 'hours', label: 'Hours' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <Toaster />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">Track your work hours</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Log Time
        </button>
      </div>

      <Table
        columns={columns}
        data={data?.timesheets || []}
        total={data?.timesheets?.length || 0}
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
        title="Log Time"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              {...register('date', { required: true })}
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <select
              {...register('taskId')}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            >
              <option value="">Select a task...</option>
              {data?.tasks?.map((t: any) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours</label>
            <input
              {...register('hours', { required: true, min: 0.1 })}
              type="number"
              step="0.1"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={2}
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
              Save Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
