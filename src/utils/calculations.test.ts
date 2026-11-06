import { describe, it, expect } from 'vitest';
import {
  calculateGrade,
  calculateAttendancePercentage,
  hasTimetableConflict,
  calculateSGPA,
  calculateCGPA,
} from './calculations';

describe('Grading Calculations', () => {
  it('returns A1 for score >= 91', () => {
    const res = calculateGrade(95);
    expect(res.grade).toBe('A1');
    expect(res.points).toBe(10);
    expect(res.remark).toBe('Outstanding');
  });

  it('returns A2 for score between 81 and 90', () => {
    const res = calculateGrade(85);
    expect(res.grade).toBe('A2');
    expect(res.points).toBe(9);
  });

  it('returns B1 for score between 71 and 80', () => {
    const res = calculateGrade(78.5);
    expect(res.grade).toBe('B1');
  });

  it('returns D for boundary pass score 33', () => {
    const res = calculateGrade(33);
    expect(res.grade).toBe('D');
    expect(res.remark).toBe('Pass');
  });

  it('returns E for failing score < 33', () => {
    const res = calculateGrade(28);
    expect(res.grade).toBe('E');
    expect(res.points).toBe(0);
    expect(res.remark).toBe('Needs Improvement');
  });
});

describe('Attendance Percentage Calculations', () => {
  it('calculates correct percentage with one decimal precision', () => {
    expect(calculateAttendancePercentage(18, 20)).toBe(90.0);
    expect(calculateAttendancePercentage(22, 25)).toBe(88.0);
  });

  it('handles zero total days gracefully without division by zero', () => {
    expect(calculateAttendancePercentage(0, 0)).toBe(0);
  });

  it('clamps values to 100% maximum', () => {
    expect(calculateAttendancePercentage(25, 20)).toBe(100);
  });
});

describe('Timetable Conflict Detection', () => {
  const existing = [
    {
      dayOfWeek: 'Monday',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      teacherId: 'teacher-1',
      roomNumber: 'Room 301',
    },
    {
      dayOfWeek: 'Monday',
      startTime: '10:15 AM',
      endTime: '11:15 AM',
      teacherId: 'teacher-2',
      roomNumber: 'Room 302',
    },
  ];

  it('detects teacher double-booking on same day and overlapping slot', () => {
    const res = hasTimetableConflict(existing, {
      dayOfWeek: 'Monday',
      startTime: '09:30 AM',
      endTime: '10:30 AM',
      teacherId: 'teacher-1',
      roomNumber: 'Room 401',
    });
    expect(res.conflict).toBe(true);
    expect(res.reason).toContain('Teacher is already assigned');
  });

  it('detects room double-booking on same day and overlapping slot', () => {
    const res = hasTimetableConflict(existing, {
      dayOfWeek: 'Monday',
      startTime: '09:15 AM',
      endTime: '09:45 AM',
      teacherId: 'teacher-99',
      roomNumber: 'Room 301',
    });
    expect(res.conflict).toBe(true);
    expect(res.reason).toContain('Room Room 301 is already booked');
  });

  it('allows non-overlapping slots on same day and teacher', () => {
    const res = hasTimetableConflict(existing, {
      dayOfWeek: 'Monday',
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      teacherId: 'teacher-1',
      roomNumber: 'Room 301',
    });
    expect(res.conflict).toBe(false);
  });

  it('allows overlapping times on a different day', () => {
    const res = hasTimetableConflict(existing, {
      dayOfWeek: 'Tuesday',
      startTime: '09:15 AM',
      endTime: '09:45 AM',
      teacherId: 'teacher-1',
      roomNumber: 'Room 301',
    });
    expect(res.conflict).toBe(false);
  });
});

describe('SGPA and CGPA Calculations', () => {
  it('calculates SGPA correctly based on course credits and grade points', () => {
    const courses = [
      { credits: 4, gradePoints: 10 }, // 40
      { credits: 4, gradePoints: 9 },  // 36
      { credits: 3, gradePoints: 8 },  // 24
      { credits: 2, gradePoints: 7 },  // 14
    ]; // Total = 114 / 13 = 8.769 -> 8.77
    expect(calculateSGPA(courses)).toBe(8.77);
  });

  it('calculates cumulative CGPA across semesters', () => {
    const semesters = [
      { credits: 20, sgpa: 8.5 }, // 170
      { credits: 22, sgpa: 9.0 }, // 198
      { credits: 21, sgpa: 8.8 }, // 184.8
    ]; // Total = 552.8 / 63 = 8.77
    expect(calculateCGPA(semesters)).toBe(8.77);
  });
});
