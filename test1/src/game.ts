function buildBench(x: number, y: number, z: number, zRotationDegrees: number) {

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
  benchMaterial.albedoColor = Color3.FromHexString('#f9e79f')

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

function buildPath(x: number, y: number, z: number, zRotationDegrees: number) {

  // specs for path
  let width = 2
  let length = 16
  let height = 1  // does PlaneShape transforms this into a point?
  let xRorationDegrees = 90

  // material for paths
  let pathMaterial = new Material()
  pathMaterial.albedoColor = Color3.FromHexString('#6e2c00')

  // west path goes from south to north
  let path = new Entity()
  path.addComponent(new PlaneShape())
  path.addComponent(pathMaterial)
  path.addComponent(new Transform({
    position: new Vector3(x, y, z),
    rotation: Quaternion.Euler(xRorationDegrees, 0, zRotationDegrees),
    scale: new Vector3(width, length, height)
  }))

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

let westPath = buildPath(3, 0, 8, 0)
engine.addEntity(westPath)

let northPath = buildPath(8, 0, 13, 90)
engine.addEntity(northPath)

let eastPath = buildPath(13, 0, 8, 180)
engine.addEntity(eastPath)

let southPath = buildPath(8, 0, 3, 270)
engine.addEntity(southPath)

let westBench = buildBench(1, 0, 8, 0)
engine.addEntity(westBench)

let northBench = buildBench(8, 0, 15, 90)
engine.addEntity(northBench)

let eastBench = buildBench(15, 0, 8, 180)
engine.addEntity(eastBench)

let southBench = buildBench(8, 0, 1, 270)
engine.addEntity(southBench)

let swTree = buildTree(1, 0.5, 1)
engine.addEntity(swTree)
let swnTree = buildTree(5, 0.5, 1)
engine.addEntity(swnTree)
let sweTree = buildTree(1, 0.5, 5)
engine.addEntity(sweTree)

let nwTree = buildTree(1, 0.5, 15)
engine.addEntity(nwTree)
let nwsTree = buildTree(1, 0.5, 11)
engine.addEntity(nwsTree)
let nweTree = buildTree(5, 0.5, 15)
engine.addEntity(nweTree)

let neTree = buildTree(15, 0.5, 15)
engine.addEntity(neTree)
let newTree = buildTree(11, 0.5, 15)
engine.addEntity(newTree)
let nesTree = buildTree(15, 0.5, 11)
engine.addEntity(nesTree)

let seTree = buildTree(15, 0.5, 1)
engine.addEntity(seTree)
let senTree = buildTree(15, 0.5, 5)
engine.addEntity(senTree)
let sewTree = buildTree(11, 0.5, 1)
engine.addEntity(sewTree)