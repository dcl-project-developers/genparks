/// ---- CUBES ----
// Concept: use cubes to represent each of the 64 hex digits in the hash
// Unused: block number
// the hex digit value itself is used for height
function buildCube(cubeNumber, cubeHexDigit) {

  const xBase = 4
  const zBase = 4

  console.log('Cube number', cubeNumber, 'Cube hex: ', cubeHexDigit)

  // calculate y1 (height)
  cubeDecimal = parseInt('0x' + cubeHexDigit, 16)
  let height = (cubeDecimal + 1)/ 16.0 // hex digit translated to [1/16, 1]
  
  console.log('height', height, 'decimal', cubeDecimal)

  const width = 1
  const length = 1
  
  // calculate color
  let colorHex = '#' + cubeHexDigit + '0' + cubeHexDigit + '0' + cubeHexDigit + '0'
  console.log('Color: ', colorHex)

  // add the color
  let cubeMaterial = new Material()
  cubeMaterial.hasAlpha = true
  cubeMaterial.albedoColor = Color3.FromHexString(colorHex)

  // add the cube
  let cube = new Entity()
  cube.addComponent(cubeMaterial)
  cube.addComponent(new BoxShape())
  cube.addComponent(new Transform({
    scale: new Vector3(width, height, length),
    position: new Vector3(xBase + (width * cubeNumber % 8) + width / 2.0, height / 2.0, zBase + (length * Math.floor(cubeNumber / 8)) + length / 2.0)
  }))

  // render the building
  engine.addEntity(cube)
}

function buildCubesArtwork(blockNumber: number, hash: string) {
  for(i = 0; i < 64; i++) {
    buildCube(i, hash[i])
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

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  if(conceptNumber == 1) {
    return buildBuildingsArtwork(blockNumber, hash)
  }
  if(conceptNumber == 2) {
    return buildCubesArtwork(blockNumber, hash)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#C0A020', 'theDAO is drained'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#C020A0')





  engine.addEntity(buildPath(13, 0, 8, 180, '#40E0E0')





  engine.addEntity(buildPath(8, 0, 3, 270, '#402020')






engine.addEntity(buildBench(1, 0, 8, 0, '#E080E0'))



engine.addEntity(buildBench(8, 0, 15, 90, '#8040A0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#602060'))



engine.addEntity(buildBench(8, 0, 1, 270, '#A080E0'))





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



buildArtwork(1, 1718497, 'caaa13ce099342d5e1342b04d588d7733093591666af8ef756ce20cf13d16475')
