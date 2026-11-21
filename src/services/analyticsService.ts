/**
 * School OS - Mobile Google Analytics 4 (GA4) Analytics Service
 *
 * Implements privacy-first, zero-PII mobile event telemetry matching
 * the School OS enterprise event taxonomy.
 */

export interface MobileAnalyticsUserContext {
  userId?: string | number;
  tenantId?: string | number;
  role?: string;
}

class MobileAnalyticsService {
  private isAvailable: boolean = false;
  private nativeAnalytics: any = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const nativeModule = require('@react-native-firebase/analytics');
      this.nativeAnalytics = nativeModule.default ? nativeModule.default() : nativeModule();
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
  }

  /**
   * Log Mobile Screen Transition
   */
  public logScreenView(screenName: string, screenClass?: string): void {
    if (__DEV__) {
      console.log(`[Mobile GA4 ScreenView] ${screenName} (${screenClass || 'Screen'})`);
    }

    if (this.isAvailable && this.nativeAnalytics) {
      try {
        this.nativeAnalytics.logScreenView({
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
      } catch (e) {
        // Silent catch
      }
    }
  }

  /**
   * Log Custom Event with PII Sanitization
   */
  public logEvent(eventName: string, params: Record<string, any> = {}): void {
    const cleanParams = this.sanitizeParams(params);

    if (__DEV__) {
      console.log(`[Mobile GA4 Event] ${eventName}:`, cleanParams);
    }

    if (this.isAvailable && this.nativeAnalytics) {
      try {
        this.nativeAnalytics.logEvent(eventName, cleanParams);
      } catch (e) {
        // Silent catch
      }
    }
  }

  /**
   * Set Anonymized User Context (strictly no names, emails, or phone numbers)
   */
  public setUser(context: MobileAnalyticsUserContext | null): void {
    if (!context) {
      if (this.isAvailable && this.nativeAnalytics) {
        try {
          this.nativeAnalytics.setUserId(null);
        } catch {}
      }
      return;
    }

    if (this.isAvailable && this.nativeAnalytics) {
      try {
        if (context.userId) {
          this.nativeAnalytics.setUserId(String(context.userId));
        }
        if (context.tenantId) {
          this.nativeAnalytics.setUserProperty('tenant_id', String(context.tenantId));
        }
        if (context.role) {
          this.nativeAnalytics.setUserProperty('user_role', context.role);
        }
      } catch {}
    }
  }

  // Common Business Events
  public trackAttendanceMarked(params: { class_arm_id?: string | number; count: number; mode: string }): void {
    this.logEvent('attendance_marked', params);
  }

  public trackInvoiceViewed(params: { invoice_id: string | number; amount?: number }): void {
    this.logEvent('fee_invoice_viewed', params);
  }

  public trackPaymentAttempted(params: { invoice_id: string | number; amount: number; method: string }): void {
    this.logEvent('fee_payment_attempted', params);
  }

  public trackCbtExamStarted(params: { exam_id: string | number; subject?: string }): void {
    this.logEvent('cbt_exam_started', params);
  }

  public trackCbtExamSubmitted(params: { exam_id: string | number; score?: number }): void {
    this.logEvent('cbt_exam_submitted', params);
  }

  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['name', 'email', 'phone', 'bvn', 'nin', 'account_number', 'card_number', 'password', 'token'];
    const safe: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        safe[key] = '[REDACTED]';
      } else {
        safe[key] = value;
      }
    }

    return safe;
  }
}

export const mobileAnalytics = new MobileAnalyticsService();
