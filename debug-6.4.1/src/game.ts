const myEntity = new Entity()
myEntity.addComponent(new BoxShape())

const myMaterial = new Material()
myMaterial.albedoColor = Color3.Blue()
myMaterial.metallic = 0.9
myMaterial.roughness = 0.1

myEntity.addComponent(myMaterial)
myEntity.addComponent(new Transform({
  scale: new Vector3(2, 0.5, 2),
  position: new Vector3(
    4,
    1, 
    4
  )
}))

engine.addEntity(myEntity)
