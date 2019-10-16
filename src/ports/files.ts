export interface FilesPort {
  readDirRecursive: (dir: string) => Promise<string[]>
  writeFiles: (dest: string) => Promise<void>
}

export type FilesPortFactory<T = unknown> = (context: T) => FilesPort
