// ---- PARK With Artwork ----






function toBaseArray(value, base) {

  let resultArr = []
  do {
    let mod = value % base
    resultArr.push(mod)
    value = Math.floor(value / 64)
  } while(value > 0)

  return resultArr
}
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
  // console.log('===== cube decorator for index ', index, 'color', decoratorColorHex, 'cubeNumber', cubeNumber, 'decoratorCubeWidth', decoratorCubeWidth, 'decoratorCubeLength', decoratorCubeLength, 'decoratorCubeHeight', decoratorCubeHeight)          
  engine.addEntity(decoratorCube)
}

function buildCube(blockNumber, base64BlockNumberArray, cubeNumber, cubeHexDigit, puzzleMode) {

  const xBase = 4
  const zBase = 4

  // console.log('Cube number', cubeNumber, 'Cube hex: ', cubeHexDigit)

  // calculate y1 (height)
  let cubeDecimal = parseInt('0x' + cubeHexDigit, 16)
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

        // console.log("cube clicked entering event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

        puzzleAccumulatedTotal = cubeNumber * Math.pow(64, puzzleAccumulatedClicks) + puzzleAccumulatedTotal
        puzzleAccumulatedClicks = puzzleAccumulatedClicks + 1        

        // console.log("cube calculated event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

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

        // console.log("cube clicked exiting event", puzzleAccumulatedClicks, "total", puzzleAccumulatedTotal, "number", cubeNumber)

      })
    )
  }

  // render the cube
  engine.addEntity(cube)

  // add a decoration if cube number belongs to the base 64 representation of blockNumber
  for(let index = 0; index < base64BlockNumberArray.length; index++) {
    if(base64BlockNumberArray[index] === cubeNumber) {
      buildCubeDecorator(xBase, zBase, width, length, height, cubeNumber, index)
    }
  }  
}

function buildCubesArtwork(blockNumber: number, base64BlockNumberArray: number[], hash: string) {
  for(let i = 0; i < 64; i++) {
    buildCube(blockNumber, base64BlockNumberArray, i, hash[i], false)
  }
}

function buildCubesPuzzleArtwork(blockNumber: number, base64BlockNumberArray: number[], hash: string) {
  for(let i = 0; i < 64; i++) {
    buildCube(blockNumber, base64BlockNumberArray, i, hash[i], true)
  }
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  let base64BlockNumberArray = toBaseArray(blockNumber, 64)
  return buildCubesPuzzleArtwork(blockNumber, base64BlockNumberArray, hash)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#20E0A0', 'theDAO is deployed'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#60E0A0'))





  engine.addEntity(buildPath(13, 0, 8, 180, '#A020C0'))





  engine.addEntity(buildPath(8, 0, 3, 270, '#6040E0'))






engine.addEntity(buildBench(1, 0, 8, 0, '#606020'))



engine.addEntity(buildBench(8, 0, 15, 90, '#208020'))



engine.addEntity(buildBench(15, 0, 8, 180, '#E0E080'))



engine.addEntity(buildBench(8, 0, 1, 270, '#E040A0'))





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



buildArtwork(3, 1428757, '17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59')
