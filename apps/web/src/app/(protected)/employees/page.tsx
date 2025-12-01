"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const EMPLOYEES_QUERY = gql`
  query Employees($page: Int, $pageSize: Int, $search: String, $department: String) {
    employees(page: $page, pageSize: $pageSize, search: $search, department: $department) {
      employees {
        id
        name
        email
        role
        department
        phone
        status
        joinDate
        salary
      }
      total
      page
      pageSize
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
      email
      role
      department
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeUpdateInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      name
      email
      role
      department
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    salary: ''
  });

  const { data, loading, refetch } = useQuery(EMPLOYEES_QUERY, {
    variables: { page: 1, pageSize: 50, search },
  });

  const [createEmployee, { loading: creating }] = useMutation(CREATE_EMPLOYEE, {
    onCompleted: () => {
      toast.success('Employee created successfully!');
      setIsModalOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  const [updateEmployee, { loading: updating }] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      toast.success('Employee updated successfully!');
      setIsModalOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      toast.success('Employee deleted successfully!');
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', role: '', department: '', phone: '', salary: '' });
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input = {
      name: formData.name,
      email: formData.email,
      role: formData.role || null,
      department: formData.department || null,
      phone: formData.phone || null,
      salary: formData.salary ? parseFloat(formData.salary) : null
    };

    if (editingEmployee) {
      updateEmployee({ variables: { id: editingEmployee.id, input } });
    } else {
      createEmployee({ variables: { input } });
    }
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role || '',
      department: employee.department || '',
      phone: employee.phone || '',
      salary: employee.salary?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteEmployee({ variables: { id } });
    }
  };

  const employees = data?.employees?.employees || [];

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your team members and their information
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No employees found. Click "Add Employee" to create one.
                </td>
              </tr>
            ) : (
              employees.map((employee: any) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.role || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.department || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id, employee.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating || updating ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
