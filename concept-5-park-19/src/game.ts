// ---- PARK With Artwork ----










/// ---- PYRAMID ----
// Concept: use cubes to build ...

function buildStep(blockNumber, stepNumber, stepHexDigit) {

  let artWidth = 8
  const xBase = 8
  const zBase = 8
  let topStepWidth = 0.5
  let stepWidth = (artWidth - topStepWidth) / 64.0

  console.log('Step number', stepNumber, 'Step hex: ', stepHexDigit)

  let stepDecimal = parseInt('0x' + stepHexDigit, 16)
  
  let stepHeight = 0.15
  // let stepHeight = (stepDecimal + 1)/ 32.0 // hex digit translated to [1/32, 0.5]

  console.log('stepHeight', stepHeight, 'decimal', stepDecimal)
  
  // calculate color
  let colorHex = '#' + stepHexDigit + '0' + stepHexDigit + '0' + stepHexDigit + '0'

  console.log('Color: ', colorHex)

  // add the color
  let stepMaterial = new Material()
  stepMaterial.hasAlpha = true
  stepMaterial.albedoColor = Color3.FromHexString(colorHex)

  // add the step
  let step = new Entity()
  step.addComponent(stepMaterial)
  step.addComponent(new BoxShape())
  step.addComponent(new Transform({
    scale: new Vector3((64 - stepNumber) * stepWidth, stepHeight, (64 - stepNumber) * stepWidth),
    position: new Vector3(
      xBase, 
      stepHeight * stepNumber + stepHeight / 2.0, 
      zBase
  }))

  // render the cube
  engine.addEntity(step)

}

function buildPyramidArtwork(blockNumber: number, hash: string) {
  for(let i = 0; i < 64; i++) {
    buildStep(blockNumber, i, hash[i])
  }
}


function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  return buildPyramidArtwork(blockNumber, hash)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#20A0A0', 'The Terraform Event'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#E04080'))





  engine.addEntity(buildPath(13, 0, 8, 180, '#2060A0'))





  engine.addEntity(buildPath(8, 0, 3, 270, '#E0C020'))






engine.addEntity(buildBench(1, 0, 8, 0, '#80E020'))



engine.addEntity(buildBench(8, 0, 15, 90, '#E0E0C0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#40A060'))



engine.addEntity(buildBench(8, 0, 1, 270, '#40C0E0'))





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



buildArtwork(5, 4321454, '0a989ad83a89295795f9cc128dd00be1e6b430a86137cce4bbf66c3f015fb0b7')
