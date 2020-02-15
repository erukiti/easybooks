import { Config } from '../ports/build-book'

export interface EasyBooksUsecase {
  buildPdf: (config: Config) => Promise<void>
  buildEPub: (config: Config) => Promise<void>
}
