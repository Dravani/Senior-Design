import chalk from 'chalk'

const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(chalk.bold.red(...params))
  }
}

export default { info, error }
