#!/usr/bin/env node

const fs = require('fs')
const path = require('path');
const args = process.argv

const chalk = require('chalk')
const childProcess = require('child_process')
const fse = require('fs-extra')
const ejs = require('ejs')

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

    genparks <command> [<park-number>]

    commands can be:

    new:      generate park number <park-number>
    help:     show help
  `

  console.log(helpText)
}

const subColors = ['00', '33', '66', '99', 'CC', 'FF']
const options = subColors.length
const random1 = Math.floor(Math.random() * options)
const random2 = Math.floor(Math.random() * options)
const random3 = Math.floor(Math.random() * options)
const random4 = Math.floor(Math.random() * options)

const buildColor = function(parkNumber, variationNumber) {
  let color = ''
  switch(variationNumber) {
    case 1:
      color = '#' + subColors[random1] + subColors[random2] + subColors[random3]
      break;
    case 2:
      color = '#' + subColors[random1] + subColors[random3] + subColors[random2]
      break;
    case 3:
      color = '#' + subColors[random2] + subColors[random1] + subColors[random3]
      break;    
    case 4:
      color = '#' + subColors[random2] + subColors[random3] + subColors[random1]
      break;    
    case 5:
      color = '#' + subColors[random3] + subColors[random1] + subColors[random2]
      break;    
    case 6:
      color = '#' + subColors[random3] + subColors[random2] + subColors[random1]
      break;    
    case 7:
      color = '#' + subColors[random1] + subColors[random2] + subColors[random4]
      break;
    case 8:
      color = '#' + subColors[random1] + subColors[random4] + subColors[random2]
      break;
  }
  return color;
}

const pathColor1 = function(parkNumber) {
  return buildColor(parkNumber, 1)
}
const pathColor2 = function(parkNumber) {
  return buildColor(parkNumber, 2)
}
const pathColor3 = function(parkNumber) {
  return buildColor(parkNumber, 3)
}
const pathColor4 = function(parkNumber) {
  return buildColor(parkNumber, 4)
}
const benchColor1 = function(parkNumber) {
  return buildColor(parkNumber, 5)
}
const benchColor2 = function(parkNumber) {
  return buildColor(parkNumber, 6)
}
const benchColor3 = function(parkNumber) {
  return buildColor(parkNumber, 7)
}
const benchColor4 = function(parkNumber) {
  return buildColor(parkNumber, 8)
}

const templateVars = function(parkNumber) {

  let vars = {
    benchLength: 4,
    legHeight: 0.6,
    legWidth: 0.05,
    sittingWidth: 1,
    sittingHeight: 0.1,
    backWidth: 0.1,
    backHeight: 0.6,
    pathWidth: 2,
    pathLength: 16,
    pathHeight: 1,
    paths: [
      {x: 3,  y: 0, z: 8,  angle: 0,   color: pathColor1(parkNumber)},      // westPath
      {x: 8,  y: 0, z: 13, angle: 90,  color: pathColor2(parkNumber)},      // northPath
      {x: 13, y: 0, z: 8,  angle: 180, color: pathColor3(parkNumber)},      // eastPath
      {x: 8,  y: 0, z: 3,  angle: 270, color: pathColor4(parkNumber)}       // southPath
    ],
    benches: [
      {x: 1,  y: 0, z: 8,  angle: 0,   color: benchColor1(parkNumber)},       // westBench  
      {x: 8,  y: 0, z: 15, angle: 90,  color: benchColor2(parkNumber)},       // northBench
      {x: 15, y: 0, z: 8,  angle: 180, color: benchColor3(parkNumber)},       // eastBench
      {x: 8,  y: 0, z: 1,  angle: 270, color: benchColor4(parkNumber)}        // southBench
    ],
    trees: [
      {x: 1,  y: 0.5, z: 1},    // swTree
      {x: 5,  y: 0.5, z: 1},    // swnTree
      {x: 1,  y: 0.5, z: 5},    // sweTree
      {x: 1,  y: 0.5, z: 15},   // nwTree
      {x: 1,  y: 0.5, z: 11},   // nwsTree
      {x: 5,  y: 0.5, z: 15},   // nweTree
      {x: 15, y: 0.5, z: 15},   // neTree
      {x: 11, y: 0.5, z: 15},   // newTree
      {x: 15, y: 0.5, z: 11},   // nesTree
      {x: 15, y: 0.5, z: 1},    // seTree
      {x: 15, y: 0.5, z: 5},    // senTree
      {x: 11, y: 0.5, z: 1},    // sewTree
    ]
  }

  return vars
}

const generatePark = function(parkNumber, outputFolder) {

  const sourceFolder = 'templates'

  // validate parkNumber
  let number = Number(parkNumber)
  if(isNaN(number) || !Number.isInteger(number) || number <= 0 || number > 512) {
    logError('Random number is invalid (must be an integer between 1 and 512)')
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
  fs.unlinkSync(path.join(__dirname, outputFolder, 'src', 'game.ts')) // delete the src/game.ts file generated by DCL (we'll replace it later)
  logSuccess('Ouput folder initialized')

  // copy all non-ejs files in /templates over to output folder
  const filterFunc = (source, destination) => {
    let extension = source.split('.').pop()
    if(extension === 'ejs') {
      return false
    }
    return true
  }  
  try {
    fse.copySync(path.join(__dirname, sourceFolder), path.join(__dirname, outputFolder), { filter: filterFunc })
    logSuccess('Templates applied')
    logSuccess(`To preview your new scene, cd ${outputFolder} && dcl start`)    
  } catch(err) {
    logError('Error copying templates:\n' + err)    
    process.exit(1)
  }

  // generate game.ts using ejs templating
  let vars = templateVars(parkNumber)
  ejs.renderFile(path.join(__dirname, sourceFolder, 'src', 'game.ts.ejs'), vars, (err, output) => {
    if(err) {
      logError('Error applying ejs template:\n' + err)
      process.exit(1)
    } else {
      fse.writeFileSync(path.join(__dirname, outputFolder, 'src', 'game.ts'), output)
      logSuccess('Game.ts generated')
      process.exit(0)
    }
  })
}

switch(args[2]) {
  case 'new':
    if(args.length !== 4 || !args[3]) {
      logError('Invalid arguments')
      showHelp()
      process.exit(1)
    } else {
      let outputFolder = `park-${args[3]}`
      generatePark(args[3], outputFolder)
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