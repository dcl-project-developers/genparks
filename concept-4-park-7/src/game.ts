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
/// ---- PLANETS ----
// Concept: use planets to represent 8 subsequent substrings of 8 hex characters each from the 64 hex digits hash
// the first 6 hex digits of planetHex are used for the color
// the 7th digit is used for radio
// the blockNumber is represented in base 64 to decorate ... the planets?

function buildPlanet(blockNumber, base64BlockNumberArray, planetNumber, planetHex) {

  const xBase = 4
  const zBase = 4

  console.log('Planet number', planetNumber, 'Planet hex: ', planetHex)

  const width = 8 / 16.0
  const length = 8 / 16.0

  // use 7th digit for radio  
  let radioDecimal = parseInt('0x' + planetHex[6])
  console.log('Radio decimal', radioDecimal, 'hex digit', planetHex[6])
  const radio = 0.15 + (radioDecimal - 8) / 8.0 * 0.1    // map the [0,15] to radioDecimal

  // calculate color
  let colorHex = '#' + planetHex.substring(0, 6)
  console.log('Color: ', colorHex)

  // add the color
  let planetMaterial = new Material()
  planetMaterial.hasAlpha = true

  // set a bunch of other material properties all from [0.5, 1], e.g.:
  // emissiveColor: The color emitted from the material.
  // ambientColor: AKA Diffuse Color in other nomenclature.
  // reflectionColor: The color reflected from the material.
  // reflectivityColor: AKA Specular Color in other nomenclature.

  planetMaterial.metalic = 0.5 + parseInt('0x' + planetHex[0]) / 15.0/2
  planetMaterial.roughness = 0.5 + parseInt('0x' + planetHex[1]) / 15.0/2
  planetMaterial.emissiveColor = 0.5 + parseInt('0x' + planetHex[2]) / 15.0/2
  planetMaterial.ambientColor = 0.5 + parseInt('0x' + planetHex[3]) / 15.0/2
  planetMaterial.reflectionColor = 0.5 + parseInt('0x' + planetHex[4]) / 15.0/2
  planetMaterial.reflectivityColor = 0.5 + parseInt('0x' + planetHex[5]) / 15.0/2
  planetMaterial.albedoColor = Color3.FromHexString(colorHex)


  // add the planet
  let planetXCenter = xBase + (width * planetNumber) + width / 2.0
  let planetYCenter = 1.5
  let planetZCenter = zBase + 4

  // the orbit radio
  let orbitRadio = 8 - planetXCenter

  // use 8th digit for the angle (where in a circular orbit the planet is at)
  // whereas 0 points towards east, 90 degrees points north, 180 degrees points west, and 270 south
  // project the X and Z center based on angle
  let angleDecimal = parseInt('0x' + planetHex[7])  
  let angleRadians = angleDecimal * (2 * Math.PI) / 15.0 // map [0, 15] to [0, 2 * 3.14]
  let planetXCenter = 8 + orbitRadio * Math.cos(angleRadians)
  let planetZCenter = 8 + orbitRadio * Math.sin(angleRadians)

  let planet = new Entity()
  planet.addComponent(planetMaterial)
  planet.addComponent(new SphereShape())
  planet.addComponent(new Transform({
    scale: new Vector3(radio, radio, radio),
    position: new Vector3(
      planetXCenter, 
      planetYCenter, 
      planetZCenter)
  }))  

  // // add the orbit
  // let orbitMaterial = new Material()
  // orbitMaterial.hasAlpha = true
  // orbitMaterial.albedoColor = Color3.FromHexString('#a0a0a0')

  // let orbit = new Entity()
  // console.log('orbit radio', orbitRadio)
  // orbit.addComponent(orbitMaterial)
  // orbit.addComponent(new CircleShape())
  // orbit.addComponent(new Transform({
  //   scale: new Vector3(1, 1, 1),
  //   position: new Vector3(
  //     8, 
  //     4, 
  //     8),
  //   rotation: Quaternion.Euler(0, 0, 0),
  //   arc: 360,
  //   segments: 36
  // }))   
  
  // render the planet
  // engine.addEntity(planet)

  // render the orbit
  // engine.addEntity(orbit)

  // return the planet
  return planet
}

function buildPlanetsArtwork(blockNumber: number, base64BlockNumberArray: number[], hash: string) {
  console.log('build planets')

  // build planetary system
  let system = new Entity()

  // debug plane
  // let planeMaterial = new Material()
  // planeMaterial.hasAlpha = true
  // planeMaterial.albedoColor = Color3.FromHexString('#f0f0f0')
  // let plane = new Entity
  // plane.addComponent(new PlaneShape())
  // plane.addComponent(planeMaterial)
  // plane.addComponent(new Transform({
  //   position: new Vector3(8, 1.5, 8),
  //   rotation: Quaternion.Euler(90, 0, 90),
  //   scale: new Vector3(8, 8, 8)
  // }))
  // plane.setParent(system)

  for(let i = 0; i < 8; i++) {
    let substr = hash.substring(i * 8, (i + 1) * 8)
    console.log('hash', hash, 'substr', substr)
    let planet = buildPlanet(blockNumber, base64BlockNumberArray, i, substr)
    planet.setParent(system)
  }

  // use the block number to rotate the system
  // we modulo the blockNumber by 16 two times to derive the angle  
  let rotateAngleX = blockNumber % 16
  let reminder = Math.floor(blockNumber / 16)
  let rotateAngleY = reminder % 16
  reminder = Math.floor(blockNumber / 16)

  system.addComponent(new Transform({
    rotation: Quaternion.Euler(rotateAngleX, 0, rotateAngleY),
    scale: new Vector3(1, 1, 1)
  }))
  engine.addEntity(system)
}

function buildArtwork(conceptNumber: number, blockNumber: number, hash: string) {
  let base64BlockNumberArray = toBaseArray(blockNumber, 64)    
  return buildPlanetsArtwork(blockNumber, base64BlockNumberArray, hash)
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




  engine.addEntity(buildPath(3, 0, 8, 0, '#6040E0', 'Homestead Fork'))





  engine.addEntity(buildPath(8, 0, 13, 90, '#604080'))





  engine.addEntity(buildPath(13, 0, 8, 180, '#E0A0E0'))





  engine.addEntity(buildPath(8, 0, 3, 270, '#A02020'))






engine.addEntity(buildBench(1, 0, 8, 0, '#6040E0'))



engine.addEntity(buildBench(8, 0, 15, 90, '#4020E0'))



engine.addEntity(buildBench(15, 0, 8, 180, '#C0A040'))



engine.addEntity(buildBench(8, 0, 1, 270, '#C04020'))





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



buildArtwork(4, 1150000, '584bdb5d4e74fe97f5a5222b533fe1322fd0b6ad3eb03f02c3221984e2c0b430')
