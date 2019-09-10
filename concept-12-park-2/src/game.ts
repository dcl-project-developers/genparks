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
const uCanvas = new UICanvas() 
const uText = new UIText(uCanvas)
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
  console.log('build step decorator', x, y, z, stepNumber, index, movement)

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

      console.log("sphere clicked entering event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

      // set timer start if not yet set
      if(!timerStart) {
        timerStart = Date.now()
      }

      puzzleAccumulatedTotal = stepNumber * Math.pow(64, puzzleAccumulatedClicks) + puzzleAccumulatedTotal
      puzzleAccumulatedClicks = puzzleAccumulatedClicks + 1        

      console.log("sphere calculated event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

      // check for win / loss
      if(puzzleAccumulatedTotal > blockNumber) {
        puzzleAccumulatedTotal = 0
        puzzleAccumulatedClicks = 0
        uText.value = 'Game over, restarting puzzle! (' + puzzleAccumulatedTotal + ')'  
        timerStart = null
      } else {
        if(puzzleAccumulatedTotal === blockNumber) {
          let timeElapsedInMilliseconds = Date.now() - timerStart
          uText.value = 'Congratulations. You\'ve solved the puzzle! (' + puzzleAccumulatedTotal + ') in ' + (timeElapsedInMilliseconds / 1000.0).toFixed(2) + ' seconds. Go again?'
          puzzleAccumulatedTotal = 0 
          puzzleAccumulatedClicks = 0   
          showNft()
          timerStart = nil
        } else {
          if(puzzleAccumulatedTotal < blockNumber) {
            uText.value = 'Hmm... keep going... (' + puzzleAccumulatedTotal + ')'
          }        
        }
      }

      console.log("sphere clicked exiting event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", stepNumber)

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
  // parks 9 through 17 are red-ish with a little blue and increasingly green with height
  if(parkNumber >= 9 && parkNumber <= 16) {
    parkRed = (parkNumber - 8) / 8.0
    stepRed = (stepDecimal + 1) / 16.0

    parkBlue = 0
    stepBlue = ((stepDecimal + 1) / 16.0) / 2.0

    parkGreen = 0
    stepGreen = stepNumber / 64.0

    
  }
  // parks 18 through 24 are green-ish with a little red and increasingly blue with height
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
    stepGreen = stepNumber / 64.0 * 1.5
    parkBlue = 0
    stepBlue = stepNumber / 64.0 * 1.5
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
  return buildClimbingArtwork(2, blockNumber, hash, true, true, base64BlockNumberArray, true)
}




function buildBench(x: number, y: number, z: number, zRotationDegrees: number, color: string) {

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
  benchMaterial.albedoColor = Color3.FromHexString(color)

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

function buildPath(x: number, y: number, z: number, zRotationDegrees: number, color: string, legend?: string) {

  // specs for path
  let pathWidth = 2
  let pathLength = 16
  let pathHeight = 1
  let xRorationDegrees = 90

  // material for paths
  let pathMaterial = new Material()
  pathMaterial.albedoColor = Color3.FromHexString(color)

  // west path goes from south to north
  let path = new Entity()
  path.addComponent(new PlaneShape())
  path.addComponent(pathMaterial)
  path.addComponent(new Transform({
    position: new Vector3(x, y, z),
    rotation: Quaternion.Euler(xRorationDegrees, 0, zRotationDegrees),
    scale: new Vector3(pathWidth, pathLength, pathHeight)
  }))

  // if legend provided, add the text to the path
  if(legend !== undefined) {
    let legendTextEntity = new Entity()
    let legendText = new TextShape(legend)
    legendText.fontSize = 1
    legendText.color = Color3.White()
    // legendText.fontFamily = "Arial, Helvetica, sans-serif"
    legendTextEntity.addComponent(legendText)
    legendTextEntity.addComponent(new Transform({
      scale: new Vector3(0.5, 0.5, 0.5)
    }))
    legendTextEntity.setParent(path)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#80E060', 'The Ethereum Frontier'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#4040C0'))





  engine.addEntity(buildPath(13, 0, 8, 180, '#A0E0C0'))





  engine.addEntity(buildPath(8, 0, 3, 270, '#602060'))






engine.addEntity(buildBench(1, 0, 8, 0, '#A020C0'))



engine.addEntity(buildBench(8, 0, 15, 90, '#2060E0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#C040E0'))



engine.addEntity(buildBench(8, 0, 1, 270, '#60A080'))





engine.addEntity(buildTree(1, 0.5, 1))  



engine.addEntity(buildTree(5, 0.5, 1))  



engine.addEntity(buildTree(1, 0.5, 5))  



engine.addEntity(buildTree(1, 0.5, 15))  



engine.addEntity(buildTree(1, 0.5, 11))  



engine.addEntity(buildTree(5, 0.5, 15))  



engine.addEntity(buildTree(15, 0.5, 15))  



engine.addEntity(buildTree(11, 0.5, 15))  



engine.addEntity(buildTree(15, 0.5, 11))  



engine.addEntity(buildTree(15, 0.5, 1))  



engine.addEntity(buildTree(15, 0.5, 5))  



engine.addEntity(buildTree(11, 0.5, 1))  



buildArtwork(12, 1, '88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6')