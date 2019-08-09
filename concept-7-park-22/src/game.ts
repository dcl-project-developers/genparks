// ---- PARK With Artwork ----














/// ---- WAVE ----
// Concept: use cubes to build a 3D wave that shows the hash

function buildStep(blockNumber, stepNumber, previousStepHexDigit, stepHexDigit, currentHeight) {

  let artWidth = 8
  let margin = 0.005
  const xBase = 8
  const zBase = 8
  let lastStepWidth = 0.5
  let legWidth = 0.01
  let stepWidth = ((artWidth - lastStepWidth) / (64.0 * 2))

  let stepHeight = stepWidth
  
  let stepDecimal = parseInt('0x' + stepHexDigit, 16)
  let previousStepDecimal = parseInt('0x' + previousStepHexDigit, 16)

  console.log(
    'stepNumber', stepNumber, 
    'stepHexDigit', stepHexDigit, 
    'stepDecimal', stepDecimal, 
    'previousStepHexDigit', previousStepHexDigit, 
    'previousStepDecimal', previousStepDecimal, 
  )
  
  // calculate color
  let colorHex = '#' + stepHexDigit + '0' + stepHexDigit + '0' + stepHexDigit + '0'

  console.log('Color: ', colorHex)

  // add the color
  let stepMaterial = new Material()
  stepMaterial.hasAlpha = false
  stepMaterial.albedoColor = Color3.FromHexString(colorHex)

  let thisStepWidth = (64 - stepNumber) * stepWidth * 2

  // adjust height based on difference between current hash digit and previous hash digit
  if(stepDecimal > previousStepDecimal) {
    currentHeight = currentHeight + stepHeight * 3
  } else {
    if(stepDecimal < previousStepDecimal) {
      currentHeight = currentHeight - stepHeight * 3
    } 
  }
  

  // add the step
  let stepWest = new Entity()
  stepWest.addComponent(stepMaterial)
  stepWest.addComponent(new BoxShape())
  stepWest.addComponent(new Transform({
    scale: new Vector3(stepWidth - margin, stepHeight - margin, thisStepWidth + margin),
    position: new Vector3(
      xBase - thisStepWidth / 2.0 - stepWidth / 2.0, 
      currentHeight, 
      zBase
  }))
  engine.addEntity(stepWest)

  let stepNorth = new Entity()
  stepNorth.addComponent(stepMaterial)
  stepNorth.addComponent(new BoxShape())
  stepNorth.addComponent(new Transform({
    scale: new Vector3(thisStepWidth + stepWidth * 2.0 - margin, stepHeight - margin, stepWidth - margin),
    position: new Vector3(
      xBase, 
      currentHeight, 
      zBase + thisStepWidth / 2.0 + stepWidth / 2.0
  }))
  engine.addEntity(stepNorth)

  let stepEast = new Entity()
  stepEast.addComponent(stepMaterial)
  stepEast.addComponent(new BoxShape())
  stepEast.addComponent(new Transform({
    scale: new Vector3(stepWidth - margin, stepHeight - margin, thisStepWidth + margin),
    position: new Vector3(
      xBase + thisStepWidth / 2.0 + stepWidth / 2.0, 
      currentHeight, 
      zBase
  }))
  engine.addEntity(stepEast)

  let stepSouth = new Entity()
  stepSouth.addComponent(stepMaterial)
  stepSouth.addComponent(new BoxShape())
  stepSouth.addComponent(new Transform({
    scale: new Vector3(thisStepWidth + stepWidth * 2.0 - margin, stepHeight - margin, stepWidth - margin),
    position: new Vector3(
      xBase, 
      currentHeight, 
      zBase - thisStepWidth / 2.0 - stepWidth / 2.0
  }))
  engine.addEntity(stepSouth)

  // build the legs

  // add the color
  let legMaterial = new Material()
  legMaterial.hasAlpha = false
  legMaterial.metalic = 1
  legMaterial.roughness = 1
  legMaterial.emissiveColor = 1
  legMaterial.ambientColor = 1
  legMaterial.reflectionColor = 1
  legMaterial.albedoColor = Color3.FromHexString('#ffffff')


  let legHeight = currentHeight

  let legSouth = new Entity()
  legSouth.addComponent(legMaterial)
  legSouth.addComponent(new BoxShape())
  legSouth.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(
      xBase, 
      legHeight / 2.0, 
      zBase - thisStepWidth / 2.0 - stepWidth / 2.0
  }))
  engine.addEntity(legSouth)

  let legNorth = new Entity()
  legNorth.addComponent(legMaterial)
  legNorth.addComponent(new BoxShape())
  legNorth.addComponent(new Transform({
    scale: new Vector3(legWidth, legHeight, legWidth),
    position: new Vector3(
      xBase, 
      legHeight / 2.0, 
      zBase + thisStepWidth / 2.0 + stepWidth / 2.0
  }))
  engine.addEntity(legNorth)

  return currentHeight
}

function buildWaveArtwork(blockNumber: number, hash: string) {
  let currentHeight = 3 
  for(let i = 0; i < 64; i++) {
    let currentHash = hash[i]
    let previousHash = (i == 0 ? hash[63] : hash[i - 1])
    currentHeight = buildStep(blockNumber, i, previousHash, currentHash, currentHeight)
  }
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  return buildWaveArtwork(blockNumber, hash)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#804040', 'Parity Multisig Library Suicide'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#A02080'))





  engine.addEntity(buildPath(13, 0, 8, 180, '#20A020'))





  engine.addEntity(buildPath(8, 0, 3, 270, '#E0C0E0'))






engine.addEntity(buildBench(1, 0, 8, 0, '#C0C0A0'))



engine.addEntity(buildBench(8, 0, 15, 90, '#A080A0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#4020A0'))



engine.addEntity(buildBench(8, 0, 1, 270, '#A0E060'))





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



buildArtwork(7, 4501969, '894f3aac1c8a0c9b05d2cbe6c0c9af907ca44a1c96aeda69a0ec064b9a74b790')
