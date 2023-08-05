import rules from './rules'
import config from './config'

function isObject(arg) {
  return arg && typeof arg === 'object'
}

function run(cnf) {
  if (!isObject(cnf)) {
    throw Error('Config should be an object')
  }

  const newConfig = {}
  rules.forEach(rule => {
    if (rule.colors && isObject(cnf.colors)) {
      newConfig.colors = rule.colors(cnf.colors)
    }
  })

  console.log(newConfig)
}

run(config)
console.log('config', config)
