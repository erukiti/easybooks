export interface ProjectFilesPort {
  readProjectDirRecursive: (dir: string) => Promise<string[]>
  readFileFromProject: (filename: string) => Promise<string>
  writeFileToDisk: (
    filename: string,
    content: string | Buffer,
  ) => Promise<void>
  exportFileToDisk: (filename: string) => Promise<void>
  exportFilesToDiskRecursive: (name: string) => Promise<void>
  getExportPath: () => string
}

export type ProjectFilesPortFactory<T = unknown> = (
  config?: T,
) => ProjectFilesPort
