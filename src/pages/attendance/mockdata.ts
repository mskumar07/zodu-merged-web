import type { AttendanceRecord, TeamMember, LeaveRequest } from './types';

export const ATTENDANCE_DATA: AttendanceRecord[] = [
  { date: 'Oct 20, 2023', clockIn: '09:02 AM', clockOut: '-- : --', totalHours: '06h 45m', status: 'ON TIME' },
  { date: 'Oct 19, 2023', clockIn: '08:58 AM', clockOut: '06:15 PM', totalHours: '09h 17m', status: 'ON TIME' },
  { date: 'Oct 18, 2023', clockIn: '08:15 AM', clockOut: '06:00 PM', totalHours: '08h 45m', status: 'LATE' },
];

export const TEAM_DATA: TeamMember[] = [
  { name: 'Isabella Rossi', role: 'UI/UX Designer', status: 'PRESENT', clockIn: '08:55 AM', workingHours: '8h 15m' },
  { name: 'Marco Bianchi', role: 'Frontend Dev', status: 'LATE', clockIn: '09:12 AM', workingHours: '--' },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Head Chef',
    type: 'Sick Leave',
    dates: 'Apr 02 - Apr 03',
    duration: '2 days',
    reason: 'I have a high fever and doctor advised 2 days of bed rest.',
    status: 'Pending'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    role: 'Waitstaff',
    type: 'Casual',
    dates: 'Apr 10',
    duration: '1 day',
    reason: 'Need to attend a parent-teacher meeting at my son\'s school.',
    status: 'Pending'
  }
];