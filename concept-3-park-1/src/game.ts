/// ---- CUBES ----
// Concept: use cubes to represent each of the 64 hex digits in the hash
// the hex digit value itself is used for height
// the blockNumber is represented in base 64 to decorate the cubes

// the puzzle version of CUBES is concept #3 - adds different coloring and cube click event handling with puzzle accounting
let puzzleAccumulatedTotal = 0
let puzzleAccumulatedClicks = 0

// Create UI canvas and text
const uCanvas = new UICanvas() 
const uText = new UIText(uCanvas)

function buildCubeDecorator(xBase, zBase, cubeWidth, cubeLength, cubeHeight, cubeNumber, index) {
  // decorator color
  const decoratorColors = ['#ffffa0', '#ffa0ff', '#a0ffff', '#ffa0a0', '#a0ffc0', '#a0a0ff', '#a0a0a0']
  let decoratorColorHex = decoratorColors[index % (decoratorColors.length - 1)]
  let decoratorMaterial = new Material()
  decoratorMaterial.hasAlpha = true
  decoratorMaterial.albedoColor = Color3.FromHexString(decoratorColorHex)

  let decoratorCube = new Entity()
  let decoratorCubeWidth = cubeWidth / Math.pow(2, (index + 1))
  let decoratorCubeLength = cubeLength / Math.pow(2, (index + 1))
  let decoratorCubeHeight = (1/8) * Math.pow(2, (index + 1))
  decoratorCube.addComponent(decoratorMaterial)
  decoratorCube.addComponent(new BoxShape())
  decoratorCube.addComponent(new Transform({
    scale: new Vector3(decoratorCubeWidth, decoratorCubeHeight, decoratorCubeLength),
    position: new Vector3(
      xBase + (cubeWidth * cubeNumber % 8) + cubeWidth / 2.0, 
      cubeHeight + decoratorCubeHeight / 2.0, 
      zBase + (cubeLength * Math.floor(cubeNumber / 8)) + cubeLength / 2.0)
  }))
  console.log('===== cube decorator for index ', index, 'color', decoratorColorHex, 'cubeNumber', cubeNumber, 'decoratorCubeWidth', decoratorCubeWidth, 'decoratorCubeLength', decoratorCubeLength, 'decoratorCubeHeight', decoratorCubeHeight)          
  engine.addEntity(decoratorCube)
}

function buildCube(blockNumber, base64BlockNumberArray, cubeNumber, cubeHexDigit, puzzleMode) {

  const xBase = 4
  const zBase = 4

  // console.log('Cube number', cubeNumber, 'Cube hex: ', cubeHexDigit)

  // calculate y1 (height)
  cubeDecimal = parseInt('0x' + cubeHexDigit, 16)
  let height = (cubeDecimal + 1)/ 16.0 // hex digit translated to [1/16, 1]
  
  // console.log('height', height, 'decimal', cubeDecimal)

  const width = 1
  const length = 1
  
  // calculate color
  let colorHex = '#' + cubeHexDigit + '0' + cubeHexDigit + '0' + cubeHexDigit + '0'

  // override that for puzzle mode for quick differentiation
  if(puzzleMode) {
    colorHex = '#' + cubeHexDigit + '0' + cubeHexDigit + '0' + 'e' + '0'
  }

  // console.log('Color: ', colorHex)

  // add the color
  let cubeMaterial = new Material()
  cubeMaterial.hasAlpha = true
  cubeMaterial.albedoColor = Color3.FromHexString(colorHex)

  // add the cube
  let margin = 0.1
  let cube = new Entity()
  cube.addComponent(cubeMaterial)
  cube.addComponent(new BoxShape())
  cube.addComponent(new Transform({
    scale: new Vector3(width - margin, height, length - margin),
    position: new Vector3(
      xBase + (width * cubeNumber % 8) + width / 2.0, 
      height / 2.0, 
      zBase + (length * Math.floor(cubeNumber / 8)) + length / 2.0)
  }))

  // handle click event for cubes if we are on puzzle mode
  if(puzzleMode) {
    cube.addComponent(
      new OnClick(e => {

        console.log("cube clicked entering event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

        puzzleAccumulatedTotal = cubeNumber * Math.pow(64, puzzleAccumulatedClicks) + puzzleAccumulatedTotal
        puzzleAccumulatedClicks = puzzleAccumulatedClicks + 1        

        console.log("cube calculated event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

        // check for win / loss
        if(puzzleAccumulatedTotal > blockNumber) {
          puzzleAccumulatedTotal = 0
          puzzleAccumulatedClicks = 0
          uText.value = 'Game over, restarting puzzle! (' + puzzleAccumulatedTotal + ')'  
        } else {
          if(puzzleAccumulatedTotal === blockNumber) {
            uText.value = 'Congratulations. You\'ve solved the puzzle! (' + puzzleAccumulatedTotal + '). Go again?'
            puzzleAccumulatedTotal = 0 
            puzzleAccumulatedClicks = 0   
          } else {
            if(puzzleAccumulatedTotal < blockNumber) {
              uText.value = 'Hmm... keep going... (' + puzzleAccumulatedTotal + ')'
            }        
          }
        }

        console.log("cube clicked exiting event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

      })
    )
  }

  // render the cube
  engine.addEntity(cube)

  // add a decoration if cube number belongs to the base 64 representation of blockNumber
  for(index = 0; index < base64BlockNumberArray.length; index++)
    if(base64BlockNumberArray[index] === cubeNumber)
      buildCubeDecorator(xBase, zBase, width, length, height, cubeNumber, index)
    }
  }  
}

function buildCubesArtwork(blockNumber: number, base64BlockNumberArray: array, hash: string) {
  for(i = 0; i < 64; i++) {
    buildCube(blockNumber, base64BlockNumberArray, i, hash[i], false)
  }
}

function buildCubesPuzzleArtwork(blockNumber: number, base64BlockNumberArray: array, hash: string) {
  for(i = 0; i < 64; i++) {
    buildCube(blockNumber, base64BlockNumberArray, i, hash[i], true)
  }
}

/// ---- BUILDINGS ----
// Concept: use hash to build 8 buildings
// Unused: block number
// Each 64 hex digits (32 bytes) gets equally divided into 8 hex digits strings, each representing a building
// each building is codified as:
// x1, x2, z1, z2, y1, r, g, b (each of these being a hex digit)
// where (x1, x2) are x start and end coordinates
// (z1, z2) are z start and end coodrinates
// y1 is the height of the building
// r g b builds a color (4,096 total possible colors)

function buildBuilding(buildingHex) {

  const xBase = 4
  const zBase = 4

  console.log('Building hex: ', buildingHex)

  // calculate x1 and x2
  let x1 = parseInt('0x' + buildingHex.substring(0, 1), 16) / 2.0 // 1st hex digit translated to [0, 7.5]
  let x2 = parseInt('0x' + buildingHex.substring(1, 2), 16) / 2.0 + 0.5 // 2nd hex digit translated to [0.5, 8]

  // calculate z1 and z2
  let z1 = parseInt('0x' + buildingHex.substring(2, 3), 16) / 2.0 // 3rd hex digit translated to [0, 7]
  let z2 = parseInt('0x' + buildingHex.substring(3, 4), 16) / 2.0 + 0.5 // 4th hex digit translated to [0.5, 8]

  // calculate y1 (height)
  let y1 = (parseInt('0x' + buildingHex.substring(4, 5), 16) + 1)/ 8.0 // 5th hex digit translated to [1/16, 2]

  console.log('Coordinates: x1', x1, 'x2', x2, 'z1', z1, 'z2', z2, 'y1', y1)

  // calulate width, height, and length
  let width = Math.max(1, Math.abs(x1 - x2))
  let height = y1
  let length = Math.max(1, Math.abs(z1 - z2))

  // calculate xStart and zStart
  let xStart = Math.min(x1, x2)
  let zStart = Math.min(z1, z2)

  console.log('Dimensions: width', width, 'height', height, 'length', length)
  console.log('X start', xStart, 'Z start', zStart)

  // calculate color
  let colorHex = '#' + buildingHex.substring(5,6) + '0' + buildingHex.substring(6,7) + '0' + buildingHex.substring(7,8) + '0'
  console.log('Color: ', colorHex)

  // add the color
  let buildingMaterial = new Material()
  buildingMaterial.hasAlpha = true
  buildingMaterial.albedoColor = Color3.FromHexString(colorHex)

  // add the cube
  let building = new Entity()
  building.addComponent(buildingMaterial)
  building.addComponent(new BoxShape())
  building.addComponent(new Transform({
    scale: new Vector3(width, height, length),
    position: new Vector3(xBase + xStart + width / 2.0, height / 2.0, zBase + zStart + length / 2.0)
  }))

  // render the building
  engine.addEntity(building)
}

function buildBuildingsArtwork(blockNumber: number, hash: string) {
  for(i = 0; i < 8; i++) {
    buildBuilding(hash.substring(i * 8, (i + 1) * 8))
  }
}


// ---- PARK With Artwork ----

function toBaseArray(value, base) {

  console.log('To base array:', value, base)

  let resultArr = []
  do {
    let mod = value % base
    resultArr.push(mod)
    value = Math.floor(value / 64)
  } while(value > 0)

  console.log('To base array result:', resultArr)

  return resultArr
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {

  console.log('concept', conceptNumber, 'blockNumber': blockNumber)

  if(conceptNumber == 1) {
    return buildBuildingsArtwork(blockNumber, hash)
  }
  if(conceptNumber == 2) {
    let base64BlockNumberArray = toBaseArray(blockNumber, 64)
    return buildCubesArtwork(blockNumber, base64BlockNumberArray, hash)
  }
  if(conceptNumber == 3) {
    let base64BlockNumberArray = toBaseArray(blockNumber, 64)
    console.log('base64BlockNumberArray', base64BlockNumberArray)
    return buildCubesPuzzleArtwork(blockNumber, base64BlockNumberArray, hash)
  }  
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
    position: new Vector3(x, y, z)
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
    legendText.fontFamily = "Arial, Helvetica, sans-serif"
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#E0E060', 'The Genesis'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#40E080')





  engine.addEntity(buildPath(13, 0, 8, 180, '#A0E0C0')





  engine.addEntity(buildPath(8, 0, 3, 270, '#20C060')






engine.addEntity(buildBench(1, 0, 8, 0, '#40E0E0'))



engine.addEntity(buildBench(8, 0, 15, 90, '#6040A0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#20E0A0'))



engine.addEntity(buildBench(8, 0, 1, 270, '#6040E0'))





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



buildArtwork(3, 0, 'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3')
