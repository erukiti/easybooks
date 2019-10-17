import childProcess from 'child_process'
import path from 'path'

import { ReportMessage, Presentation } from '../../ports/presentation'
import {
  BuildBookPorts,
  BuildBookPortsFactory,
  Config,
} from '../../ports/build-book'
import { ProjectFilesPort } from '../../ports/project-files'
import { writeYaml, createCatalog, copyTemplates } from './tasks'
import { preparingConfig } from './config'

const reError = /^WARN: review-pdfmaker: (.*\.re):([0-9]+): error: (.+)$/

export const parseReviewMessage = (s: string) => {
  return s
    .split('\n')
    .map(line => {
      const matched = reError.exec(line)
      if (!matched) {
        return null
      } else {
        return {
          file: matched[1],
          line: Number.parseInt(matched[2]),
          message: matched[3],
        }
      }
    })
    .filter(v => v !== null) as ReportMessage[]
}

export const buildPdfByReview = (pres: Presentation, reviewDir: string) => {
  return new Promise<void>((resolve, reject) => {
    pres.progress('ReVIEWCompile')
    let data = ''
    const cp = childProcess
      .spawn('review-pdfmaker', ['config.yml'], {
        cwd: reviewDir,
      })
      .on('close', code => {
        const reports = parseReviewMessage(data)
        reports.forEach(report => pres.error(report))

        if (reports.length === 0) {
          resolve()
        } else {
          reject(data)
        }
      })
      .on('error', err => {
        reject(data)
      })
    cp.stdout.on('data', chunk => {
      data += chunk.toString()
    })
    cp.stderr.on('data', chunk => {
      data += chunk.toString()
    })
  })
}

export const createBuildBookByReviewPort: BuildBookPortsFactory = ({
  pres,
  files,
  fetchTemplates,
}) => {
  const buildPdf: BuildBookPorts['buildPdf'] = async config => {
    const reviewDir = files.getExportPath()
    const { catalog, templates, sty_templates } = preparingConfig(config)

    if (sty_templates) {
      const { url, dir } = sty_templates
      const styFiles = await fetchTemplates.fetch(url, dir)
      await Promise.all(
        styFiles.map(({ name, text }) => {
          return files.writeFileToDisk(path.join('sty', name), text)
        }),
      )
    }

    const { tasks } = createCatalog(files, catalog)

    await Promise.all([
      writeYaml(files, 'catalog.yml', catalog),
      writeYaml(files, 'config.yml', config),
      ...tasks,
      copyTemplates(files, templates),
    ])

    return buildPdfByReview(pres, reviewDir)
  }
  return { buildPdf }
}
