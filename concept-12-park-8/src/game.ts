// ---- PARK With Artwork ----
























/// ---- CLIMBING ----
// Concept: use steps to build a climbing structure

let tileHeight = 0.05

// the puzzle version of CLIMBING is concept #11 - adds decorators and click event handling with puzzle accounting
let puzzleAccumulatedTotal = 0
let puzzleAccumulatedClicks = 0

// used for movement
let step = 0

// Create UI canvas and text
// see https://docs.decentraland.org/development-guide/onscreen-ui/
const uCanvas = new UICanvas() 
const uRect = new UIScrollRect(uCanvas)
//const uRect = new UIContainerRect(uCanvas)
uRect.width = 300
uRect.height = 150
uRect.hAlign = 'right'
uRect.vAlign = 'bottom'
// uRect.paddingLeft = '10%'
// uRect.paddingRight = '10%'
// uRect.paddingTop = '10%'
// uRect.paddingBottom = '10%'
// uRect.isVertical = true
// uRect.color = Color4.Gray()
uRect.backgroundColor = Color4.Gray()
uRect.opacity = 0.5

const uText = new UIText(uRect)
uText.fontSize = 16
uText.color = Color4.White()
uText.textWrapping = true
uText.width = '80%'
uText.height = '80%'
// uText.paddingTop = '10%'
// uText.paddingBottom = '10%'
uText.hAlign = 'center'
uText.vAlign = 'top'

let timerStart = null

let legMaterial = new Material()
legMaterial.hasAlpha = false
legMaterial.metallic = 1
legMaterial.roughness = 1
legMaterial.emissiveColor = Color3.FromHexString('#a0a0a0')
legMaterial.ambientColor = Color3.FromHexString('#ffffff')
legMaterial.reflectionColor = Color3.FromHexString('#ffffff')
legMaterial.albedoColor = Color3.FromHexString('#ffffff')

// let theEntities:Entity[] = new Array(64)
let theEntities = []
let theRadios = []

export class SimpleMove implements ISystem {

  update() {

    let distance = null

    // go back to 0 every 100 steps
    if(step >= 100) {
      step = 0
    }

    // move the entities
    for(let i = 0; i < theEntities.length; i++) {

      let transform = theEntities[i].getComponent(Transform)

      let movementDistance = (theRadios[i] + tileHeight / 2.0) / 25.0

      // for the 25 steps from step = 0 to step = 24, move up
      if(step < 25) {
        distance = Vector3.Up().scale(movementDistance)
      }
      // for the 50 steps from step = 25 to step = 74, move down
      if(step >= 25 && step < 75) {
        distance = Vector3.Down().scale(movementDistance)
      }
      // for the 25 steps from step = 75 to step = 99, move up
      if(step >= 75) {     
        distance = Vector3.Up().scale(movementDistance)        
      }      
      transform.translate(distance)
    }

    // incremenet step
    step += 1

  }
  
}

function showNft() {
  // see: https://docs.decentraland.org/blockchain-interactions/display-a-certified-nft/
  const entity = new Entity()
  const shapeComponent = new NFTShape('ethereum://0x06012c8cf97BEaD5deAe237070F9587f8E7A266d/558536')
  entity.addComponent(shapeComponent)
  entity.addComponent(
    new Transform({
      position: new Vector3(8, 0.5, 8)
    })
  )
  engine.addEntity(entity)  
}

function buildStepDecorator(blockNumber, tileWidth, x, y, z, stepNumber, index, movement?: boolean) {
  // console.log('build step decorator', x, y, z, stepNumber, index, movement)

  // use index for the radio
  const radio = (tileWidth * 0.25) * ((index + 1)/ 5.0)

  // use same decorator color as buildings artwork (maybe refactor if we keep this?)
  const decoratorColors = ['#ffffa0', '#ffa0ff', '#a0ffff', '#ffa0a0', '#a0ffc0', '#a0a0ff', '#a0a0a0']
  let decoratorColorHex = decoratorColors[index % (decoratorColors.length - 1)]
  let decoratorMaterial = new Material()
  decoratorMaterial.hasAlpha = false
  decoratorMaterial.albedoColor = Color3.FromHexString(decoratorColorHex)

  // set a bunch of other material properties e.g.:
  // emissiveColor: The color emitted from the material.
  // ambientColor: AKA Diffuse Color in other nomenclature.
  // reflectionColor: The color reflected from the material.
  // reflectivityColor: AKA Specular Color in other nomenclature.

  decoratorMaterial.metallic = 0.2
  decoratorMaterial.roughness = 0

  // decoratorMaterial.emissiveColor = Color3('#000000')
  // decoratorMaterial.ambientColor = Color3('#000000')
  // decoratorMaterial.reflectionColor = Color3('#000000')
  // decoratorMaterial.reflectivityColor = Color3('#ffffff')

  let sphere = new Entity()
  sphere.addComponent(decoratorMaterial)
  sphere.addComponent(new SphereShape())
  sphere.addComponent(new Transform({
    scale: new Vector3(radio, radio, radio),
    position: new Vector3(
      x, 
      y, 
      z
    )
  }))  
  engine.addEntity(sphere)

  if(movement) {
    theEntities.push(sphere)
    theRadios.push(radio)
  }

  // handle click event
  sphere.addComponent(
    new OnClick(e => {

      // console.log("sphere clicked entering event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

      // set timer start if not yet set
      if(!timerStart) {
        timerStart = Date.now()
      }

      puzzleAccumulatedTotal = stepNumber * Math.pow(64, puzzleAccumulatedClicks) + puzzleAccumulatedTotal
      puzzleAccumulatedClicks = puzzleAccumulatedClicks + 1        

      // console.log("sphere calculated event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

      // check for win / loss
      if(puzzleAccumulatedTotal > blockNumber) {
        uText.value = 'Sorry, that\'s too far (' + puzzleAccumulatedTotal + ')! Puzzle restarted - click on a sphere to go again.'
        puzzleAccumulatedTotal = 0
        puzzleAccumulatedClicks = 0
        timerStart = null
      } else {
        if(puzzleAccumulatedTotal === blockNumber) {
          let timeElapsedInMilliseconds = Date.now() - timerStart
          uText.value = 'Congratulations. You\'ve solved the puzzle (' + puzzleAccumulatedTotal + ') in ' + (timeElapsedInMilliseconds / 1000.0).toFixed(2) + ' seconds! You can now verify ownership of this park scene by checking out the NFT at the bottom center of the park.'
          puzzleAccumulatedTotal = 0 
          puzzleAccumulatedClicks = 0   
          showNft()
          timerStart = null
        } else {
          if(puzzleAccumulatedTotal < blockNumber) {
            uText.value = 'Hmm... keep going... (' + puzzleAccumulatedTotal + ')'
          }        
        }
      }

      // console.log("sphere clicked exiting event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

    })
  )
  
}

function parkStepColor(parkNumber, stepHexDigit, stepNumber) {

  let parkRed = 0
  let parkGreen = 0
  let parkBlue = 0
  let stepRed = 0
  let stepGreen = 0
  let stepBlue = 0
  let numberOfParks = 25.0
  let stepDecimal = parseInt('0x' + stepHexDigit, 16)

  // parks 1 through 8 are blue-ish with a little green and increasingly red with height
  if(parkNumber >= 1 && parkNumber <= 8) {
    parkBlue = parkNumber / 8.0
    stepBlue = (stepDecimal + 1) / 16.0

    parkGreen = 0
    stepGreen = ((stepDecimal + 1) / 16.0) / 2.0

    parkRed = 0
    stepRed = stepNumber / 64.0    
  }
  // parks 9 through 16 are red-ish with a little blue and increasingly green with height
  if(parkNumber >= 9 && parkNumber <= 16) {
    parkRed = (parkNumber - 8) / 8.0
    stepRed = (stepDecimal + 1) / 16.0

    parkBlue = 0
    stepBlue = ((stepDecimal + 1) / 16.0) / 2.0

    parkGreen = 0
    stepGreen = stepNumber / 64.0

    
  }
  // parks 17 through 24 are green-ish with a little red and increasingly blue with height
  if(parkNumber >= 17 && parkNumber <= 24) {
    parkGreen = (parkNumber - 16) / 8.0
    stepGreen = (stepDecimal + 1) / 16.0

    parkRed = 0
    stepRed = ((stepDecimal + 1) / 16.0) / 2.0
    
    parkBlue = 0
    stepBlue = stepNumber / 64.0
  }  

  // park 25 has special lighter color palette that gets closer to white towards the top
  if(parkNumber == 25) {

    // the letter / step positioning dictates the amount of red
    parkRed = 0
    stepRed = ((stepDecimal + 1) / 16.0) * 2  

    // the step number dictates the amount of green and blue
    parkGreen = 0
    stepGreen = stepNumber / 64.0 * 2
    parkBlue = 0
    stepBlue = stepNumber / 64.0 * 2
  }    
  return new Color3((parkRed + stepRed) / 2.0, (parkGreen + stepGreen) / 2.0, (parkBlue + stepBlue) / 2.0)
}

function buildStep(parkNumber, blockNumber, stepNumber, previousStepHexDigit, stepHexDigit, currentHeight, smallConcept, puzzleMode, base64BlockNumberArray?: number[], movement?: boolean) {

  let artWidth = 8
  const xBase = 4
  const zBase = 4
  let lastStepWidth = 0.5
  let tileWidth = artWidth / 4.0
  let tileLength = tileWidth
  //let tileHeight = 0.05

  let stepDecimal = parseInt('0x' + stepHexDigit, 16)
  let previousStepDecimal = parseInt('0x' + previousStepHexDigit, 16)

  // console.log(
  //   'stepNumber', stepNumber, 
  //   'stepHexDigit', stepHexDigit, 
  //   'stepDecimal', stepDecimal, 
  //   'previousStepHexDigit', previousStepHexDigit, 
  //   'previousStepDecimal', previousStepDecimal, 
  // )
  
  // add the color
  let stepMaterial = new Material()
  stepMaterial.hasAlpha = false
  stepMaterial.albedoColor = parkStepColor(parkNumber, stepHexDigit, stepNumber)

  let stepHeight = 0
  if(smallConcept) {
    stepHeight = 0.3
  } else {
    stepHeight = 1
  }

  currentHeight += stepHeight
  
  // map the stepDecimal [0, 15] to a 4x4 with (x,z) pair coordinates
  let x = stepDecimal % 4
  let z = Math.floor(stepDecimal / 4.0)
  
  // add the step
  let tile = new Entity()
  tile.addComponent(stepMaterial)
  tile.addComponent(new BoxShape())
  tile.addComponent(new Transform({
    scale: new Vector3(tileWidth, tileHeight, tileLength),
    position: new Vector3(
      xBase + tileWidth * x + tileWidth / 2.0,
      currentHeight + tileHeight / 2.0, 
      zBase + tileLength * z + tileLength / 2.0
    )
  }))
  engine.addEntity(tile)

  // add the tile to the array of entities to be moved
  // if(movement) {
  //   theEntities.push(tile)
  // }

  // build the legs

  if(!smallConcept) {
    
    let legWidth = 0.01
    let legLength = 0.01    
    let legHeight = currentHeight
    let legMargin = tileWidth * 0.2

    let legSouthWest = new Entity()
    legSouthWest.addComponent(legMaterial)
    legSouthWest.addComponent(new BoxShape())
    legSouthWest.addComponent(new Transform({
      scale: new Vector3(legWidth, legHeight, legLength),
      position: new Vector3(
        xBase + tileWidth * x + legWidth / 2.0 + legMargin,
        legHeight / 2.0, 
        zBase + tileLength * z + legLength / 2.0 + legMargin
      )
    }))
    engine.addEntity(legSouthWest)

    let legNorthEast = new Entity()
    legNorthEast.addComponent(legMaterial)
    legNorthEast.addComponent(new BoxShape())
    legNorthEast.addComponent(new Transform({
      scale: new Vector3(legWidth, legHeight, legWidth),
      position: new Vector3(
        xBase + tileWidth * (x + 1) - legWidth / 2.0 - legMargin, 
        legHeight / 2.0, 
        zBase + tileLength * (z + 1) - legLength / 2.0 - legMargin
      )
    }))
    engine.addEntity(legNorthEast)

  } else {

    let legWidth = 0.03
    let legLength = 0.03
    let legHeight = currentHeight
    let legCenter = new Entity()
    let xCoord = xBase + tileWidth * x + tileWidth / 2.0 + legWidth / 2.0
    let zCoord = zBase + tileLength * z + tileLength / 2.0 + legLength / 2.0
    legCenter.addComponent(legMaterial)
    legCenter.addComponent(new BoxShape())
    legCenter.addComponent(new Transform({
      scale: new Vector3(legWidth, legHeight, legLength),
      position: new Vector3(
        xCoord,
        legHeight / 2.0, 
        zCoord
      )
    }))
    engine.addEntity(legCenter)

    if(puzzleMode) {
      uText.value = 'Welcome to park #' + parkNumber + '. To solve the puzzle, encode the block number (' + blockNumber + ') by clicking on the spheres in the right order.'

      // add a decoration if step number belongs to the base 64 representation of blockNumber
      for(let index = 0; index < base64BlockNumberArray.length; index++) {
        if(base64BlockNumberArray[index] === stepNumber) {
          buildStepDecorator(blockNumber, tileWidth, xCoord, currentHeight, zCoord, stepNumber, index, movement)
        }
      }  
    }
  }

  return currentHeight
}

function buildClimbingArtwork(parkNumber: number, blockNumber: number, hash: string, smallConcept: boolean, puzzleMode: boolean, base64BlockNumberArray?: number[], movement?: boolean) {
  let currentHeight = 0
  for(let i = 0; i < 64; i++) {
    let currentHash = hash[i]
    let previousHash = (i == 0 ? hash[63] : hash[i - 1])
    currentHeight = buildStep(parkNumber, blockNumber, i, previousHash, currentHash, currentHeight, smallConcept, puzzleMode, base64BlockNumberArray, movement)
  }

  // prepare base path colors and base bench colors
  let pathBaseColor = null
  let benchBaseColor = null
  
  // parks 1 through 8 are blue-ish with a little green and increasingly red with height
  if(parkNumber >= 1 && parkNumber <= 8) {
    pathBaseColor = Color3.Yellow()
    benchBaseColor = Color3.Green()
  }
  // parks 9 through 16 are red-ish with a little blue and increasingly green with height
  if(parkNumber >= 9 && parkNumber <= 16) {
    pathBaseColor = Color3.Yellow()
    benchBaseColor = Color3.Blue()
  }
  // parks 17 through 24 are green-ish with a little red and increasingly blue with height
  if(parkNumber >= 17 && parkNumber <= 24) {
    pathBaseColor = Color3.Blue()
    benchBaseColor = Color3.Red()    
  }  

  // park 25 has special lighter color palette that gets closer to white towards the top
  if(parkNumber == 25) {
    pathBaseColor = Color3.Yellow()
    benchBaseColor = Color3.Green()
  }    

  // paths
  let pathColors = []

  // west path uses step 8 color
  pathColors[0] = Color3.Lerp(pathBaseColor, parkStepColor(parkNumber, '8', 0), 0.8)
  
  // north 1 and 2 path use step d color
  pathColors[1] = Color3.Lerp(pathBaseColor, parkStepColor(parkNumber, 'd', 22), 0.8)
  pathColors[2] = pathColors[1]

  // east path 1 and 2 use step b color
  pathColors[3] = Color3.Lerp(pathBaseColor, parkStepColor(parkNumber, 'b', 43), 0.8)
  pathColors[4] = pathColors[3]

  // south path 1, 2, and 3 use step 2 color
  pathColors[5] = Color3.Lerp(pathBaseColor, parkStepColor(parkNumber, '2', 63), 0.8)
  pathColors[6] = pathColors[5]
  pathColors[7] = pathColors[5]

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 16, 3, 0.025, 8, 0, pathColors[0], 'theDAO is deployed'))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 2, 1, 0.025, 13, 90, pathColors[1]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 12, 10, 0.025, 13, 90, pathColors[2]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 2, 13, 0.025, 15, 180, pathColors[3]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 12, 13, 0.025, 6, 180, pathColors[4]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 2, 15, 0.025, 3, 270, pathColors[5]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 8, 8, 0.025, 3, 270, pathColors[6]))
  

  

  
    engine.addEntity(buildPathWithColor3(2, 0.05, 2, 1, 0.025, 3, 270, pathColors[7]))
  

  

  // benches
  let benchColors = []

  // west bench uses step 8 color
  benchColors[0] = Color3.Lerp(benchBaseColor, parkStepColor(parkNumber, '8', 0), 0.8)
  // north bench uses step d color
  benchColors[1] = Color3.Lerp(benchBaseColor, parkStepColor(parkNumber, 'd', 22), 0.8)
  // east bench uses step b color
  benchColors[2] = Color3.Lerp(benchBaseColor, parkStepColor(parkNumber, 'b', 43), 0.8)
  // south bench uses step 2 color
  benchColors[3] = Color3.Lerp(benchBaseColor, parkStepColor(parkNumber, '2', 63), 0.8)

  

  engine.addEntity(buildBenchWithColor3(1, 0, 8, 0, benchColors[0]))

  

  engine.addEntity(buildBenchWithColor3(8, 0, 15, 90, benchColors[1]))

  

  engine.addEntity(buildBenchWithColor3(15, 0, 8, 180, benchColors[2]))

  

  engine.addEntity(buildBenchWithColor3(8, 0, 1, 270, benchColors[3]))

    

  if(movement) {
    engine.addSystem(new SimpleMove())
  }
}
function toBaseArray(value, base) {

  let resultArr = []
  do {
    let mod = value % base
    resultArr.push(mod)
    value = Math.floor(value / 64)
  } while(value > 0)

  return resultArr
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  let base64BlockNumberArray = toBaseArray(blockNumber, 64)  
  return buildClimbingArtwork(8, blockNumber, hash, true, true, base64BlockNumberArray, true)
}




function buildBench(x: number, y: number, z: number, zRotationDegrees: number, color: string) {
  return buildBenchWithColor3(x, y, z, zRotationDegrees, Color3.FromHexString(color))
}

function buildBenchWithColor3(x: number, y: number, z: number, zRotationDegrees: number, color: Color3) {

  // specs for benches
  let benchLength = 4
  let legHeight = 0.6
  let legWidth = 0.05
  let sittingWidth = 1
  let sittingHeight = 0.1
  let backWidth = 0.1
  let backHeight = 0.6

  // material for benches
  let benchMaterial = new Material()
  benchMaterial.albedoColor = color

  // build the bench entity itself
  let bench = new Entity()

  // build the sitting surface
  let sittingSurface = new Entity()
  sittingSurface.addComponent(benchMaterial)
  sittingSurface.addComponent(new BoxShape())
  sittingSurface.addComponent(new Transform({
    scale: new Vector3(sittingWidth, sittingHeight, benchLength),
    position: new Vector3(0, legHeight + sittingHeight/2.0, 0)
  }))
  sittingSurface.setParent(bench)

  // southwest leg
  let swLeg = new Entity()
  swLeg.addComponent(benchMaterial)
  swLeg.addComponent(new BoxShape())
  swLeg.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(-sittingWidth/2.0 + legWidth/2.0, legHeight/2.0, -benchLength/2.0 + legWidth/2.0)
  }))
  swLeg.setParent(bench)

  // southeast leg
  let seLeg = new Entity()
  seLeg.addComponent(benchMaterial)    
  seLeg.addComponent(new BoxShape())
  seLeg.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(+sittingWidth/2.0 - legWidth/2.0, legHeight/2.0, -benchLength/2.0 + legWidth/2.0)
  }))
  seLeg.setParent(bench)

  // northwest leg
  let nwLeg = new Entity()
  nwLeg.addComponent(benchMaterial)    
  nwLeg.addComponent(new BoxShape())  
  nwLeg.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(-sittingWidth/2.0 + legWidth/2.0, legHeight/2.0, +benchLength/2.0 - legWidth/2.0)
  }))
  nwLeg.setParent(bench)

  // northeast leg
  let neLeg = new Entity()
  neLeg.addComponent(benchMaterial)        
  neLeg.addComponent(new BoxShape())
  neLeg.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(+sittingWidth/2.0 - legWidth/2.0, legHeight/2.0, +benchLength/2.0 - legWidth/2.0)
  }))
  neLeg.setParent(bench)

  // back support
  let backSupport = new Entity()
  backSupport.addComponent(benchMaterial)
  backSupport.addComponent(new BoxShape())
  backSupport.addComponent(new Transform({
    scale: new Vector3(backWidth, backHeight, benchLength),
    position: new Vector3(-sittingWidth/2.0 + backWidth/2.0, legHeight + sittingHeight + backHeight/2.0, 0)
  }))
  backSupport.setParent(bench)

  // move bench to position
  bench.addComponent(new Transform({
    position: new Vector3(x, y, z),
    rotation: Quaternion.Euler(0, zRotationDegrees, 0)
  }))

  return bench
}

function buildPath(pathWidth: number, pathHeight: number, pathLength: number, x: number, y: number, z: number, zRotationDegrees: number, color: string, legend?: string, description?: string[]) {
  return buildPathWithColor3(pathWidth, pathHeight, pathLength, x, y, z, zRotationDegrees, Color3.FromHexString(color), legend, description)
}

function buildPathWithColor3(pathWidth: number, pathHeight: number, pathLength: number, x: number, y: number, z: number, zRotationDegrees: number, color: Color3, legend?: string, description?: string[]) {

  // specs for path
  let xRotationDegrees = 90

  // material for paths
  let pathMaterial = new Material()
  pathMaterial.albedoColor = color
  pathMaterial.hasAlpha = true

  // west path goes from south to north
  let path = new Entity()
  path.addComponent(new BoxShape())
  path.addComponent(pathMaterial)
  path.addComponent(new Transform({
    position: new Vector3(x, y, z),
    rotation: Quaternion.Euler(xRotationDegrees, 0, zRotationDegrees),
    scale: new Vector3(pathWidth, pathLength, pathHeight)
  }))

  // if legend provided, add the text to the path
  if(legend !== undefined) {
    let text = legend + "\n"

    
      text += "\n" + "The infamous theDAO contract was"
    
      text += "\n" + "deployed at"
    
      text += "\n" + "theDAO.aetheriablockmuseum.eth on April"
    
      text += "\n" + "30th 2016 and stayed unharmed for about"
    
      text += "\n" + "1.5 months until attackers started"
    
      text += "\n" + "draining the funds. The contract itself"
    
      text += "\n" + "was meant to handle multiple functions"
    
      text += "\n" + "of theDAO including running the presale"
    
      text += "\n" + "and the governance functionality"
    
      text += "\n" + "(DAOInterface) such as newProposal()."
    
      text += "\n" + "The contract also implemented the"
    
      text += "\n" + "ERC-20 interface which had first been"
    
      text += "\n" + "proposed in November of the previous"
    
      text += "\n" + "year."
    
      text += "\n" + ""
    
      text += "\n" + "The presale started as soon as the"
    
      text += "\n" + "contract was deployed and it was"
    
      text += "\n" + "handled by calling the default function"
    
      text += "\n" + "(also known as fallback function). This"
    
      text += "\n" + "function is called when a transaction"
    
      text += "\n" + "is sent to an address with nothing in"
    
      text += "\n" + "its data field (interaction with smart"
    
      text += "\n" + "contract typically happens with that"
    
      text += "\n" + "field).  For 28 days, participants sent"
    
      text += "\n" + "Ether to that address, and received"
    
      text += "\n" + "theDAO tokens in exchange. By the end"
    
      text += "\n" + "of the sale, about 14% of the total ETH"
    
      text += "\n" + "supply was held in custody by that"
    
      text += "\n" + "contract. By the end of May, a paper"
    
      text += "\n" + "was published to highlight"
    
      text += "\n" + "vulnerabilities; meanwhile 3 weeks"
    
      text += "\n" + "later, the ether raised from the"
    
      text += "\n" + "presale started being drained away."
    
    
    let legendTextEntity = new Entity()

    let legendText = new TextShape(text)
    legendText.fontSize = 1
    legendText.color = Color3.White()
    // fontFamily is on the docs but ECS reports property doesn't exist
    // legendText.fontFamily = "Arial, Helvetica, sans-serif"
    // legendText.resizeToFit = true
    // legendText.vTextAlign = "top";
    // legendText.width = 40
    // legendText.height = pathHeight * 0.5 * 0.8
    // legendText.textWrapping = true
    // legendText.lineCount = 5
    legendTextEntity.addComponent(legendText)
    legendTextEntity.addComponent(new Transform({
      // scale: new Vecor3(2, 2, 8)
      // position: new Vector3(x, 2, z)
      position: new Vector3(x, tileHeight + 0.01, z),
      rotation: Quaternion.Euler(xRotationDegrees, 0, zRotationDegrees)
    }))
    engine.addEntity(legendTextEntity)
  }  

  return path
}

function buildTree(x: number, y: number, z: number) {
  
  let tree = new Entity()
  tree.addComponent(new GLTFShape("models/RiggedSimple.gltf"))
  tree.addComponent(new Transform({ 
      position: new Vector3(x, y, z), 
      scale: new Vector3(0.1, 0.1, 0.1)
      }))

  return tree
}

function buildGrassyArea(width: number, height: number, length: number, x: number, y: number, z: number) {

  // material for grass
  let material = new Material()
  // material.albedoColor = Color3.Green()
  // material.hasAlpha = false

  // Create texture
  const myTexture = new Texture("materials/GrassGreenTexture0003.jpg")
  material.albedoTexture = myTexture


  let grass = new Entity()
  grass.addComponent(new BoxShape())
  grass.addComponent(material)
  grass.addComponent(new Transform({
    position: new Vector3(x, y, z),
    scale: new Vector3(width, height, length)
  }))

  return grass
}

function buildCenterFlooring(width: number, height: number, length: number, x: number, y: number, z: number) {

  // material for center flooring
  let material = new Material()
  // material.albedoColor = Color3.FromHexString('#a0a0a0')
  // material.hasAlpha = false

  // Create texture
  const myTexture = new Texture("materials/marble.jpg")
  material.albedoTexture = myTexture

  let floor = new Entity()
  floor.addComponent(new BoxShape())
  floor.addComponent(material)
  floor.addComponent(new Transform({
    position: new Vector3(x, y, z),
    scale: new Vector3(width, height, length)
  }))

  return floor  
}




// engine.addEntity(buildTree(1, 0.5, 1))  

// engine.addEntity(buildTree(5, 0.5, 1))  

// engine.addEntity(buildTree(1, 0.5, 5))  

// engine.addEntity(buildTree(1, 0.5, 15))  

// engine.addEntity(buildTree(1, 0.5, 11))  

// engine.addEntity(buildTree(5, 0.5, 15))  

// engine.addEntity(buildTree(15, 0.5, 15))  

// engine.addEntity(buildTree(11, 0.5, 15))  

// engine.addEntity(buildTree(15, 0.5, 11))  

// engine.addEntity(buildTree(15, 0.5, 1))  

// engine.addEntity(buildTree(15, 0.5, 5))  

// engine.addEntity(buildTree(11, 0.5, 1))  


buildArtwork(12, 1428757, '17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59')


  engine.addEntity(buildGrassyArea(2, 0.05, 2, 1, 0.025, 1))

  engine.addEntity(buildGrassyArea(2, 0.05, 8, 1, 0.025, 8))

  engine.addEntity(buildGrassyArea(2, 0.05, 2, 1, 0.025, 15))

  engine.addEntity(buildGrassyArea(8, 0.05, 2, 8, 0.025, 15))

  engine.addEntity(buildGrassyArea(2, 0.05, 2, 15, 0.025, 15))

  engine.addEntity(buildGrassyArea(2, 0.05, 8, 15, 0.025, 8))

  engine.addEntity(buildGrassyArea(2, 0.05, 2, 15, 0.025, 1))

  engine.addEntity(buildGrassyArea(8, 0.05, 2, 8, 0.025, 1))


engine.addEntity(buildCenterFlooring(8, 0.05, 8, 8, 0.05 / 2.0, 8))