/**
 * School OS Mobile API Client
 * Connects to Laravel API gateway with multi-tenant subdomains & bearer token auth.
 */

import { crashlytics } from '../services/crashlyticsService';

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  token?: string;
  user?: AuthUser;
  roles?: string[];
  permissions?: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  tenant_id?: string | null;
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
}

export interface ChildProfile {
  id: string;
  full_name: string;
  admission_number: string;
  class_name: string;
  gender: string;
  gate_status: {
    direction: 'in' | 'out';
    tapped_at: string;
    terminal: string;
  } | null;
  fee_balance: number;
  wallet_balance: number;
}

export interface ChildInvoiceItem {
  id: string;
  name: string;
  amount: number;
  paid_amount: number;
  balance: number;
}

export interface ChildInvoice {
  id: string;
  invoice_number: string;
  term_name: string;
  session_name: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  due_date: string;
  items: ChildInvoiceItem[];
}

export interface ChildAttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  gate_in_time?: string | null;
  gate_out_time?: string | null;
  terminal_in?: string | null;
}

export interface ChildSubjectGrade {
  subject_id: string;
  subject_name: string;
  ca_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
}

export interface ChildTerminalResult {
  term_name: string;
  session_name: string;
  class_name: string;
  total_obtainable: number;
  total_obtained: number;
  average_score: number;
  position_in_class?: string | null;
  principal_remarks: string;
  teacher_remarks: string;
  financial_clearance: boolean;
  subjects: ChildSubjectGrade[];
}

export interface TeacherProfileData {
  id: string;
  staff_id_number: string;
  full_name: string;
  designation: string;
  role_type: string;
  employment_type: string;
  department: string;
  email: string;
  phone?: string | null;
  joined_at?: string | null;
  confirmation_date?: string | null;
  status: string;
  banking: {
    bank_name: string;
    account_number_masked: string;
    account_name: string;
    pension_pfa: string;
  };
  emergency_contact: {
    name?: string | null;
    phone?: string | null;
  };
  allocations_count: number;
}

export interface LeaveBalanceItem {
  leave_type_id: string;
  name: string;
  code: string;
  is_paid: boolean;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  requires_attachment: boolean;
}

export interface LeaveHistoryItem {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'rejected';
  approval_notes?: string | null;
  reliever?: string | null;
  created_at: string;
}

export interface ReliefDutyItem {
  id: string;
  coverage_date: string;
  period_number: number;
  absent_teacher: string;
  class_name: string;
  subject_name: string;
  status: 'assigned' | 'acknowledged' | 'completed' | 'missed';
  handover_notes?: string | null;
  acknowledged_at?: string | null;
  completed_at?: string | null;
}

export interface StaffAttendanceDayRecord {
  date: string;
  status: 'present' | 'late' | 'absent' | 'half_day';
  mode?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  late_minutes: number;
}

export interface StaffAttendanceMonthlySummary {
  staff_id: string;
  year: number;
  month: number;
  total_present: number;
  total_late: number;
  total_half_days: number;
  total_days_logged: number;
  total_late_minutes: number;
  punctuality_percentage: number;
  records: StaffAttendanceDayRecord[];
}

export interface RecognitionWallItem {
  id: string;
  recipient_name: string;
  recipient_designation: string;
  department: string;
  title: string;
  category_name: string;
  points: number;
  citation: string;
  nominator_name?: string | null;
  awarded_at?: string | null;
}

export interface MyBadgesSummary {
  staff_id: string;
  total_awards: number;
  total_points: number;
  awards: {
    id: string;
    title: string;
    category: string;
    points: number;
    citation: string;
    nominator?: string | null;
    awarded_at?: string | null;
  }[];
}

export interface DisciplinaryQueryItem {
  id: string;
  query_reference: string;
  incident_date: string;
  incident_category: string;
  subject: string;
  description: string;
  deadline_hours: number;
  explanation?: string | null;
  status: string;
  decision_notes?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  issued_by: string;
  issued_at?: string | null;
}

export interface TeacherAppraisalScorecardData {
  staff_id: string;
  session_name: string;
  session_id?: string | null;
  term_name: string;
  term_id?: string | null;
  appraisal?: {
    id: string;
    total_composite_score: number;
    performance_grade: string;
    hod_comments?: string | null;
    principal_remarks?: string | null;
    status: string;
    self_appraisal_score?: number | null;
    self_evaluation_notes?: string | null;
    strengths?: string | null;
    growth_goals?: string | null;
  } | null;
  scores: {
    metric_title: string;
    category: string;
    weight: number;
    score: number;
    weighted_score: number;
  }[];
}

export interface TeacherPayslipItem {
  id: string;
  month_year: string;
  month_formatted: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  payment_status: string;
  created_at: string;
}

export interface TeacherPayslipDetail {
  id: string;
  month_year: string;
  month_formatted: string;
  staff_name: string;
  staff_id_code: string;
  designation: string;
  grade_level: string;
  step: string;
  banking: {
    bank_name?: string | null;
    account_number?: string | null;
    account_name?: string | null;
    pfa_name?: string | null;
    rsa_pin?: string | null;
  };
  earnings: {
    basic_salary: number;
    allowances: number;
    gross_pay: number;
  };
  statutory_reliefs: {
    cra_relief: number;
    taxable_income: number;
  };
  deductions: {
    paye_tax: number;
    pension_employee: number;
    pension_employer: number;
    nhf_deduction: number;
    other_deductions: number;
    total_deductions: number;
  };
  net_pay: number;
  payment_status: string;
  payroll_status?: string | null;
  disbursed_at?: string | null;
}

export interface TeacherLoanItem {
  id: string;
  loan_reference: string;
  loan_type: string;
  principal_amount: number;
  interest_rate_percent: number;
  total_repayable_amount: number;
  monthly_installment: number;
  total_installments: number;
  remaining_installments: number;
  total_paid: number;
  outstanding_balance: number;
  status: string;
  start_deduction_month: string;
  disbursed_at?: string | null;
  created_at: string;
}

export interface TeacherLoanScheduleData {
  loan: {
    id: string;
    loan_reference: string;
    loan_type: string;
    principal_amount: number;
    total_repayable_amount: number;
    monthly_installment: number;
    total_paid: number;
    outstanding_balance: number;
    status: string;
  };
  repayments: {
    id: string;
    repayment_month: string;
    amount: number;
    balance_after: number;
    processed_at: string;
  }[];
}

export interface TeacherCpdPortfolio {
  staff_id: string;
  staff_name: string;
  total_trainings_attended: number;
  total_cpd_hours: number;
  certificates_earned: number;
  programs: {
    id: string;
    program_id: string;
    title: string;
    provider?: string | null;
    location_type: string;
    start_date: string;
    end_date: string;
    cpd_hours: number;
    status: string;
    certificate_reference?: string | null;
    feedback_rating?: number | null;
    completed_at?: string | null;
  }[];
}

export interface TimetablePeriod {
  id: string;
  period_number: number;
  subject_name: string;
  class_name: string;
  class_arm_id: string;
  time_slot: string;
  room: string;
}

export interface ActiveExam {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks?: number;
  pass_mark?: number;
  status?: 'pending' | 'in_progress' | 'completed';
}

class MobileApiClient {
  private baseUrl: string = 'http://schos.test/api/v1';
  private authToken: string | null = null;
  private tenantSubdomain: string | null = null;

  public setToken(token: string | null) {
    this.authToken = token;
  }

  public getToken(): string | null {
    return this.authToken;
  }

  public setTenant(subdomain: string | null) {
    this.tenantSubdomain = subdomain;
  }

  public getTenant(): string | null {
    return this.tenantSubdomain;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.tenantSubdomain ? { 'X-Tenant': this.tenantSubdomain } : {}),
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const durationMs = Date.now() - startTime;
      if (durationMs > 1500) {
        crashlytics.logBreadcrumb(`Slow HTTP request: ${endpoint} took ${durationMs}ms`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      crashlytics.recordError(error, {
        endpoint,
        durationMs: Date.now() - startTime,
      });
      return {
        success: false,
        message: error.message || 'Network request failed',
      };
    }
  }

  // --- Auth Endpoints ---
  public async login(credentials: { email: string; password: string; device_name?: string }) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...credentials,
        device_name: credentials.device_name || 'School OS Mobile App',
      }),
    });
  }

  public async register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    school_name?: string;
    subdomain?: string;
    role?: string;
  }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async forgotPassword(email: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async getMe() {
    return this.request<any>('/auth/me');
  }

  public async logout() {
    const res = await this.request<any>('/auth/logout', {
      method: 'POST',
    });
    this.authToken = null;
    return res;
  }

  // --- Shared & Tenant ---
  public async getInit() {
    return this.request<any>('/mobile/init');
  }

  public async getTheme() {
    return this.request<any>('/tenant/theme');
  }

  // --- Parent Endpoints ---
  public async getParentChildren() {
    return this.request<ChildProfile[]>('/mobile/parent/children');
  }

  public async getChildDashboard(studentId: string) {
    return this.request<any>(`/mobile/parent/children/${studentId}/dashboard`);
  }

  public async getChildInvoices(studentId: string) {
    return this.request<ChildInvoice[]>(`/mobile/parent/children/${studentId}/invoices`);
  }

  public async getChildAttendance(studentId: string) {
    return this.request<ChildAttendanceRecord[]>(`/mobile/parent/children/${studentId}/attendance`);
  }

  public async getChildResults(studentId: string) {
    return this.request<ChildTerminalResult>(`/mobile/parent/children/${studentId}/results`);
  }

  // --- Teacher Endpoints ---
  public async getTeacherProfile() {
    return this.request<TeacherProfileData>('/mobile/teacher/profile');
  }

  public async getTeacherLeaveBalances() {
    return this.request<{ staff_id: string; year: number; balances: LeaveBalanceItem[] }>('/mobile/teacher/leave/balances');
  }

  public async applyTeacherLeave(data: {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    reason: string;
    reliever_staff_id?: string;
  }) {
    return this.request<any>('/mobile/teacher/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getTeacherLeaveHistory() {
    return this.request<LeaveHistoryItem[]>('/mobile/teacher/leave/history');
  }

  public async getTeacherReliefDuties() {
    return this.request<ReliefDutyItem[]>('/mobile/teacher/coverage/assigned');
  }

  public async acknowledgeReliefDuty(logId: string) {
    return this.request<any>(`/mobile/teacher/coverage/${logId}/acknowledge`, {
      method: 'POST',
    });
  }

  public async completeReliefDuty(logId: string, report?: string) {
    return this.request<any>(`/mobile/teacher/coverage/${logId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ report }),
    });
  }

  public async requestExitPermission(data: {
    date: string;
    period_start: number;
    period_end: number;
    departure_time?: string;
    expected_return_time?: string;
    reason: string;
  }) {
    return this.request<any>('/mobile/teacher/exit-permission/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getTeacherAttendanceSummary(year?: number, month?: number) {
    const q = year && month ? `?year=${year}&month=${month}` : '';
    return this.request<StaffAttendanceMonthlySummary>(`/mobile/teacher/attendance/history${q}`);
  }

  public async submitAttendanceRegularization(data: {
    date: string;
    requested_check_in?: string;
    requested_check_out?: string;
    reason_type: string;
    reason_description: string;
  }) {
    return this.request<any>('/mobile/teacher/attendance/regularize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getRecognitionWall() {
    return this.request<RecognitionWallItem[]>('/mobile/teacher/recognitions/wall');
  }

  public async nominatePeer(data: {
    nominee_id: string;
    award_category_id: string;
    title: string;
    citation: string;
  }) {
    return this.request<any>('/mobile/teacher/recognitions/nominate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getMyBadges() {
    return this.request<MyBadgesSummary>('/mobile/teacher/recognitions/my-badges');
  }

  public async getPendingQueries() {
    return this.request<DisciplinaryQueryItem[]>('/mobile/teacher/queries/pending');
  }

  public async respondToQuery(queryId: string, explanation: string) {
    return this.request<any>(`/mobile/teacher/queries/${queryId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ explanation }),
    });
  }

  public async getQueryHistory() {
    return this.request<DisciplinaryQueryItem[]>('/mobile/teacher/queries/history');
  }

  public async getTeacherAppraisalScorecard() {
    return this.request<TeacherAppraisalScorecardData>('/mobile/teacher/appraisal/scorecard');
  }

  public async submitTeacherSelfReview(data: {
    term_id: string;
    session_id: string;
    self_appraisal_score: number;
    self_evaluation_notes: string;
    strengths?: string;
    growth_goals?: string;
  }) {
    return this.request<any>('/mobile/teacher/appraisal/self-review', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getTeacherPayslips() {
    return this.request<TeacherPayslipItem[]>('/mobile/teacher/payslips');
  }

  public async getTeacherPayslipDetail(id: string) {
    return this.request<TeacherPayslipDetail>(`/mobile/teacher/payslips/${id}`);
  }

  public async getTeacherLoans() {
    return this.request<TeacherLoanItem[]>('/mobile/teacher/loans');
  }

  public async requestTeacherLoan(data: {
    loan_type: string;
    principal_amount: number;
    total_installments: number;
    reason: string;
  }) {
    return this.request<any>('/mobile/teacher/loans/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getTeacherLoanSchedule(id: string) {
    return this.request<TeacherLoanScheduleData>(`/mobile/teacher/loans/${id}/schedule`);
  }

  public async getTeacherTrainings() {
    return this.request<TeacherCpdPortfolio>('/mobile/teacher/trainings');
  }

  public async submitTrainingFeedback(attendeeId: string, rating: number, comments?: string) {
    return this.request<any>(`/mobile/teacher/trainings/${attendeeId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comments }),
    });
  }

  public async getTeacherTimetable() {
    return this.request<TimetablePeriod[]>('/mobile/teacher/timetable');
  }

  public async getClassRoster(classArmId: string) {
    return this.request<any>(`/mobile/teacher/classes/${classArmId}/roster`);
  }

  public async submitAttendance(data: { class_arm_id: string; date: string; entries: any[] }) {
    return this.request<any>('/mobile/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async submitScores(data: { class_arm_id: string; subject_id: string; scores: any[] }) {
    return this.request<any>('/mobile/teacher/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Student Endpoints ---
  public async getStudentDashboard() {
    return this.request<{ active_exams: ActiveExam[]; announcements?: { id: number; title: string; date: string; body: string }[] }>('/mobile/student/dashboard');
  }

  public async startExam(examId: string) {
    return this.request<any>(`/mobile/student/exams/${examId}/start`, {
      method: 'POST',
    });
  }

  public async submitExam(examId: string, answers: Record<string, any>) {
    return this.request<any>(`/mobile/student/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // --- Admin Endpoints ---
  public async getAdminOverview() {
    return this.request<{
      kpis: {
        total_students: string;
        active_learners_change: string;
        faculty_on_duty: string;
        faculty_rate: string;
        attendance_rate: string;
        gate_checkins: string;
        term_fees_collected: string;
        collection_rate: string;
        total_collected: string;
        outstanding_fees: string;
        reconciliation_rate: string;
        published_reports: string;
        moderated_arms: string;
      };
      recent_events: { id: string; title: string; time: string; type: string }[];
    }>('/mobile/admin/overview');
  }

  // --- Push Notifications & Devices ---
  public async registerDeviceToken(token: string, platform: 'android' | 'ios' | 'web' = 'android') {
    return this.request<any>('/mobile/devices/register', {
      method: 'POST',
      body: JSON.stringify({
        device_token: token,
        platform,
        device_name: 'School OS Mobile Device',
        app_version: '1.0.0',
      }),
    });
  }

  // --- Teacher Assets & Scanner ---
  public async getTeacherAssets() {
    return this.request<TeacherAssetAssignment[]>('/mobile/teacher/my-assets');
  }

  public async acknowledgeTeacherAsset(assignmentId: string, notes?: string) {
    return this.request<any>(`/mobile/teacher/my-assets/${assignmentId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  public async requestReturnTeacherAsset(assignmentId: string, notes?: string) {
    return this.request<any>(`/mobile/teacher/my-assets/${assignmentId}/request-return`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  public async scanAsset(code: string) {
    return this.request<ScannedAssetResult>(`/mobile/assets/scan?code=${encodeURIComponent(code)}`);
  }

  // --- Unified In-App Notifications ---
  public async getInAppNotifications(category?: string, status?: string) {
    let url = '/notifications?per_page=30';
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return this.request<AppNotificationItem[]>(url);
  }

  public async getInAppUnreadCount() {
    return this.request<{ unread_count: number }>('/notifications/unread-count');
  }

  public async markInAppNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  public async markAllInAppNotificationsRead() {
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  public async getInAppNotificationPreferences() {
    return this.request<any>('/notifications/preferences');
  }

  public async updateInAppNotificationPreferences(prefs: any) {
    return this.request<any>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }
}

export interface AppNotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'attendance' | 'fees' | 'academics' | 'hr' | 'assets' | 'general' | 'emergency';
  priority: 'normal' | 'high' | 'urgent';
  action_url?: string | null;
  data?: Record<string, any> | null;
  read_at?: string | null;
  created_at: string;
}

export interface TeacherAssetAssignment {
  assignment_id: string;
  asset_id: string;
  asset_tag: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  category_name?: string | null;
  serial_number?: string | null;
  status: 'pending_acknowledgement' | 'active' | 'returned' | 'disputed';
  condition: string;
  accessories: string[];
  assigned_at: string;
  acknowledged_at?: string | null;
  expected_return_date?: string | null;
}

export interface ScannedAssetResult {
  id: string;
  asset_tag: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
  location: string;
  building?: string | null;
  room?: string | null;
  custodian: string;
  custody_status: string;
  condition: string;
  status: string;
  accessories: string[];
  financials?: {
    purchase_cost: number;
    current_book_value: number;
  } | null;
}

export const apiClient = new MobileApiClient();
