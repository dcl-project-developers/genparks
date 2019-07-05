#!/usr/bin/env node

const fs = require('fs')
const path = require('path');
const args = process.argv

const chalk = require('chalk')
const childProcess = require('child_process')
const fse = require('fs-extra')

function logError(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

function logSuccess(string) {
  const sLog = chalk.green(string)
  console.log(sLog)
}

const showHelp = function() {
  const helpText = `
  Generate Decentraland parks.

  usage:

    genparks <command> [<random-number>] [<output-folder>]

    commands can be:

    new:      generate a park using <random-number> in <output-folder>
    help:     show help
  `

  console.log(helpText)
}

const generatePark = function(randomNumber, outputFolder) {

  // validate randomNumber
  let number = Number(randomNumber)
  if(isNaN(number) || !Number.isInteger(number) || number <= 0 || number > 1024) {
    logError('Random number is invalid (must be an integer between 1 and 1024)')
    process.exit(1)
  }

  // validate outputFolder
  if(fs.existsSync(outputFolder)) {
    logError('Output folder already exists')
    process.exit(1)
  }

  // create output folder
  try {
    fs.mkdirSync(outputFolder)
  } catch(err) {
    logError('Could not create output folder:\n' + err)
    process.exit(1)
  }
  logSuccess('Ouput folder created')

  // check DCL installed - maybe we can later also check the version output (currently using 3.2.1) or add to npm dependencies
  // let spawnResultCheck = childProcess.spawnSync('dcl', ['version'])
  // if(spawnResultCheck.error) {
  //   logError('Error executing dcl:\n', spawnResultCheck.error)
  //   process.exit(1)
  // }

  // init the park using DCL CLI
  let spawnResultInit = childProcess.spawnSync('dcl', ['init'], {cwd: outputFolder})
  if(spawnResultInit.error) {
    logError('Error executing dcl init:\n' + spawnResultInit.error)
    process.exit(1)
  }
  logSuccess('Ouput folder initialized')

  // copy templates over to output folder
  try {
    fse.copySync(path.join(__dirname, 'templates'), path.join(__dirname, outputFolder))
    logSuccess('Templates applied')
    logSuccess(`To preview your new scene, cd ${outputFolder} && dcl start`)    
  } catch(err) {
    logError('Error copying templates:\n' + err)    
  }

}

switch(args[2]) {
  case 'new':
    if(args.length !== 5 || !args[3] || !args[4]) {
      logError('Invalid arguments')
      showHelp()
      process.exit(1)
    } else {
      generatePark(args[3], args[4])
      process.exit(0)
    }
    break

  case 'help':
    showHelp()
    process.exit(0)
    break    

  default:
    logError('Invalid arguments')
    showHelp()
    process.exit(1)
}