const { spawn } = require('child_process')
const { join } = require('path')
const fs = require('fs')

const binDir = process.env.RESOURCES_BIN_DIR || join(__dirname, '../../../app/resources/bin')
const sourceBin = 'backend-server'

const isDev = process.argv.includes('--dev')
// dev: breeze-backend-dev, prod: breeze-backend
// dev-win: breeze-backend-dev.exe, prod-win: breeze-backend.exe
const targetBin = `breeze-backend${isDev ? '-dev' : ''}${process.platform === 'win32' ? '.exe' : ''}`
const targetBinPath = join(binDir, targetBin)
const extraArgsIndex = process.argv.indexOf('--')
const extraArgs = extraArgsIndex !== -1 ? process.argv.slice(extraArgsIndex + 1) : []

const command = 'cargo-cp-artifact'
const args = [
  '-nb',
  sourceBin,
  '--',
  'cargo',
  'build',
  '--message-format=json-render-diagnostics',
  ...extraArgs
]

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

child.on('error', (error) => {
  console.error(`error: ${error.message}`)
  process.exit(1)
})

child.on('close', (code) => {
  console.log(`Cargo-cp-artifact process exited with code ${code}`)

  console.log(`Copying binary now, current working directory: ${process.cwd()}`)

  if (code !== 0) {
    console.log('error: build failed')
    process.exit(code)
  }

  if (!fs.existsSync(sourceBin)) {
    console.error(`Source file does not exist: ${sourceBin}`)
    process.exit(1)
  }

  console.log(`copying binary from ${sourceBin} to ${targetBinPath}`)
  try {
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir)
    }
    fs.copyFileSync(sourceBin, targetBinPath)
  } catch (err) {
    console.error(`error: ${err.message}`)
    process.exit(1)
  }
})
