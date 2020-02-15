import { Presentation } from './presentation'

export interface FetchTemplatesPort {
  fetch: (
    url: string,
    dir: string,
  ) => Promise<{ name: string; text: string }[]>
}

export type FetchTemplatesPortFactory<T = unknown> = (
  context: T,
  pres: Presentation,
) => FetchTemplatesPort
