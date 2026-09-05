import { Alert } from '../types';

/**
 * Service for matching news content against alert keywords
 * Implements the matching engine for alert triggers
 */
class MatchingEngine {
  /**
   * Match news content against keywords
   * Case-insensitive substring matching
   * @param content - News content to match
   * @param keywords - Keywords to search for
   * @returns true if any keyword matches, false otherwise
   */
  matchKeywords(content: string, keywords: string[]): boolean {
    if (!content || !keywords || keywords.length === 0) {
      return false;
    }

    const lowerContent = content.toLowerCase();

    return keywords.some((keyword) => {
      const lowerKeyword = keyword.toLowerCase().trim();
      return lowerContent.includes(lowerKeyword);
    });
  }

  /**
   * Match news item against a single alert
   * @param newsTitle - News title
   * @param newsContent - News content
   * @param alert - Alert to match against
   * @returns true if news matches alert keywords
   */
  matchAlert(newsTitle: string, newsContent: string, alert: Alert): boolean {
    const fullText = `${newsTitle} ${newsContent}`;
    return this.matchKeywords(fullText, alert.keywords);
  }

  /**
   * Get matching alerts from a list
   * Filters alerts that match the given news content
   * @param newsTitle - News title
   * @param newsContent - News content
   * @param alerts - List of alerts to check
   * @returns Array of matching alerts
   */
  getMatchingAlerts(newsTitle: string, newsContent: string, alerts: Alert[]): Alert[] {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    return alerts.filter((alert) => {
      // Only match active alerts
      if (!alert.isActive) {
        return false;
      }

      return this.matchAlert(newsTitle, newsContent, alert);
    });
  }
}

export default MatchingEngine;
