/**
 * Manages a requestAnimationFrame loop with FPS throttling.
 */
export class AnimationLoop {
  private _onFrame: (time: number) => void
  private _fps: number
  private _interval: number
  private _rafId: number | null = null
  private _lastFrameTime = 0
  private _startTime = 0
  private _playing = false

  constructor(onFrame: (time: number) => void, fps: number) {
    this._onFrame = onFrame
    this._fps = fps
    this._interval = 1000 / fps
  }

  get isPlaying(): boolean {
    return this._playing
  }

  setFps(fps: number): void {
    this._fps = fps
    this._interval = 1000 / fps
  }

  play(): void {
    if (this._playing) return
    this._playing = true
    this._lastFrameTime = performance.now()
    if (this._startTime === 0) {
      this._startTime = this._lastFrameTime
    }
    this._tick()
  }

  pause(): void {
    this._playing = false
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  stop(): void {
    this.pause()
    this._startTime = 0
  }

  private _tick = (): void => {
    if (!this._playing) return
    this._rafId = requestAnimationFrame(this._loop)
  }

  private _loop = (now: number): void => {
    if (!this._playing) return

    const elapsed = now - this._lastFrameTime
    if (elapsed >= this._interval) {
      this._lastFrameTime = now - (elapsed % this._interval)
      const timeInSeconds = (now - this._startTime) / 1000
      this._onFrame(timeInSeconds)
    }

    this._tick()
  }
}
