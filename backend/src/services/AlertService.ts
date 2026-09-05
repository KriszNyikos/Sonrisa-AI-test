import { Alert } from '../types';
import { AlertRepository } from '../repositories/AlertRepository';
import { NotificationChannelRepository } from '../repositories/NotificationChannelRepository';
import { isValidAlertName, isValidAlertDescription } from '../utils';

/**
 * Service for managing alerts
 * Handles business logic for alert operations
 */
class AlertService {
  constructor(
    private alertRepository: AlertRepository,
    private channelRepository: NotificationChannelRepository,
  ) {}

  /**
   * Create a new alert
   * @param name - Alert name
   * @param keywords - Keywords to match
   * @param description - Optional description
   * @returns Created alert
   * @throws Error if validation fails
   */
  async createAlert(name: string, keywords: string[], description?: string): Promise<Alert> {
    // Validate inputs
    if (!isValidAlertName(name)) {
      throw new Error('Invalid alert name');
    }

    if (!keywords || keywords.length === 0) {
      throw new Error('At least one keyword is required');
    }

    if (!isValidAlertDescription(description)) {
      throw new Error('Invalid description');
    }

    // Ensure keywords are unique and trimmed
    const uniqueKeywords = [...new Set(keywords.map((k) => k.trim().toLowerCase()))];

    const alert = await this.alertRepository.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      keywords: uniqueKeywords,
      isActive: true,
    });

    return alert;
  }

  /**
   * Update an existing alert
   * @param id - Alert ID
   * @param updates - Partial alert update
   * @returns Updated alert
   * @throws Error if alert not found or validation fails
   */
  async updateAlert(id: string, updates: Partial<Omit<Alert, 'id' | 'createdAt'>>): Promise<Alert> {
    const alert = await this.alertRepository.getById(id);
    if (!alert) {
      throw new Error(`Alert with ID ${id} not found`);
    }

    // Validate fields if provided
    if (updates.name && !isValidAlertName(updates.name)) {
      throw new Error('Invalid alert name');
    }

    if (!isValidAlertDescription(updates.description)) {
      throw new Error('Invalid description');
    }

    if (updates.keywords) {
      if (updates.keywords.length === 0) {
        throw new Error('At least one keyword is required');
      }
      updates.keywords = [...new Set(updates.keywords.map((k) => k.trim().toLowerCase()))];
    }

    // Remove updatedAt from updates since repository handles it
    const { updatedAt, ...cleanUpdates } = updates as any;

    const updatedAlert = await this.alertRepository.update(id, cleanUpdates);

    if (!updatedAlert) {
      throw new Error(`Failed to update alert with ID ${id}`);
    }

    return updatedAlert;
  }

  /**
   * Delete an alert and its associated channels
   * @param id - Alert ID
   * @throws Error if alert not found
   */
  async deleteAlert(id: string): Promise<void> {
    const alert = await this.alertRepository.getById(id);
    if (!alert) {
      throw new Error(`Alert with ID ${id} not found`);
    }

    // Delete associated channels first
    await this.channelRepository.deleteByAlertId(id);

    // Delete the alert
    await this.alertRepository.delete(id);
  }

  /**
   * Retrieve a single alert by ID
   * @param id - Alert ID
   * @returns Alert or null if not found
   */
  async getAlert(id: string): Promise<Alert | null> {
    return this.alertRepository.getById(id);
  }

  /**
   * List all alerts
   * @returns Array of alerts
   */
  async listAlerts(): Promise<Alert[]> {
    return this.alertRepository.getAll();
  }

  /**
   * Toggle alert enabled/disabled status
   * @param id - Alert ID
   * @returns Updated alert
   * @throws Error if alert not found
   */
  async toggleAlert(id: string): Promise<Alert> {
    const alert = await this.alertRepository.getById(id);
    if (!alert) {
      throw new Error(`Alert with ID ${id} not found`);
    }

    const updatedAlert = await this.alertRepository.update(id, {
      isActive: !alert.isActive,
    });

    if (!updatedAlert) {
      throw new Error(`Failed to toggle alert with ID ${id}`);
    }

    return updatedAlert;
  }
}

export default AlertService;
