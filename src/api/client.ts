/**
 * School OS Mobile API Client
 * Connects to Laravel API gateway with multi-tenant subdomains & bearer token auth.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
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
  total_marks: number;
}

class MobileApiClient {
  private baseUrl: string = 'http://schos.test/api/v1';
  private authToken: string | null = null;
  private tenantSubdomain: string = 'atlantichall';

  public setToken(token: string) {
    this.authToken = token;
  }

  public setTenant(subdomain: string) {
    this.tenantSubdomain = subdomain;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant': this.tenantSubdomain,
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network request failed',
      };
    }
  }

  // Shared
  public async getInit() {
    return this.request('/mobile/init');
  }

  // Parent
  public async getParentChildren() {
    return this.request<ChildProfile[]>('/mobile/parent/children');
  }

  public async getChildDashboard(studentId: string) {
    return this.request(`/mobile/parent/children/${studentId}/dashboard`);
  }

  // Teacher
  public async getTeacherTimetable() {
    return this.request<TimetablePeriod[]>('/mobile/teacher/timetable');
  }

  public async getClassRoster(classArmId: string) {
    return this.request(`/mobile/teacher/classes/${classArmId}/roster`);
  }

  public async submitAttendance(data: { class_arm_id: string; date: string; entries: any[] }) {
    return this.request('/mobile/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Student
  public async getStudentDashboard() {
    return this.request<{ active_exams: ActiveExam[] }>('/mobile/student/dashboard');
  }
}

export const apiClient = new MobileApiClient();
