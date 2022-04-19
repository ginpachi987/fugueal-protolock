/// <reference types="../node_modules/@types/p5/global"/>

import './style.scss'
import * as p5 from '../node_modules/p5/lib/p5.min'

const sketch = window

let fieldDimension = 3
let maxCellSize = 150
let cellSize
let field = []
let selected = []
let cell
let miniSize = 5
let wins
let slider

let showGroups = false

sketch.setup = () => {
  createCanvas(windowWidth, windowHeight)

  rectMode(CENTER)

  let resetB = document.querySelector('#reset')
  resetB.addEventListener('click', resetter)
  resetB.addEventListener('touchstart', resetter)

  let newGame = document.querySelector('#new')
  newGame.addEventListener('click', newField)
  newGame.addEventListener('touchstart', newField)

  slider = createSlider(2, 12, 3, 1)
  slider.style('width', '200px')
  slider.position(windowWidth/2-100,windowHeight-100)
  slider.hide()
  slider.input(changeFieldSize)

  document.addEventListener('keypress', (event) => {
    if (event.code === 'KeyN') {
      showGroups = !showGroups
      redraw()
    }
  })

  localStorage.removeItem('wins')
  wins = JSON.parse(localStorage.getItem('wins')) || {}
  unlockHardcore()

  newField()
  noLoop()
}

function changeFieldSize() {
  fieldDimension = slider.value()
  newField()
}

function newField() {
  let initField = []
  field = []

  for (let i = 0; i < fieldDimension; i++) {
    let param = [...Array(4).keys()]
    let p1 = param.splice(Math.floor(Math.random() * param.length), 1)[0]
    let p2 = param.splice(Math.floor(Math.random() * param.length), 1)[0]

    let rowParam = [...Array(4)]
    rowParam[p1] = Math.ceil(Math.random() * fieldDimension)
    rowParam[p2] = Math.ceil(Math.random() * fieldDimension)

    let allParams = [...Array(4)].map(() => [...Array(fieldDimension).keys()].map(el => el + 1))

    // let c = color(Math.floor(Math.random() * 191)+64, Math.floor(Math.random() * 191)+64, Math.floor(Math.random() * 191)+64)
    let col = 360.0 * i / fieldDimension

    //console.log(rowParam, allParams)
    for (let j = 0; j < fieldDimension; j++) {
      initField.push(new Cell(
        rowParam[0] || allParams[0].splice(Math.floor(Math.random() * allParams[0].length), 1)[0],
        rowParam[1] || allParams[1].splice(Math.floor(Math.random() * allParams[1].length), 1)[0],
        rowParam[2] || allParams[2].splice(Math.floor(Math.random() * allParams[2].length), 1)[0],
        rowParam[3] || allParams[3].splice(Math.floor(Math.random() * allParams[3].length), 1)[0],
        col
      ))
    }
  }

  while (initField.length !== 0) {
    field.push(initField.splice(Math.floor(Math.random() * initField.length), 1)[0])
  }

  redraw()
}

sketch.draw = () => {
  cellSize = Math.min(maxCellSize, Math.min(windowWidth, windowHeight) / fieldDimension) - 10
  background(40)

  stroke(255)
  strokeWeight(2)
  noFill()

  translate(windowWidth / 2, windowHeight / 2)

  // rect(-cellSize/2, -cellSize/2, cellSize, cellSize)
  translate(-cellSize * 0.5 * (fieldDimension - 1), -cellSize * 0.5 * (fieldDimension - 1))

  push()

  for (let i = 0; i < fieldDimension; i++) {
    for (let j = 0; j < fieldDimension; j++) {
      field[i + j * fieldDimension].draw(cellSize * i, cellSize * j)
    }
  }
  pop()

  // for (let i = 0; i < fieldDimension; i++) {
  //   polygon(0, i * cellSize, cellSize / (miniSize * 2), 4)
  //   for (let j = 0; j < i + 1; j++) {
  //     polygon(0, i * cellSize, cellSize / 2 - 5 * j, 6)
  //   }
  // }

  // translate(cellSize, 0)
  // for (let i = 0; i < fieldDimension; i++) {
  //   polygon(0, i * cellSize, cellSize / (miniSize * 2), 3)
  //   for (let j = 0; j < i + 1; j++) {
  //     circle(0, i * cellSize, cellSize - 5 - 10 * j)
  //   }
  // }

  // translate(cellSize, 0)
  // for (let i = 0; i < fieldDimension; i++) {
  //   circle(0, i * cellSize, cellSize / miniSize)
  //   for (let j = 0; j < i + 1; j++) {
  //     // rect(-cellSize / 2 + 5 * (j + 1), -cellSize / 2 + 5 * (j + 1) + cellSize * i, cellSize - 10 - 10 * j, cellSize - 10 - 10 * j)
  //     polygon(0, i * cellSize, cellSize / 2 - 8 * j, 4, true)
  //   }
  // }

  // translate(-cellSize, 0)

  // translate(-cellSize * fieldDimension / 2, -cellSize * fieldDimension / 2)
  // rect(0, 0, cellSize * fieldDimension, cellSize * fieldDimension)
}

function polygon(x, y, radius, npoints, turn = false) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + sin(a + (turn ? PI / 4 : 0)) * (radius + (turn ? 20 : 0));
    let sy = y + cos(a + (turn ? PI / 4 : 0)) * (radius + (turn ? 20 : 0));
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  slider.position(windowWidth/2-100,windowHeight-100)
  redraw()
}

function resetter() {
  //alert('reset')
  field.forEach(el => {
    el.hide = false
    el.selected = false
  })
  selected = field.filter(el => el.selected)
  redraw()
}

class Cell {
  constructor(type, border, innerType, amount, col) {
    this.type = type //|| Math.floor(Math.random() * 3)
    this.border = border //|| Math.floor(Math.random() * 3 + 1)
    this.innerType = innerType //|| Math.floor(Math.random() * 3)
    this.amount = amount //|| Math.floor(Math.random() * 3)
    //this.row = row
    this.selected = false
    this.hide = false
    //this.color = c || 100
    this.color = col
  }

  draw(x = 0, y = 0) {
    if (this.hide) return
    if (showGroups) colorMode(HSB, 360, 100, 100, 100)
    let col = color(this.color, 50, 100)
    stroke(this.selected ? 255 :(showGroups?col:100))
    switch (this.type) {

      case 2:
        for (let i = 0; i < this.border; i++) {
          polygon(x, y, cellSize / 2 - 5 * i, 6)
        }
        break;
      case 3:
        for (let i = 0; i < this.border; i++) {
          circle(x, y, cellSize - 5 - 10 * i)
        }
        break;
      default:
        for (let i = 0; i < this.border; i++) {
          polygon(x, y, cellSize / 2 - 8 * i, 4, true)
        }
        break;
    }

    let location = []

    if (this.amount === 1) {
      location.push({ x: 0, y: 0 })
    }
    else {
      let angle = TWO_PI / this.amount;
      for (let a = 0; a < TWO_PI; a += angle) {
        let sx = cos(a + (this.amount % 2 == 0 ? 0 : -PI / 2)) * 4 * miniSize;
        let sy = sin(a + (this.amount % 2 == 0 ? 0 : -PI / 2)) * 4 * miniSize;
        location.push({ x: sx, y: sy });
      }
    }
    // switch (this.amount) {
    //   case 1:
    //     location.push({ x: 0, y: 0 })
    //     break;
    //   case 2:
    //     location.push({ x: -cellSize / (miniSize * 2) - 2, y: 0 })
    //     location.push({ x: cellSize / (miniSize * 2) + 2, y: 0 })
    //     break;
    //   case 3:
    //     location.push({ x: 0, y: -cellSize / (miniSize * 2) })
    //     location.push({ x: -cellSize / (miniSize * 2) - 2, y: cellSize / (miniSize * 2) })
    //     location.push({ x: cellSize / (miniSize * 2) + 2, y: cellSize / (miniSize * 2) })
    //     break;
    // }

    location.forEach(loc => {
      switch (this.innerType) {
        case 1:
          polygon(x + loc.x, y + loc.y, cellSize / (miniSize * 2), 4)
          break;
        case 2:
          polygon(x + loc.x, y + loc.y, cellSize / (miniSize * 2), 3)
          break;
        default:
          circle(x + loc.x, y + loc.y, cellSize / miniSize - 5)
          break;
      }
    })
  }
}

function touchStarted() {
  let mX = mouseX - windowWidth / 2 + cellSize * fieldDimension / 2
  let mY = mouseY - windowHeight / 2 + cellSize * fieldDimension / 2
  if (mX < 0 || mY < 0) return
  translate(windowWidth / 2 - cellSize * fieldDimension / 2, windowHeight / 2 - cellSize * fieldDimension / 2)

  let i = Math.floor(mX / cellSize)
  let j = Math.floor(mY / cellSize)

  if (i < fieldDimension && j < fieldDimension) {
    // clicks++
    // checkField(i, j)
    field[i + j * fieldDimension].selected ^= 1

    selected = field.filter(el => el.selected)
    //console.log(selected)

    if (selected.length === fieldDimension) {
      //console.log(selected)

      let params = [selected[0].type, selected[0].border, selected[0].innerType, selected[0].amount]
      let compare = [0, 0, 0, 0]
      //console.log(params)

      let types = new Set()
      let borders = new Set()
      let innerTypes = new Set()
      let amounts = new Set()

      for (let el of selected) {
        types.add(el.type)
        borders.add(el.border)
        innerTypes.add(el.innerType)
        amounts.add(el.amount)
      }

     //console.log(compare)
      let count = (types.size === fieldDimension ? fieldDimension : 0) + (borders.size === fieldDimension ? fieldDimension : 0) + (innerTypes.size === fieldDimension ? fieldDimension : 0) + (amounts.size === fieldDimension ? fieldDimension : 0)
      let allSum = types.size + borders.size + innerTypes.size + amounts.size

      //console.log(count)

      if (count == fieldDimension * 2 && allSum == fieldDimension * 2 + 2) {
        selected.forEach(el => el.hide = true)
        field.forEach(el => el.selected = false)
        selected = field.filter(el => el.selected)

        let win = field.filter(el => el.hide).length === field.length

        if (win) {
          alert('Yay!')
          wins.tris = wins.tris + 1 || 1
          localStorage.setItem('wins', JSON.stringify(wins))
          unlockHardcore()

          setTimeout(() => {newField()},1000)
        }
      }
      else {
        field.forEach(el => el.selected = false)
        selected = field.filter(el => el.selected)
      }
    }

    redraw()
    //winCheck()
  }

  return false
}

function unlockHardcore() {
  if (wins.tris >= 100) {
    slider.show()
  }
}