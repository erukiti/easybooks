export type ProgressState =
  | 'PrepareConfig'
  | 'PrepareReVIEWFiles'
  | 'ReVIEWCompile'
  | 'done'

export interface ReportMessage {
  file: string
  line: number
  column?: number
  message: string
}

export interface Presentation {
  progress: (state: ProgressState) => void
  info: (message: string) => void
  warn: (msg: ReportMessage) => void
  error: (msg: ReportMessage) => void
}
