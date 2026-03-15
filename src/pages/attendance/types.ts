export type AttendanceStatus = 'ON TIME' | 'LATE' | 'ON LEAVE' | 'PRESENT';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AttendanceRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: string;
  status: AttendanceStatus;
}

export interface TeamMember {
  name: string;
  role: string;
  status: AttendanceStatus;
  clockIn: string;
  workingHours: string;
  avatar?: string;
}

export interface LeaveRequest {
  id: string;
  name: string;
  role: string;
  type: 'Sick Leave' | 'Casual';
  dates: string;
  duration: string;
  reason: string;
  status: LeaveStatus;
}