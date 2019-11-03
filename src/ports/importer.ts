export interface ImporterPort {
  fetchText: (url: string) => Promise<string>
}