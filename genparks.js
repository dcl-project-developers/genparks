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

const sourceParkDataArr = [
  {parkNumber: 1,   name: 'Genesis',                              blockNumber: 0,       hash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'},
  {parkNumber: 2,   name: 'Frontier',                             blockNumber: 1,       hash: '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6'},
  {parkNumber: 3,   name: 'Homestead',                            blockNumber: 1150000, hash: '0x584bdb5d4e74fe97f5a5222b533fe1322fd0b6ad3eb03f02c3221984e2c0b430'}, 
  {parkNumber: 4,   name: 'DAO Fork',                             blockNumber: 1920000, hash: '0x4985f5ca3d2afbec36529aa96f74de3cc10a2a4a6c44f2157a57d2c6059a11bb'}, 
  {parkNumber: 5,   name: 'Tangerine Whistle',                    blockNumber: 2463000, hash: '0x2086799aeebeae135c246c65021c82b4e15a2c451340993aacfd2751886514f0'}, 
  {parkNumber: 6,   name: 'Spurious Dragon',                      blockNumber: 2675000, hash: '0x58eff9265aedf8a54da8121de1324e1e0d9aac99f694d16c6a41afffe3817d73'}, 
  {parkNumber: 7,   name: 'Metropolis Byzantium',                 blockNumber: 4370000, hash: '0xb1fcff633029ee18ab6482b58ff8b6e95dd7c82a954c852157152a7a6d32785e'}, 
  {parkNumber: 8,   name: 'First ICO contract deployed Augur',    blockNumber: 88090,   hash: '0x0a7af5a5870648ff8c2c10691ac01e08451d054a15da8c4a843c5393752e2baa'}, 
  {parkNumber: 9,   name: 'The DAO is deployed',                  blockNumber: 1428757, hash: '0x17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59'},
  {parkNumber: 10,  name: 'DAI birth',                            blockNumber: 4752008, hash: '0x1ccb5da1337a99a6f864046dbbc79ba3be50ff6122811eb3989f6a470d2492f1'},
  {parkNumber: 11,  name: 'Cryptokitty #1 is born',               blockNumber: 4605346, hash: '0x62b5de48e43c2ff66623d272f9dd1db879870f9d78c840b450501b9e4fbe93ab'},
  {parkNumber: 12,  name: 'Decentraland ICO startBlock',          blockNumber: 4170700, hash: '0x6de40774564a3678218acc0f606c1e35464d632830db5c10e51e61f36e1326d3'},
  {parkNumber: 13,  name: 'Decentraland Terraform Event',         blockNumber: 4321454, hash: '0x0a989ad83a89295795f9cc128dd00be1e6b430a86137cce4bbf66c3f015fb0b7'},
  {parkNumber: 14,  name: 'Oldest one-time miner block',          blockNumber: 762,     hash: '0xd898664323723661c037e39cd24e7290dee0ffe3aa1a62f3cb0ace3034814403'},
  {parkNumber: 15,  name: 'Devcon-1',                             blockNumber: 515000,  hash: '0x926287a535d7929ab81c0d72eb10f5711b8156d617f61d58b7b04ddab5673f78'},
  {parkNumber: 16,  name: 'Devcon-2',                             blockNumber: 2290000, hash: '0xb7307cb2eb75e101c7fa95972c255d6e03520a5390365b22cb07a8c7a3b849a2'},
  {parkNumber: 17,  name: 'Devcon-3',                             blockNumber: 4750000, hash: '0x35597b713e97d19260ffaeb2666dc9c78877eb9b48681346137283bad018e8e9'},
  {parkNumber: 18,  name: 'Devcon-4',                             blockNumber: 6610000, hash: '0x1d47e931fc01f54f1119f5efd98ab4fd0e07ed6358da0d15de30611a7ecede69'},
  {parkNumber: 19,  name: '1 M milestone',                        blockNumber: 1000000, hash: '0x8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e'},
  {parkNumber: 20,  name: 'Last Pi block',                        blockNumber: 3141592, hash: '0x68a31d86567fcb4807643375ea68ab4d281a570d42399505c8e0b49ee574363f'},
  {parkNumber: 21,  name: 'DAO contract starts being drained',    blockNumber: 1718497, hash: '0xcaaa13ce099342d5e1342b04d588d7733093591666af8ef756ce20cf13d16475'},
  {parkNumber: 22,  name: 'DOS hack',                             blockNumber: 2283416, hash: '0x9852a25198a980b28999db234404a99ebf38bd9531b330bf6d7cf4cfe0f904ea'},
  {parkNumber: 23,  name: 'Empty account attacks',                blockNumber: 2421507, hash: '0xc71986e9d7b7b17234ee8601009bdb7e3d2c1cbf0a24ce3d48375dba663c649f'},
  {parkNumber: 24,  name: 'Parity multisig hack',                 blockNumber: 4041169, hash: '0x648276e5bffbeaaceae97b83954d7b79198032cce03dd538fe2f52b1da5f10c4'},
  {parkNumber: 25,  name: 'Parity library suicide',               blockNumber: 4501969, hash: '0x894f3aac1c8a0c9b05d2cbe6c0c9af907ca44a1c96aeda69a0ec064b9a74b790'}
]

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
    ],
    parkData: sourceParkDataArr[parkNumber - 1 % sourceParkDataArr.length]
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