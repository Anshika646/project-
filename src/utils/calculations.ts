export interface GradeResult {
  grade: string;
  points: number;
  remark: string;
}

export function calculateGrade(percentage: number): GradeResult {
  if (percentage >= 91) {
    return { grade: 'A1', points: 10.0, remark: 'Outstanding' };
  }
  if (percentage >= 81) {
    return { grade: 'A2', points: 9.0, remark: 'Excellent' };
  }
  if (percentage >= 71) {
    return { grade: 'B1', points: 8.0, remark: 'Very Good' };
  }
  if (percentage >= 61) {
    return { grade: 'B2', points: 7.0, remark: 'Good' };
  }
  if (percentage >= 51) {
    return { grade: 'C1', points: 6.0, remark: 'Fair' };
  }
  if (percentage >= 41) {
    return { grade: 'C2', points: 5.0, remark: 'Average' };
  }
  if (percentage >= 33) {
    return { grade: 'D', points: 4.0, remark: 'Pass' };
  }
  return { grade: 'E', points: 0.0, remark: 'Needs Improvement' };
}

export function calculateAttendancePercentage(presentCount: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (presentCount < 0) return 0;
  const pct = (presentCount / totalDays) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

export interface SlotTime {
  dayOfWeek: string;
  startTime: string; // e.g. "09:00" or "09:00 AM"
  endTime: string;   // e.g. "10:00" or "10:00 AM"
  teacherId?: string;
  roomNumber?: string;
}

function parseTimeToMinutes(t: string): number {
  const clean = t.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/(AM|PM)/g, '').trim();
  const [hStr, mStr] = timeOnly.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);

  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export function hasTimetableConflict(
  existingSlots: SlotTime[],
  newSlot: SlotTime
): { conflict: boolean; reason?: string } {
  const newStart = parseTimeToMinutes(newSlot.startTime);
  const newEnd = parseTimeToMinutes(newSlot.endTime);

  if (newStart >= newEnd) {
    return { conflict: true, reason: 'Start time must be before end time' };
  }

  for (const slot of existingSlots) {
    if (slot.dayOfWeek.toLowerCase() !== newSlot.dayOfWeek.toLowerCase()) {
      continue;
    }

    const curStart = parseTimeToMinutes(slot.startTime);
    const curEnd = parseTimeToMinutes(slot.endTime);

    // Overlap condition: max(start1, start2) < min(end1, end2)
    const isOverlapping = Math.max(newStart, curStart) < Math.min(newEnd, curEnd);

    if (isOverlapping) {
      if (newSlot.teacherId && slot.teacherId && newSlot.teacherId === slot.teacherId) {
        return {
          conflict: true,
          reason: `Teacher is already assigned to a period between ${slot.startTime} and ${slot.endTime}`,
        };
      }
      if (newSlot.roomNumber && slot.roomNumber && newSlot.roomNumber === slot.roomNumber) {
        return {
          conflict: true,
          reason: `Room ${newSlot.roomNumber} is already booked between ${slot.startTime} and ${slot.endTime}`,
        };
      }
    }
  }

  return { conflict: false };
}

export interface CourseCredit {
  credits: number;
  gradePoints: number;
}

export function calculateSGPA(courses: CourseCredit[]): number {
  if (!courses || courses.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    if (c.credits > 0) {
      totalPoints += c.credits * c.gradePoints;
      totalCredits += c.credits;
    }
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export interface SemesterCredit {
  credits: number;
  sgpa: number;
}

export function calculateCGPA(semesters: SemesterCredit[]): number {
  if (!semesters || semesters.length === 0) return 0;
  let totalWeightedSgpa = 0;
  let totalCredits = 0;

  for (const s of semesters) {
    if (s.credits > 0) {
      totalWeightedSgpa += s.credits * s.sgpa;
      totalCredits += s.credits;
    }
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalWeightedSgpa / totalCredits) * 100) / 100;
}
