"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_ATTENDANCE = gql`
  query GetAttendance($employeeId: ID!, $date: String!) {
    attendance(employeeId: $employeeId, date: $date) {
      id
      checkIn
      checkOut
      status
    }
  }
`;

const CHECK_IN = gql`
  mutation CheckIn($employeeId: ID!) {
    checkIn(employeeId: $employeeId) {
      id
      checkIn
      status
    }
  }
`;

export default function AttendancePage() {
  // Hardcoded employee ID for demo
  const employeeId = "1";
  const date = new Date().toISOString().split("T")[0];

  const { loading, error, data } = useQuery<any>(GET_ATTENDANCE, {
    variables: { employeeId, date },
  });

  const [checkIn] = useMutation(CHECK_IN);

  const handleCheckIn = async () => {
    try {
      await checkIn({ variables: { employeeId } });
      alert("Checked in successfully!");
    } catch (e) {
      alert("Error checking in");
    }
  };

  if (loading) return <p className="p-4">Loading attendance...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Attendance</h1>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Date: {date}</p>
          <p className="mt-2 text-lg font-medium">
            Status: <span className="text-indigo-600">{data?.attendance?.status || "Not Marked"}</span>
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={!!data?.attendance?.checkIn}
            className="rounded-md bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-gray-300"
          >
            Check In
          </button>
          <button
            disabled={!data?.attendance?.checkIn || !!data?.attendance?.checkOut}
            className="rounded-md bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:bg-gray-300"
          >
            Check Out
          </button>
        </div>

        {data?.attendance?.checkIn && (
          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-600">Check In Time: {new Date(data.attendance.checkIn).toLocaleTimeString()}</p>
            {data.attendance.checkOut && (
              <p className="text-sm text-gray-600">Check Out Time: {new Date(data.attendance.checkOut).toLocaleTimeString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
