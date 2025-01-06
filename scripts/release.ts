import { execSync } from 'node:child_process'
import process from 'node:process'
import { readJSONSync } from 'fs-extra'

const { version: oldVersion } = readJSONSync('package.json')

// Mettre à jour la version dans package.json
execSync('bumpp -r --no-commit --no-tag --no-push', { stdio: 'inherit' })

const { version } = readJSONSync('package.json')

if (oldVersion === version) {
  console.log('annulé')
  process.exit()
}

// Créer le commit et le tag
execSync('git add .', { stdio: 'inherit' })
execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' })
execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' })
