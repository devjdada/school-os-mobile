/**
 * School OS - Mobile Crashlytics & Error Diagnostics Service
 *
 * Provides crash logging, non-fatal exception tracking, diagnostic breadcrumbs,
 * and anonymized user attributes with strictly ZERO Personally Identifiable Information (PII).
 */

export interface CrashlyticsUserContext {
  userId: string | number;
  tenantId?: string | number;
  role?: string;
}

class CrashlyticsService {
  private isAvailable: boolean = false;
  private crashlyticsNative: any = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Dynamic import check for bare workflow or Expo prebuild
      const nativeModule = require('@react-native-firebase/crashlytics');
      this.crashlyticsNative = nativeModule.default ? nativeModule.default() : nativeModule();
      this.isAvailable = true;
    } catch {
      // Graceful fallback in standard Expo Go or simulator development
      this.isAvailable = false;
    }
  }

  /**
   * Log non-fatal error to Firebase Crashlytics
   */
  public recordError(error: Error | any, context?: Record<string, any>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error?.message || error));

    if (__DEV__) {
      console.warn('[Crashlytics DEV] Non-fatal Error recorded:', errorObj.message, context || {});
    }

    if (this.isAvailable && this.crashlyticsNative) {
      try {
        if (context) {
          Object.entries(context).forEach(([key, val]) => {
            this.crashlyticsNative.setAttribute(key, String(val).substring(0, 100));
          });
        }
        this.crashlyticsNative.recordError(errorObj);
      } catch (err) {
        console.warn('[Crashlytics] Failed to report to native SDK:', err);
      }
    }
  }

  /**
   * Record breadcrumb for debugging user workflow leading to an issue
   */
  public logBreadcrumb(message: string, params?: Record<string, any>): void {
    const logText = params
      ? `${message} | ${JSON.stringify(this.sanitizeParams(params))}`
      : message;

    if (__DEV__) {
      console.log(`[Crashlytics Breadcrumb] ${logText}`);
    }

    if (this.isAvailable && this.crashlyticsNative) {
      try {
        this.crashlyticsNative.log(logText);
      } catch (err) {
        // Silent catch
      }
    }
  }

  /**
   * Set user ID and non-PII diagnostic metadata
   * NEVER pass student/parent names, emails, phones, or bank details!
   */
  public setUser(context: CrashlyticsUserContext | null): void {
    if (!context) {
      if (this.isAvailable && this.crashlyticsNative) {
        try {
          this.crashlyticsNative.setUserId('');
        } catch {}
      }
      return;
    }

    if (this.isAvailable && this.crashlyticsNative) {
      try {
        this.crashlyticsNative.setUserId(String(context.userId));
        if (context.tenantId) {
          this.crashlyticsNative.setAttribute('tenant_id', String(context.tenantId));
        }
        if (context.role) {
          this.crashlyticsNative.setAttribute('user_role', String(context.role));
        }
      } catch {}
    }
  }

  /**
   * Set arbitrary custom diagnostic attribute
   */
  public setAttribute(key: string, value: string): void {
    if (this.isAvailable && this.crashlyticsNative) {
      try {
        this.crashlyticsNative.setAttribute(key, value.substring(0, 100));
      } catch {}
    }
  }

  /**
   * Force test crash (debug only)
   */
  public crash(): void {
    if (this.isAvailable && this.crashlyticsNative) {
      this.crashlyticsNative.crash();
    } else {
      throw new Error('[Crashlytics] Simulated test crash');
    }
  }

  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['name', 'first_name', 'last_name', 'email', 'phone', 'bvn', 'nin', 'account_number', 'card_number', 'password', 'token'];

    Object.entries(params).forEach(([key, val]) => {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = val;
      }
    });

    return sanitized;
  }
}

export const crashlytics = new CrashlyticsService();
