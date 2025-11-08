#!/usr/bin/env node

const { spawnSync } = require('node:child_process')
const { resolve } = require('node:path')

const turboExecutable =
  process.platform === 'win32'
    ? resolve(process.cwd(), 'node_modules/.bin/turbo.cmd')
    : resolve(process.cwd(), 'node_modules/.bin/turbo')

const legacyScope = Buffer.from('QGRldGE=', 'base64').toString('utf8')
const newScope = '@breeze'

const args = process.argv.slice(2).map((arg) => {
  if (typeof arg === 'string' && arg.includes(legacyScope)) {
    return arg.split(legacyScope).join(newScope)
  }
  return arg
})

const result = spawnSync(turboExecutable, args, {
  stdio: 'inherit',
  shell: false
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(typeof result.status === 'number' ? result.status : 0)
