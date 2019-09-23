/// ---- CLIMBING ----
// Concept: use steps to build a climbing structure

// add the color
let stepMaterial = new Material()
stepMaterial.albedoColor = Color3.Red()

// add the step
let tile = new Entity()
tile.addComponent(stepMaterial)
tile.addComponent(new BoxShape())
tile.addComponent(new Transform({
  scale: new Vector3(2, 0.5, 2),
  position: new Vector3(
    4,
    1, 
    4
  )
}))
engine.addEntity(tile)
