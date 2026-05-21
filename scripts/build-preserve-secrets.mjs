import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const secretPath = resolve('dist/api/smtp-secret.php')
const savedSecret = existsSync(secretPath) ? readFileSync(secretPath, 'utf8') : null

const result = spawnSync('vite', ['build'], {
  stdio: 'inherit',
  shell: true,
})

if (savedSecret !== null) {
  mkdirSync(dirname(secretPath), { recursive: true })
  writeFileSync(secretPath, savedSecret)
}

process.exit(result.status ?? 1)
