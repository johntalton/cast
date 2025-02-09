import { Cube, Sphere, Plane } from './objects.js'
import { Direction3D  } from './cast.js'


const circle1 = new Sphere({ x: -20, y: 20, z: -130 }, 30)
circle1.material = 'green'

const circle2 = new Sphere({ x: 100, y: -50, z: -100}, 30)
circle2.material = 'blue'

const circle3 = new Sphere({ x: 0, y: 0, z: -30}, 20)
circle3.material = 'yellow'

const plane = new Plane({ x: 0, y: -100, z: 0 }, new Direction3D({ x: 0, y: 1, z: 0 }))

const plane2 = new Plane({ x: 100, y: 0, z: 0 }, new Direction3D({ x: -1, y: 0, z: 0 }))
plane2.material = 'pink'

const plane3 = new Plane({ x: 0, y: 0, z: 50 }, new Direction3D({ x: 0, y: 0, z: -1 }))
plane3.material = 'color-mix(in lab, pink, red)'


export const WORLD = {
  objects: [ circle1, circle2, circle3, plane, plane2, plane3 ],
  lights: [ { x: -100, y: 300, z: -500 } ]
}


// const circle1 = new Sphere({ x: 0, y: 0, z: -100 }, 40)
// circle1.material = 'red' // 'rgb(255 81 91)' // red

// const circle2 = new Sphere({ x: 50, y: 30, z: -50}, 20)
// circle2.material = 'yellow' // 'rgb(229 193 117)' // 0.9, 0.76, 0.46

// const circle3 = new Sphere({ x: 50, y: 0, z: -150}, 30)
// circle3.material = 'blue' // 'rgb(165 196 247)'

// const circle4 = new Sphere({ x: -55, y: 0, z: -50}, 30)
// circle4.material = 'lightgrey' // 'rgb(22 22 22)'

// const plane = new Plane({ x: 0, y: -50, z: 0 }, new Direction3D({ x: 0, y: 1, z: 0 }))
// plane.material = 'green'

// export const WORLD = {
//   objects: [ circle1, circle2, circle3, circle4, plane ],
//   lights: [ { x: 0, y: 300, z: -500 } ]
// }