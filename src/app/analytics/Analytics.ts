import { sendAnalyticsError } from './utils';
import errorService from '../core/services/error.service';

export default class Analytics {
  private static instance: Analytics;

  private constructor() {
    const analytics = window.rudderanalytics;
    return analytics;
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
      if (typeof Analytics.instance === 'undefined') {
        // Analytics library have not loaded properly
        sendAnalyticsError('Analytics library not loaded');
      }
    }
    return Analytics.instance;
  }

  public track(eventName: string, properties: unknown): void {
    try {
      Analytics.instance.track(eventName, properties);
    } catch (err) {
      const castedError = errorService.castError(err);
      sendAnalyticsError(castedError.message);
    }
  }
}
