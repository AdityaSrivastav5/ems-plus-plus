"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Table from '@/components/Table';

const GET_TODAY_ATTENDANCE = gql`
  query GetTodayAttendance {
    todayAttendance {
      id
      checkIn
      checkOut
      status
    }
  }
`;

const GET_MY_ATTENDANCE = gql`
  query GetMyAttendance {
    myAttendance {
      id
      date
      checkIn
      checkOut
      status
    }
  }
`;

const CLOCK_IN = gql`
  mutation ClockIn {
    clockIn {
      id
      checkIn
      status
    }
  }
`;

const CLOCK_OUT = gql`
  mutation ClockOut {
    clockOut {
      id
      checkOut
      status
    }
  }
`;

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayData, refetch: refetchToday } = useQuery(GET_TODAY_ATTENDANCE, {
    fetchPolicy: 'network-only'
  });
  
  const { data: historyData, refetch: refetchHistory } = useQuery(GET_MY_ATTENDANCE, {
    fetchPolicy: 'network-only'
  });

  const [clockIn, { loading: clockInLoading }] = useMutation(CLOCK_IN);
  const [clockOut, { loading: clockOutLoading }] = useMutation(CLOCK_OUT);

  const handleClockIn = async () => {
    try {
      await clockIn();
      toast.success('Clocked in successfully');
      refetchToday();
      refetchHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      toast.success('Clocked out successfully');
      refetchToday();
      refetchHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out');
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDuration = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (item: any) => formatDate(item.date)
    },
    { 
      key: 'checkIn', 
      label: 'Check In',
      render: (item: any) => formatTime(item.checkIn)
    },
    { 
      key: 'checkOut', 
      label: 'Check Out',
      render: (item: any) => formatTime(item.checkOut)
    },
    { 
      key: 'duration', 
      label: 'Duration',
      render: (item: any) => calculateDuration(item.checkIn, item.checkOut)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'present' ? 'bg-green-100 text-green-800' :
          item.status === 'absent' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {item.status.toUpperCase()}
        </span>
      )
    },
  ];

  const isCheckedIn = !!todayData?.todayAttendance?.checkIn;
  const isCheckedOut = !!todayData?.todayAttendance?.checkOut;

  return (
    <div className="space-y-6">
      <Toaster />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track your daily attendance</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-gray-900">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Clock In/Out Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-sm md:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Today's Status
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-500">Check In</span>
              <span className="font-mono font-medium">
                {formatTime(todayData?.todayAttendance?.checkIn)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-500">Check Out</span>
              <span className="font-mono font-medium">
                {formatTime(todayData?.todayAttendance?.checkOut)}
              </span>
            </div>
            
            <div className="pt-4">
              {!isCheckedIn ? (
                <button
                  onClick={handleClockIn}
                  disabled={clockInLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                >
                  {clockInLoading ? 'Clocking In...' : 'Clock In'}
                </button>
              ) : !isCheckedOut ? (
                <button
                  onClick={handleClockOut}
                  disabled={clockOutLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all"
                >
                  {clockOutLoading ? 'Clocking Out...' : 'Clock Out'}
                </button>
              ) : (
                <div className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-medium border border-green-100">
                  Completed for today
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Recent History
            </h3>
            <div className="flex-1 overflow-hidden">
              <Table
                columns={columns}
                data={historyData?.myAttendance || []}
                total={historyData?.myAttendance?.length || 0}
                page={1}
                pageSize={5}
                onPageChange={() => {}}
                loading={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
