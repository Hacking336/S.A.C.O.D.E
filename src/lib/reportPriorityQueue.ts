import type { Priority } from '../data/mock'

/* ------------------------------------------------------------------
   DSA #1 — PRIORITY QUEUE (MAX HEAP) for damage-report urgency.

   A hand-written binary max heap that mirrors
   backend/src/main/java/com/mabini/sacode/dsa/ReportPriorityQueue.java
   so the static front end orders the admin queue exactly the way the
   Spring Boot API does once it is connected.

   Ordering (highest first):
       Critical  >  High  >  Medium  >  Low
   Ties are broken by the most recently reported report.

   offer()  O(log n)   poll() O(log n)   peek() O(1)
   drainSorted() O(n log n)
------------------------------------------------------------------ */

export const PRIORITY_RANK: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

export interface UrgentReport {
  priority: Priority
  /** Human readable report date, e.g. "May 16, 2025". */
  date: string
}

const timestamp = (report: UrgentReport): number => {
  const parsed = Date.parse(report.date)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Positive when `a` is MORE urgent than `b`. */
const compare = (a: UrgentReport, b: UrgentReport): number => {
  const bySeverity = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  return bySeverity !== 0 ? bySeverity : timestamp(a) - timestamp(b)
}

export class ReportPriorityQueue<T extends UrgentReport> {
  private heap: T[] = []

  static from<T extends UrgentReport>(reports: Iterable<T>): ReportPriorityQueue<T> {
    const queue = new ReportPriorityQueue<T>()
    for (const report of reports) {
      queue.offer(report)
    }
    return queue
  }

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  /** O(1) — the most urgent report currently queued. */
  peek(): T | undefined {
    return this.heap[0]
  }

  /** O(log n) — insert, then bubble the report up to its ranked position. */
  offer(report: T): void {
    this.heap.push(report)
    this.siftUp(this.heap.length - 1)
  }

  /** O(log n) — remove and return the most urgent report. */
  poll(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }

    const mostUrgent = this.heap[0]
    const last = this.heap.pop() as T

    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }

    return mostUrgent
  }

  /** O(n log n) — drain the queue into a fully urgency-sorted list. */
  drainSorted(): T[] {
    const sorted: T[] = []
    let next = this.poll()

    while (next !== undefined) {
      sorted.push(next)
      next = this.poll()
    }

    return sorted
  }

  private siftUp(index: number): void {
    let child = index

    while (child > 0) {
      const parent = (child - 1) >> 1
      if (compare(this.heap[child], this.heap[parent]) <= 0) {
        break
      }
      this.swap(child, parent)
      child = parent
    }
  }

  private siftDown(index: number): void {
    let parent = index
    const half = this.heap.length >> 1

    while (parent < half) {
      const left = parent * 2 + 1
      const right = left + 1
      let child = left

      if (right < this.heap.length && compare(this.heap[right], this.heap[left]) > 0) {
        child = right // pick the stronger child
      }
      if (compare(this.heap[parent], this.heap[child]) >= 0) {
        break
      }

      this.swap(parent, child)
      parent = child
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = tmp
  }
}
