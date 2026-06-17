export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve()
  private active = 0

  get size(): number {
    return this.active
  }

  run<T>(task: () => Promise<T>): Promise<T> {
    this.active += 1

    const result = this.tail.then(task, task)

    this.tail = result.then(
      () => {
        this.active -= 1
      },
      () => {
        this.active -= 1
      },
    )
    return result
  }
}
