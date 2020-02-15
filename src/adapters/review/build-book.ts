import childProcess from 'child_process'
import path from 'path'

import { Presentation } from '../../ports/presentation'
import {
  BuildBookPorts,
  BuildBookPortsFactory,
} from '../../ports/build-book'
import { writeYaml, createCatalog, copyTemplates } from './tasks'
import { preparingConfig } from './config'

import { parseReviewMessage } from './parse-message'

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
          pres.progress('done')
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
