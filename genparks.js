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

// museum blocks list from:
// https://github.com/dcl-project-developers/aetheria-block-museum/blob/master/museumDefinition.csv
//
// block_id,block_name,artwork type,exhibit_name,labels,timestamp,explorer,path_artwork,path_description
// 0,The Genesis,garden,The First Million,"memorable,genesis",Jul-30-2015 03:26:13 PM +UTC,https://etherscan.io/block/0,./exhibits/0/artwork.png,./exhibits/0/description.txt
// 1,The Ethereum Frontier,garden,The First Million,"hardfork,genesis",Jul-30-2015 03:26:28 PM +UTC,https://etherscan.io/block/1,./exhibits/1/artwork.png,./exhibits/1/description.txt
// 762,Oldest One-time Miner,cryptoarte,The First Million,milestone,Jul-30-2015 03:55:08 PM +UTC,https://etherscan.io/block/762,./exhibits/762/artwork.png,./exhibits/762/description.txt
// 88090,The First ICO: Augur,cryptoarte,The First Million,"memorable, tokensale",Aug-15-2015 01:34:16 AM +UTC,https://etherscan.io/block/88090,./exhibits/88090/artwork.png,./exhibits/88090/description.txt
// 515000,DevCon-1: London,garden,The First Million,milestone,Nov-09-2015 05:54:45 PM +UTC,https://etherscan.io/block/515000,./exhibits/515000/artwork.png,./exhibits/515000/description.txt

// 1000000,One Million Blocks,cryptoarte,Early Days – theDAO,milestone,Feb-13-2016 10:54:13 PM +UTC,https://etherscan.io/block/1000000,./exhibits/1000000/artwork.png,./exhibits/1000000/description.txt
// 1150000,Homestead Fork,garden,Early Days – theDAO,hardfork,Mar-14-2016 06:49:53 PM +UTC,https://etherscan.io/block/1150000,./exhibits/1150000/artwork.png,./exhibits/1150000/description.txt
// 1428757,theDAO is deployed,cryptoarte,Early Days – theDAO,"memorable, theDAO, tokensale",Apr-30-2016 01:42:58 AM +UTC,https://etherscan.io/block/1428757,./exhibits/1428757/artwork.png,./exhibits/1428757/description.txt
// 1718497,theDAO is drained,cryptoarte,Early Days – theDAO,"infamous, theDAO",Jun-17-2016 03:34:48 AM +UTC,https://etherscan.io/block/1718497,./exhibits/1718497/artwork.png,./exhibits/1718497/description.txt
// 1920000,theDAO Fork,garden,Early Days – theDAO,"hardfork,theDAO",Jul-20-2016 01:20:40 PM +UTC,https://etherscan.io/block/1920000,./exhibits/1920000/artwork.png,./exhibits/1920000/description.txt

// 2283416,EXTCODESIZE DoS Attack,cryptoarte,Denial of Service,"infamous, DoSAttacks",Sep-18-2016 06:04:56 PM +UTC  ,https://etherscan.io/block/2283416,./exhibits/2283416/artwork.png,./exhibits/2283416/description.txt
// 2290000,DevCon-2: Shanghai,garden,Denial of Service,"milestone, DoSAttacks, theDAO",Sep-19-2016 08:36:02 PM +UTC,https://etherscan.io/block/2290000,./exhibits/2290000/artwork.png,./exhibits/2290000/description.txt
// 2421507,“Suicide Bomb” DoS Attack,cryptoarte,Denial of Service,"infamous, DoSAttacks",Oct-11-2016 03:55:16 PM +UTC ,https://etherscan.io/block/2421507,./exhibits/2421507/artwork.png,./exhibits/2421507/description.txt
// 2463000,Tangerine Whistle,cryptoarte,Denial of Service,"hardfork,DoSAttacks",Oct-18-2016 01:19:31 PM +UTC,https://etherscan.io/block/2463000,./exhibits/2463000/artwork.png,./exhibits/2463000/description.txt
// 2675000,Spurious Dragon,cryptoarte,Denial of Service,"hardfork,DoSAttacks",Nov-22-2016 04:15:44 PM +UTC,https://etherscan.io/block/2675000,./exhibits/2675000/artwork.png,./exhibits/2675000/description.txt

// 3141592,The Most Recent Pi Block,garden,The Bull Times,milestone, Feb-07-2017 08:44:26 PM +UTC,https://etherscan.io/block/3141592,./exhibits/3141592/artwork.png,./exhibits/3141592/description.txt
// 4041169,Parity Multisig Public Init Hack ,garden,The Bull Times,"infamous, tokensale",Jul-18-2017 10:28:36 PM +UTC ,https://etherscan.io/block/4041169,./exhibits/4041169/artwork.png,./exhibits/4041169/description.txt
// 4170700,Decentraland MANA sale startBlock,cryptoarte,The Bull Times,"memorable, dapp, tokensale",Aug-17-2017 09:21:54 PM +UTC,https://etherscan.io/block/4170700,./exhibits/4170700/artwork.png,./exhibits/4170700/description.txt
// 4321454,The Terraform Event,garden,The Bull Times,"memorable, dapp",Sep-29-2017 09:09:19 AM +UTC,https://etherscan.io/block/4321454,./exhibits/4321454/artwork.png,./exhibits/4321454/description.txt
// 4370000,Metropolis Byzantium,garden,The Bull Times,hardfork,Oct-16-2017 05:22:11 AM +UTC,https://etherscan.io/block/4370000,./exhibits/4370000/artwork.png,./exhibits/4370000/description.txt

// 4470000,DevCon-3: Cancun,garden,The Peak of Inflated Expectations,"milestone, tokensale",Nov-01-2017 11:35:19 AM +UTC,https://etherscan.io/block/4470000,./exhibits/4490000/artwork.png,./exhibits/4490000/description.txt
// 4501969,Parity Multisig Library Suicide,cryptoarte,The Peak of Inflated Expectations,"infamous, tokensale",Nov-06-2017 03:25:21 PM +UTC ,https://etherscan.io/block/4501969,./exhibits/4501969/artwork.png,./exhibits/4501969/description.txt
// 4605346,CryptoKitty #1 is born,garden,The Peak of Inflated Expectations,"memorable, dapp",Nov-23-2017 06:19:59 AM +UTC,https://etherscan.io/block/4605346,./exhibits/4605346/artwork.png,./exhibits/4605346/description.txt
// 4752008,The Birth of the DAI,cryptoarte,The Peak of Inflated Expectations,memorable,Dec-18-2017 03:10:38 AM +UTC,https://etherscan.io/block/4752008,./exhibits/4752008/artwork.png,./exhibits/4752008/description.txt
// 6610000,DevCon-4: Prague,garden,The Peak of Inflated Expectations,"milestone, buidl",Oct-30-2018 06:54:19 AM +UTC,https://etherscan.io/block/6610000,./exhibits/6610000/artwork.png,./exhibits/6610000/description.txt

const sourceParkDataArr = [
  {parkNumber: 1,   name: 'The Genesis',                                blockNumber: 0,       hash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'},
  {parkNumber: 2,   name: 'The Ethereum Frontier',                      blockNumber: 1,       hash: '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6'},
  {parkNumber: 3,   name: 'Oldest One-time Miner',                      blockNumber: 762,     hash: '0xd898664323723661c037e39cd24e7290dee0ffe3aa1a62f3cb0ace3034814403'},  
  {parkNumber: 4,   name: 'The First ICO: Augur',                       blockNumber: 88090,   hash: '0x0a7af5a5870648ff8c2c10691ac01e08451d054a15da8c4a843c5393752e2baa'},   
  {parkNumber: 5,   name: 'DevCon-1: London',                           blockNumber: 515000,  hash: '0x926287a535d7929ab81c0d72eb10f5711b8156d617f61d58b7b04ddab5673f78'},  

  {parkNumber: 6,   name: 'One Million Blocks',                         blockNumber: 1000000, hash: '0x8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e'},  
  {parkNumber: 7,   name: 'Homestead Fork',                             blockNumber: 1150000, hash: '0x584bdb5d4e74fe97f5a5222b533fe1322fd0b6ad3eb03f02c3221984e2c0b430'}, 
  {parkNumber: 8,   name: 'theDAO is deployed',                         blockNumber: 1428757, hash: '0x17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59'},  
  {parkNumber: 9,   name: 'theDAO is drained',                          blockNumber: 1718497, hash: '0xcaaa13ce099342d5e1342b04d588d7733093591666af8ef756ce20cf13d16475'},  
  {parkNumber: 10,  name: 'theDAO Fork',                                blockNumber: 1920000, hash: '0x4985f5ca3d2afbec36529aa96f74de3cc10a2a4a6c44f2157a57d2c6059a11bb'}, 

  {parkNumber: 11,  name: 'EXTCODESIZE DoS Attack',                     blockNumber: 2283416, hash: '0x9852a25198a980b28999db234404a99ebf38bd9531b330bf6d7cf4cfe0f904ea'},
  {parkNumber: 12,  name: 'DevCon-2: Shanghai',                         blockNumber: 2290000, hash: '0xb7307cb2eb75e101c7fa95972c255d6e03520a5390365b22cb07a8c7a3b849a2'},    
  {parkNumber: 13,  name: '“Suicide Bomb” DoS Attack',                  blockNumber: 2421507, hash: '0xc71986e9d7b7b17234ee8601009bdb7e3d2c1cbf0a24ce3d48375dba663c649f'},
  {parkNumber: 14,  name: 'Tangerine Whistle',                          blockNumber: 2463000, hash: '0x2086799aeebeae135c246c65021c82b4e15a2c451340993aacfd2751886514f0'}, 
  {parkNumber: 15,  name: 'Spurious Dragon',                            blockNumber: 2675000, hash: '0x58eff9265aedf8a54da8121de1324e1e0d9aac99f694d16c6a41afffe3817d73'}, 

  {parkNumber: 16,  name: 'The Most Recent Pi Block',                   blockNumber: 3141592, hash: '0x68a31d86567fcb4807643375ea68ab4d281a570d42399505c8e0b49ee574363f'},
  {parkNumber: 17,  name: 'Parity Multisig Public Init Hack',           blockNumber: 4041169, hash: '0x648276e5bffbeaaceae97b83954d7b79198032cce03dd538fe2f52b1da5f10c4'},
  {parkNumber: 18,  name: 'Decentraland MANA sale startBlock',          blockNumber: 4170700, hash: '0x6de40774564a3678218acc0f606c1e35464d632830db5c10e51e61f36e1326d3'},
  {parkNumber: 19,  name: 'The Terraform Event',                        blockNumber: 4321454, hash: '0x0a989ad83a89295795f9cc128dd00be1e6b430a86137cce4bbf66c3f015fb0b7'},    
  {parkNumber: 20,  name: 'Metropolis Byzantium',                       blockNumber: 4370000, hash: '0xb1fcff633029ee18ab6482b58ff8b6e95dd7c82a954c852157152a7a6d32785e'}, 

  {parkNumber: 21,  name: 'DevCon-3: Cancun',                           blockNumber: 4470000, hash: '0xdcbe9efcdb05574f8f10323c794e2246add50a99445951695e3da78f4cb71ce7'},
  {parkNumber: 22,  name: 'Parity Multisig Library Suicide',            blockNumber: 4501969, hash: '0x894f3aac1c8a0c9b05d2cbe6c0c9af907ca44a1c96aeda69a0ec064b9a74b790'},
  {parkNumber: 23,  name: 'CryptoKitty #1 is born',                     blockNumber: 4605346, hash: '0x62b5de48e43c2ff66623d272f9dd1db879870f9d78c840b450501b9e4fbe93ab'},
  {parkNumber: 24,  name: 'The Birth of the DAI',                       blockNumber: 4752008, hash: '0x1ccb5da1337a99a6f864046dbbc79ba3be50ff6122811eb3989f6a470d2492f1'},
  {parkNumber: 25,  name: 'DevCon-4: Prague',                           blockNumber: 6610000, hash: '0x1d47e931fc01f54f1119f5efd98ab4fd0e07ed6358da0d15de30611a7ecede69'},
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