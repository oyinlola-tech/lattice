import type { Schedule } from "../schedule/schedule.type.js";

/**
 * Priority queue using a min heap for scheduling.
 *
 * Provides O(log n) insertion and removal, and O(1) peek.
 */
export class PriorityQueue {
  private readonly heap: Schedule[] = [];

  /**
   * Inserts a schedule into the priority queue.
   */
  enqueue(schedule: Schedule): void {
    this.heap.push(schedule);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the earliest schedule.
   */
  dequeue(): Schedule | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const top = this.heap[0]!;
    const last = this.heap.pop();

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.sinkDown(0);
    }

    return top;
  }

  /**
   * Returns the earliest schedule without removing it.
   */
  peek(): Schedule | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    return this.heap[0];
  }

  /**
   * Removes a schedule by ID.
   */
  remove(id: string): boolean {
    const index = this.heap.findIndex((schedule) => schedule.id === id);
    if (index === -1) {
      return false;
    }

    const last = this.heap.pop();

    if (index < this.heap.length && last !== undefined) {
      this.heap[index] = last;
      this.bubbleUp(index);
      this.sinkDown(index);
    }

    return true;
  }

  /**
   * Returns the number of schedules in the queue.
   */
  get size(): number {
    return this.heap.length;
  }

  /**
   * Determines whether the queue is empty.
   */
  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Clears all schedules from the queue.
   */
  clear(): void {
    this.heap.length = 0;
  }

  /**
   * Bubble up an element to maintain heap property.
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex]!;
      const current = this.heap[index]!;

      if (current.nextRunAt.getTime() < parent.nextRunAt.getTime()) {
        [this.heap[parentIndex], this.heap[index]] = [current, parent];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Sink down an element to maintain heap property.
   */
  private sinkDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (
        left < this.heap.length &&
        this.heap[left]!.nextRunAt.getTime() < this.heap[smallest]!.nextRunAt.getTime()
      ) {
        smallest = left;
      }

      if (
        right < this.heap.length &&
        this.heap[right]!.nextRunAt.getTime() < this.heap[smallest]!.nextRunAt.getTime()
      ) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[smallest]!, this.heap[index]!] = [this.heap[index]!, this.heap[smallest]!];
        index = smallest;
      } else {
        break;
      }
    }
  }
}
