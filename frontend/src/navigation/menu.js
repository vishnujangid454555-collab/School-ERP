const item = (label) => ({ label, slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-') });

export const MENU_GROUPS = [
  { label: 'Dashboard', icon: 'dashboard', items: [item('Dashboard')] },
  { label: 'Admission', icon: 'admission', items: ['Admission Enquiry', 'Enquiry Follow-up', 'Admission Application', 'Application Verification', 'Admission Process', 'Admission List', 'Waiting List', 'Admission Documents', 'Admission Reports'].map(item) },
  { label: 'Student Master', icon: 'students', items: ['Student Master', 'Student Documents', 'Student ID Card', 'Student History', 'Student Promotion', 'Student Transfer', 'Student Withdrawal', 'Student Re-Admission', 'Student Import', 'Student Bulk Update'].map(item) },
  { label: 'Academic Master', icon: 'academic', items: ['Subjects', 'Subject Groups', 'Class-Subject', 'Teacher-Subject', 'Class Teacher', 'Grading System', 'Promotion Rules'].map(item) },
  { label: 'Staff Master', icon: 'staff', items: ['Teachers', 'Staff', 'Departments', 'Designations', 'Qualifications', 'Employee Documents', 'Teacher Allocation', 'Staff Allocation'].map(item) },
  { label: 'Attendance', icon: 'attendance', items: ['Student Attendance', 'Teacher Attendance', 'Staff Attendance', 'Leave Management', 'Attendance Correction', 'Attendance Summary'].map(item) },
  { label: 'Fee Master', icon: 'fee', items: ['Fee Types', 'Fee Heads', 'Fee Structure', 'Class Fee Structure', 'Student Fee Structure', 'Installments', 'Concession', 'Discount', 'Fine'].map(item) },
  { label: 'Fee Collection', icon: 'collection', items: ['Collect Fee', 'Bulk Fee Collection', 'Partial Payment', 'Advance Payment', 'Fee Refund', 'Fee Adjustment', 'Fee Receipt', 'Payment History'].map(item) },
  { label: 'Accounts / Finance', icon: 'finance', items: ['Income', 'Expense', 'Expense Category', 'Payment Modes', 'Bank Accounts', 'Cash Book', 'Transactions', 'Vendors', 'Financial Summary'].map(item) },
  { label: 'Examination', icon: 'exam', items: ['Exam Master', 'Exam Schedule', 'Exam Subjects', 'Marks Configuration', 'Marks Entry', 'Marks Verification', 'Grade Configuration', 'Results', 'Result Publish', 'Report Card', 'Student Rank', 'Result Analysis'].map(item) },
  { label: 'Timetable', icon: 'timetable', items: ['Period Master', 'Time Slots', 'Class Timetable', 'Teacher Timetable', 'Room Timetable', 'Subject Allocation', 'Teacher Allocation', 'Substitute Teacher', 'Timetable Conflict'].map(item) },
  { label: 'Homework / Assignment', icon: 'homework', items: ['Homework', 'Assignment', 'Class Homework', 'Subject Homework', 'Homework Submission', 'Submission Checking', 'Marks / Grade', 'Teacher Remarks'].map(item) },
  { label: 'Library', icon: 'library', items: ['Book Category', 'Author', 'Publisher', 'Rack', 'Book Master', 'Book Copies', 'Member Master', 'Issue Book', 'Return Book', 'Renew Book', 'Lost / Damaged Book', 'Fine'].map(item) },
  { label: 'Transport', icon: 'transport', items: ['Vehicle Master', 'Driver Master', 'Conductor Master', 'Route Master', 'Stop Master', 'Route Assignment', 'Student Transport', 'Vehicle Documents', 'Transport Fee', 'Vehicle Maintenance'].map(item) },
  { label: 'Hostel', icon: 'hostel', items: ['Hostel Master', 'Building', 'Room Master', 'Bed Master', 'Warden', 'Student Allocation', 'Room Transfer', 'Hostel Attendance', 'Hostel Fee', 'Visitor'].map(item) },
  { label: 'Communication', icon: 'communication', items: ['Notices', 'Announcements', 'Circulars', 'SMS', 'Email', 'Push Notifications', 'Parent Messages', 'Teacher Messages', 'Notification Templates', 'Message History'].map(item) },
  { label: 'Events & Calendar', icon: 'events', items: ['Calendar', 'Events', 'Holidays', 'Functions', 'Competitions', 'Sports Events', 'Cultural Events', 'Event Participants', 'Event Gallery'].map(item) },
  { label: 'Parent / PTM', icon: 'parent', items: ['Parent Master', 'PTM Schedule', 'PTM Appointment', 'Teacher Remarks', 'Parent Feedback', 'Meeting History'].map(item) },
  { label: 'Documents & Certificates', icon: 'documents', items: ['Document Types', 'Student Documents', 'Staff Documents', 'Certificate Types', 'Bonafide Certificate', 'Transfer Certificate', 'Character Certificate', 'Study Certificate', 'Leaving Certificate', 'Certificate Templates', 'Certificate History'].map(item) },
  { label: 'Activities', icon: 'activities', items: ['Sports', 'Clubs', 'Competitions', 'Cultural Activities', 'Participation', 'Achievements', 'Awards', 'Certificates'].map(item) },
  { label: 'Inventory', icon: 'inventory', items: ['Item Category', 'Unit', 'Item Master', 'Supplier', 'Purchase', 'Stock In', 'Stock Out', 'Issue Item', 'Return Item', 'Stock Adjustment', 'Stock Transfer', 'Stock Reports'].map(item) },
  { label: 'Asset Management', icon: 'assets', items: ['Asset Category', 'Asset Master', 'Asset Allocation', 'Asset Transfer', 'Asset Maintenance', 'Asset Warranty', 'Damaged Asset', 'Disposal', 'Asset Reports'].map(item) },
  { label: 'HR & Payroll', icon: 'payroll', items: ['Salary Structure', 'Salary Components', 'Payroll', 'Salary Processing', 'Salary Advance', 'Deductions', 'Bonus / Incentive', 'Payslip', 'Payroll History'].map(item) },
  { label: 'Complaint / Support', icon: 'support', items: ['Complaints', 'Complaint Categories', 'Student Complaints', 'Parent Complaints', 'Staff Complaints', 'Suggestions', 'Ticket Assignment', 'Priority', 'Status', 'Resolution', 'Complaint History'].map(item) },
  { label: 'Reports', icon: 'reports', items: ['Student Reports', 'Admission Reports', 'Academic Reports', 'Attendance Reports', 'Fee Reports', 'Finance Reports', 'Examination Reports', 'Timetable Reports', 'Homework Reports', 'Library Reports', 'Transport Reports', 'Hostel Reports', 'Staff / HR Reports', 'Inventory Reports', 'Asset Reports', 'Communication Reports', 'Activity Reports', 'Complaint Reports'].map(item) },
  { label: 'User Management', icon: 'users', items: ['Users', 'Roles', 'Permissions', 'Role Permissions', 'User Permissions', 'User Activation / Deactivation', 'Login History', 'Activity Logs', 'Audit Logs'].map(item) },
  { label: 'Settings', icon: 'settings', items: ['School Profile', 'Academic Session', 'Classes', 'Sections', 'Departments', 'Houses', 'Streams', 'Medium', 'Shifts', 'Working Days', 'Holidays', 'General Settings', 'Academic Settings', 'Attendance Settings', 'Fee Settings', 'Exam Settings', 'Notification Settings', 'SMS Settings', 'Email Settings', 'Payment Settings', 'Receipt Settings', 'ID Card Settings', 'Certificate Settings', 'Document Settings', 'System Settings'].map(item) },
].map((group) => ({ ...group, key: group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));

export function menuPath(group, menuItem) {
  return `/${group.key}/${menuItem.slug}`;
}

export function findMenuItem(pathname) {
  for (const group of MENU_GROUPS) {
    const found = group.items.find((menuItem) => menuPath(group, menuItem) === pathname);
    if (found) return { group, item: found };
  }
  return { group: MENU_GROUPS[0], item: MENU_GROUPS[0].items[0] };
}
