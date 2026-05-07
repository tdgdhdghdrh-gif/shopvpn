// Helper to check if a product's schedule matches the current date/time

export interface ScheduleConfig {
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  weekOfMonth?: number // 1-4
  dayOfMonth?: number // 1-31
}

export function isProductAvailableBySchedule(
  scheduleMode: string,
  scheduleConfig: ScheduleConfig | null | undefined
): boolean {
  if (scheduleMode === 'always' || !scheduleMode) return true
  if (!scheduleConfig) return true

  const now = new Date()

  switch (scheduleMode) {
    case 'daily': {
      // Check day of week
      const currentDay = now.getDay() // 0-6
      const allowedDays = scheduleConfig.daysOfWeek || []
      return allowedDays.includes(currentDay)
    }

    case 'weekly': {
      // Check week of month
      const currentWeek = getWeekOfMonth(now)
      const allowedWeeks = scheduleConfig.weekOfMonth ? [scheduleConfig.weekOfMonth] : []
      return allowedWeeks.includes(currentWeek)
    }

    case 'monthly': {
      // Check day of month
      const currentDay = now.getDate()
      const allowedDay = scheduleConfig.dayOfMonth
      if (allowedDay === undefined || allowedDay === null) return true
      return currentDay === allowedDay
    }

    default:
      return true
  }
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDay.getDay() // 0-6
  const dayOfMonth = date.getDate()
  // Calculate which week this date falls into (1-4+)
  return Math.ceil((dayOfMonth + dayOfWeek) / 7)
}
