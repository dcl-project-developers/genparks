// ---- PARK With Artwork ----
















/// ---- TEST NFT ARTWORK ----
/// ---- BASED ON PYRAMID ----
// Concept: add an nft to pyramid artwork

/// ---- PYRAMID ----
// Concept: use cubes to build ...

function buildStep(blockNumber, stepNumber, stepHexDigit, drawSubsteps) {

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
  stepMaterial.hasAlpha = false
  stepMaterial.albedoColor = Color3.FromHexString(colorHex)

  // add the step
  let step = new Entity()
  let thisStepWidth = (64 - stepNumber) * stepWidth
  step.addComponent(stepMaterial)
  step.addComponent(new BoxShape())
  step.addComponent(new Transform({
    scale: new Vector3(thisStepWidth, stepHeight, thisStepWidth),
    position: new Vector3(
      xBase, 
      stepHeight * stepNumber + stepHeight / 2.0, 
      zBase
  }))

  // render the cube
  engine.addEntity(step)

  if(drawSubsteps) {
    // add the sub-steps decorations
    let subStepHexDigit = stepHexDigit
    let subStepDecimal = parseInt('0x' + subStepHexDigit, 16)
    let subStepWidth = stepWidth / 2.0
    let subStepHeight = stepHeight / 2.0

    console.log('sub-step hex', subStepHexDigit, 'subStepWidth', subStepWidth, 'subStepHeight', subStepHeight, 'subStepDecimal', subStepDecimal)

    // calculate sub-step color as quick bit complement from color hex
    let subColorHex = colorHex

    console.log('sub-step color', subColorHex)

    // add the sub-steps color
    let subStepMaterial = new Material()
    subStepMaterial.hasAlpha = false
    subStepMaterial.albedoColor = Color3.FromHexString(subColorHex)

    // substeps start at the southwest corner and go clock-wise with up to 4 per side
    subStepDecimal = subStepDecimal + 1 // we want from 1-16 substeps not 0-15 substeps
    let margin = thisStepWidth / 8.0
    for(let i = 0; i < subStepDecimal; i++) {
      let baseDelta = thisStepWidth / 2.0 + subStepWidth / 2.0
      let subStep = new Entity()
      subStep.addComponent(subStepMaterial)
      subStep.addComponent(new BoxShape())
      // west 4
      if(i < 4) {
        let index = i
        let x = xBase - baseDelta
        let z = zBase - baseDelta + margin + (index + 0.5) * ((thisStepWidth - margin * 2)/4.0)
      } 
      // north 4
      if(i >= 4 && i < 8) {
        let index = i - 4
        let x = xBase - baseDelta + margin + (index + 0.5) * ((thisStepWidth - margin * 2)/4.0)
        let z = zBase + baseDelta
      }
      // east 4
      if(i >= 8 && i < 12) {
        let index = i - 8
        let x = xBase + baseDelta
        let z = zBase + baseDelta - margin - (index + 0.5) * ((thisStepWidth - margin * 2)/4.0)
      }    
      // south 4
      if(i >= 12 && i < 16) {
        let index = i - 12
        let x = xBase + baseDelta - margin - (index + 0.5) * ((thisStepWidth - margin * 2)/4.0)
        let z = zBase - baseDelta
      }        
      subStep.addComponent(new Transform({
        scale: new Vector3(subStepWidth, subStepHeight, subStepWidth),
        position: new Vector3(
          x, 
          stepHeight * stepNumber + stepHeight / 2.0, 
          z
      }))

      // render the sub step
      engine.addEntity(subStep)  

    }

  }
}

function buildPyramidArtwork(blockNumber: number, hash: string, drawSubsteps: boolean) {
  for(let i = 0; i < 64; i++) {
    buildStep(blockNumber, i, hash[i], drawSubsteps)
  }
}

function buildNftTestArtwork(blockNumber: number, hash: string) {
  let drawSubsteps = false
  buildPyramidArtwork(blockNumber, hash, drawSubsteps)

  // test the NFT feature
  // see: https://docs.decentraland.org/blockchain-interactions/display-a-certified-nft/
  const entity = new Entity()
  const shapeComponent = new NFTShape('ethereum://0x06012c8cf97BEaD5deAe237070F9587f8E7A266d/558536')
  entity.addComponent(shapeComponent)
  entity.addComponent(
    new Transform({
      position: new Vector3(3, 1.5, 3)
    })
  )
  engine.addEntity(entity)

  // test CryptoArte
  const entity2 = new Entity()
  const shapeComponent2 = new NFTShape('ethereum://0xbace7e22f06554339911a03b8e0ae28203da9598/7429')
  entity2.addComponent(shapeComponent2)
  entity2.addComponent(
    new Transform({
      position: new Vector3(5, 1.5, 3)
    })
  )
  engine.addEntity(entity2)

  return
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  return buildNftTestArtwork(blockNumber, hash, false)
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



buildArtwork(8, 1428757, '17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59')
