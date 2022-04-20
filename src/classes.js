/// <reference types="../node_modules/@types/p5/global"/>

import * as p5 from '../node_modules/p5/lib/p5'

export class Field {
  constructor(container, cols, rows = cols) {
    this.container = container
    this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    this.rows = rows
    this.cols = cols
    this.cells = [...Array(this.cols * this.rows)].map(() => new Cell())

    this.cells.forEach((cell, i) => {
      cell.el.addEventListener('mouseenter', () => {
        cell.hoverToggle()
      })
      cell.el.addEventListener('mouseleave', () => {
        cell.hoverToggle()
      })
      cell.el.addEventListener('click', () => {
        this.toggleSelect(i)
      })
      this.container.appendChild(cell.el)
    })

    this.selected = []
  }

  toggleSelect(i) {
    this.cells[i].toggleSelect()
    this.cells[i].canvas.redraw()
    this.selected = this.cells.filter(cell => cell.selected)

    if (this.selected.length === this.cols) {
      this.checkMatches()
    }
  }

  checkMatches() {
    let figure = new Set()
    let border = new Set()
    let inner = new Set()
    let amount = new Set()

    this.selected.forEach(el => {
      figure.add(el.figure)
      border.add(el.border)
      inner.add(el.inner)
      amount.add(el.amount)
    })

    let count = (figure.size === this.cols ? this.cols : 0) + (border.size === this.cols ? this.cols : 0) + (inner.size === this.cols ? this.cols : 0) + (amount.size === this.cols ? this.cols : 0)
    let allSum = figure.size + border.size + inner.size + amount.size

    //console.log(count, allSum)
    //console.log(figure.size, border.size, inner.size, amount.size)
    //console.log(count)

    if (count == this.cols * 2 && allSum == this.cols * 2 + 2) {
      this.selected.forEach(cell => {
        cell.toggleSelect()
        cell.canvas.redraw()
        cell.setOpacity(0)
        cell.hide = true
      })
      this.selected = []

      const win = this.cells.filter(cell => cell.hide).length === this.cells.length

      if (win) {
        console.log('Yay!')
        // wins.tris = wins.tris + 1 || 1
        // localStorage.setItem('wins', JSON.stringify(wins))
        // unlockHardcore()
        this.flicker(1, 1000)
        this.flicker(0, 1500)
        setTimeout(() => { this.newField() }, 3000)
      }
    }
    else {
      this.selected.forEach(cell => {
        cell.toggleSelect()
        cell.canvas.redraw()
      })
      this.selected = []
    }
  }

  resize(width) {
    this.container.style.width = `${width}px`
    const cellSize = (width - (this.cols - 1) * 6) / this.cols
    this.container.style.height = `${width}px`
    this.cells.forEach(cell => {
      cell.resize(cellSize)
    })
  }

  setCells(cells) {
    cells.forEach((cell, i) => {
      this.cells[i].setParams(cell)
      this.cells[i].canvas.redraw()
    })
  }

  newField() {
    let initCells = []
    let cells = []

    for (let i = 0; i < this.cols; i++) {
      let param = [...Array(4).keys()]
      let p1 = param.splice(Math.floor(Math.random() * param.length), 1)[0]
      let p2 = param.splice(Math.floor(Math.random() * param.length), 1)[0]

      let rowParam = [...Array(4)]
      rowParam[p1] = Math.ceil(Math.random() * this.cols)
      rowParam[p2] = Math.ceil(Math.random() * this.cols)

      let allParams = [...Array(4)].map(() => [...Array(this.cols).keys()].map(el => el + 1))

      // let c = color(Math.floor(Math.random() * 191)+64, Math.floor(Math.random() * 191)+64, Math.floor(Math.random() * 191)+64)
      let col = 360.0 * i / this.cols

      //console.log(rowParam, allParams)
      for (let j = 0; j < this.cols; j++) {
        initCells.push([
          rowParam[0] || allParams[0].splice(Math.floor(Math.random() * allParams[0].length), 1)[0],
          rowParam[1] || allParams[1].splice(Math.floor(Math.random() * allParams[1].length), 1)[0],
          rowParam[2] || allParams[2].splice(Math.floor(Math.random() * allParams[2].length), 1)[0],
          rowParam[3] || allParams[3].splice(Math.floor(Math.random() * allParams[3].length), 1)[0]
        ])
      }
    }

    while (initCells.length !== 0) {
      cells.push(initCells.splice(Math.floor(Math.random() * initCells.length), 1)[0])
    }
  
    this.setCells(cells)

    this.reset()
    
    // this.flicker()
  }

  flicker(o, delay) {
    this.cells.forEach((cell, i) => {
      setTimeout(() => {
        cell.setOpacity(o)
      }, 100 * i + delay)
    })
  }

  reset() {
    this.cells.forEach(cell => {
      cell.hide = false
      cell.selected = false
      // cell.setOpacity(1)
    })
    this.flicker(1, 600)
  }
}

export class Cell {
  constructor(border = 0, figure = 0, inner = 0, amount = 0) {
    this.el = document.createElement('div')
    this.el.classList.add('cell')
    this.hover = false
    this.halo = 1
    this.selected = false
    this.hide = false
    this.size = 100
    this.canvas = new window.p5(cellp5(this), this.el)

    this.border = border
    this.figure = figure
    this.inner = inner
    this.amount = amount

  }

  hoverToggle() {
    this.hover = !this.hover
    // this.halo = this.hover ? 100 : 0
    this.canvas.loop()
  }

  toggleSelect() {
    this.selected = !this.selected
  }

  resize(width) {
    this.size = width
    this.el.style.width = `${width}px`
    this.el.style.height = `${width}px`
    this.canvas.resizeCanvas(width, width)
  }

  setParams(params) {
    this.border = params[0]
    this.figure = params[1]
    this.inner = params[2]
    this.amount = params[3]
  }

  setOpacity(opacity) {
    this.el.style.opacity = opacity
  }
}

function cellp5(cell) {
  return (s) => {
    s.setup = () => {
      s.createCanvas(cell.size, cell.size)
      // s.noLoop()
    }

    s.draw = () => {
      const PI = Math.PI
      const TWO_PI = Math.PI * 2
      if (s.isLooping()) cell.halo += (cell.hover ? 1 : -1)
      s.clear()
      // s.background(100 + cell.halo)

      s.translate(cell.size / 2, cell.size / 2)

      s.drawingContext.shadowBlur = cell.halo
      s.drawingContext.shadowColor = 'white'
      s.noFill()
      s.stroke('#ffffd4')
      s.strokeWeight(2)

      if (cell.selected) {
        s.push()
        s.fill('#ffffd41A')
        s.noStroke()
        // polygon(s, 0, 0, cell.size / 2 * 0.9, 6, false)
        switch (cell.figure) {
          case 2:
            polygon(s, 0, 0, cell.size / 2, 6)
            break;
          case 3:
            s.circle(0, 0, cell.size - 5)
            break;
          default:
            polygon(s, 0, 0, cell.size / 2, 4, true)
            break;
        }
        s.pop()
      }

      switch (cell.figure) {
        case 0:
          break;
        case 2:
          for (let i = 0; i < cell.border; i++) {
            polygon(s, 0, 0, cell.size / 2 - 5 * i, 6)
          }
          break;
        case 3:
          for (let i = 0; i < cell.border; i++) {
            s.circle(0, 0, cell.size - 5 - 10 * i)
          }
          break;
        default:
          for (let i = 0; i < cell.border; i++) {
            polygon(s, 0, 0, cell.size / 2 - 8 * i, 4, true)
          }
          break;
      }

      const location = []
      const miniSize = 5

      if (cell.amount === 1) {
        location.push({ x: 0, y: 0 })
      }
      else if (cell.amount > 0) {
        const angle = TWO_PI / cell.amount;
        for (let a = 0; a < TWO_PI; a += angle) {
          let sx = Math.cos(a + (cell.amount % 2 == 0 ? 0 : -PI / 2)) * 4 * miniSize;
          let sy = Math.sin(a + (cell.amount % 2 == 0 ? 0 : -PI / 2)) * 4 * miniSize;
          location.push({ x: sx, y: sy });
        }
      }

      location.forEach(loc => {
        switch (cell.inner) {
          case 1:
            polygon(s, loc.x, loc.y, cell.size / (miniSize * 2), 4)
            break;
          case 2:
            polygon(s, loc.x, loc.y, cell.size / (miniSize * 2), 3)
            break;
          default:
            s.circle(loc.x, loc.y, cell.size / miniSize - 5)
            break;
        }
      })

      // polygon(s, 0, 0, cell.size / 2 * 0.9, 6, false)

      // s.circle(0, 0, 100)

      // console.log(cell.halo)
      if (cell.halo >= 8 || cell.halo == 0) {
        s.noLoop()
      }
    }
  }
}

function polygon(s, x, y, radius, npoints, turn = false) {
  const PI = Math.PI
  const TWO_PI = PI * 2
  let angle = TWO_PI / npoints;
  s.beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + Math.sin(a + (turn ? PI / 4 : 0)) * (radius + (turn ? 20 : 0));
    let sy = y + Math.cos(a + (turn ? PI / 4 : 0)) * (radius + (turn ? 20 : 0));
    s.vertex(sx, sy);
  }
  s.endShape(s.CLOSE);
}