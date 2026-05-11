import { useMemo } from 'react'
import { getProjectStats, type ProjectStat } from '@/utils/projectAggregation'
import { useLiveTick } from './useLiveTick'

/**
 * Returns live-updating project stats.
 * Automatically refreshes every second so active timers are reflected.
 */
export function useProjectStats(projectId: string): ProjectStat | null {
  const tick = useLiveTick()
  return useMemo(() => getProjectStats(projectId), [projectId, tick])
}
