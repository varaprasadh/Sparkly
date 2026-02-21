/**
 * Sparkly Background Script
 * Handles alarms, notifications, and other background tasks
 */

// Storage key for reminders (matches plugin namespace)
const REMINDER_STORAGE_KEY = 'plugin:builtin-reminder:reminders';

// Types
interface Reminder {
  id: string;
  title: string;
  message?: string;
  type: 'one-time' | 'recurring';
  enabled: boolean;
  interval?: string;
  customIntervalMinutes?: number;
  triggerCount: number;
}

// On install handler
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason.reason === 'install') {
    chrome.runtime.setUninstallURL('https://forms.gle/tKbaLR1QeEMsmKkN7');

    // Initialize default settings
    initializeDefaults();
  }
});

/**
 * Initialize default settings on first install
 */
function initializeDefaults(): void {
  chrome.storage.local.get(['settings:general'], (result) => {
    if (!result['settings:general']) {
      chrome.storage.local.set({
        'settings:general': {
          searchEngine: 'google',
          openLinksInNewTab: true,
          showGreeting: true,
          userName: '',
          showTopSites: true,
          topSitesCount: 8,
          showTabManager: true,
          clockFormat: '12h',
          showSeconds: false,
          showDate: true,
          dateFormat: 'long',
          showBookmarks: true,
          maxQuickLinks: 8,
        },
      });
    }
  });
}

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  // Check if this is a reminder alarm from the plugin
  // Format: builtin-reminder:reminder-{id}
  if (alarm.name.startsWith('builtin-reminder:reminder-')) {
    const reminderId = alarm.name.replace('builtin-reminder:reminder-', '');
    await handleReminderAlarm(reminderId);
  }
  // Legacy format support: reminder:{id}
  else if (alarm.name.startsWith('reminder:')) {
    const reminderId = alarm.name.replace('reminder:', '');
    await handleReminderAlarm(reminderId);
  }
});

/**
 * Handle reminder alarm
 */
async function handleReminderAlarm(reminderId: string): Promise<void> {
  try {
    // Get reminders from storage
    const result = await new Promise<{ [key: string]: Reminder[] }>((resolve) => {
      chrome.storage.local.get([REMINDER_STORAGE_KEY], (data) => resolve(data));
    });
    const reminders: Reminder[] = result[REMINDER_STORAGE_KEY] || [];

    // Find the specific reminder
    const reminder = reminders.find((r) => r.id === reminderId);

    if (!reminder || !reminder.enabled) {
      return;
    }

    // Show notification
    await showReminderNotification(reminder);

    // Update trigger count
    const updatedReminders = reminders.map((r) =>
      r.id === reminderId ? { ...r, triggerCount: r.triggerCount + 1 } : r
    );

    await chrome.storage.local.set({ [REMINDER_STORAGE_KEY]: updatedReminders });

    // For one-time reminders, disable after trigger
    if (reminder.type === 'one-time') {
      const finalReminders = updatedReminders.map((r) =>
        r.id === reminderId ? { ...r, enabled: false } : r
      );
      await chrome.storage.local.set({ [REMINDER_STORAGE_KEY]: finalReminders });
    }
  } catch (error) {
    console.error('Error handling reminder alarm:', error);
  }
}

/**
 * Show notification for a reminder
 */
async function showReminderNotification(reminder: Reminder): Promise<void> {
  const notificationId = `reminder-notification-${reminder.id}`;

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: reminder.title,
    message: reminder.message || 'Time for your reminder!',
    buttons: [{ title: 'Snooze (10 min)' }, { title: 'Dismiss' }],
    requireInteraction: true,
    priority: 2,
  });
}

/**
 * Handle notification button clicks
 */
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  // Check if this is a reminder notification
  if (notificationId.startsWith('reminder-notification-')) {
    const reminderId = notificationId.replace('reminder-notification-', '');

    if (buttonIndex === 0) {
      // Snooze - create a new alarm for 10 minutes
      await snoozeReminder(reminderId, 10);
    }

    // Clear the notification
    chrome.notifications.clear(notificationId);
  }
});

/**
 * Handle notification closed
 */
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  // Notification closed, no action needed
});

/**
 * Snooze a reminder
 */
async function snoozeReminder(reminderId: string, minutes: number): Promise<void> {
  // Use the same alarm format as PluginAPI
  const alarmName = `builtin-reminder:reminder-${reminderId}`;

  // Clear existing alarm and create a new one
  await chrome.alarms.clear(alarmName);
  await chrome.alarms.create(alarmName, { delayInMinutes: minutes });
}

/**
 * Listen for messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCHEDULE_REMINDER') {
    handleScheduleReminder(request.reminder)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === 'CANCEL_REMINDER') {
    handleCancelReminder(request.reminderId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.type === 'TEST_NOTIFICATION') {
    showTestNotification()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Handle schedule reminder message
 */
async function handleScheduleReminder(reminder: Reminder): Promise<void> {
  // Use the same alarm format as PluginAPI: builtin-reminder:reminder-{id}
  const alarmName = `builtin-reminder:reminder-${reminder.id}`;

  if (reminder.type === 'one-time' && (reminder as any).scheduledTime) {
    const when = new Date((reminder as any).scheduledTime).getTime();
    if (when > Date.now()) {
      await chrome.alarms.create(alarmName, { when });
    }
  } else if (reminder.type === 'recurring') {
    let periodInMinutes = 60;

    if (reminder.interval === 'custom' && reminder.customIntervalMinutes) {
      periodInMinutes = reminder.customIntervalMinutes;
    } else if (reminder.interval === 'hourly') {
      periodInMinutes = 60;
    } else if (reminder.interval === 'daily') {
      periodInMinutes = 1440;
    } else if (reminder.interval === 'weekly') {
      periodInMinutes = 10080;
    }

    await chrome.alarms.create(alarmName, {
      delayInMinutes: periodInMinutes,
      periodInMinutes,
    });
  }
}

/**
 * Handle cancel reminder message
 */
async function handleCancelReminder(reminderId: string): Promise<void> {
  // Use the same alarm format as PluginAPI: builtin-reminder:reminder-{id}
  const alarmName = `builtin-reminder:reminder-${reminderId}`;
  await chrome.alarms.clear(alarmName);
}

/**
 * Show test notification
 */
async function showTestNotification(): Promise<void> {
  chrome.notifications.create('test-notification', {
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: 'Test Notification',
    message: 'Sparkly notifications are working!',
    priority: 2,
  });
}

// Export empty object for module compatibility
export {};
