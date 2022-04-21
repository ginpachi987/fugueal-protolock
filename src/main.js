/// <reference types="../node_modules/@types/p5/global"/>

import './style.scss'

import { Field } from './classes'
import { ru, en } from './lang/langs'
let langs = { ru: ru, en: en }
let lang = en

// let sketch = window

let field
const maxWidth = 458

//Tutorial stuff
let tip
let tutorialInterval1
let tutorialInterval2
let showTip

setup()

function setup() {
  const game = document.querySelector('#game')
  field = new Field(game, 3)
  field.newField()

  const resize = () => {
    const width = Math.min(window.innerWidth - 60, window.innerHeight - 60, maxWidth)
    field.resize(width)
    console.log(width)
  }
  resize()

  window.addEventListener('resize', () => {
    resize()
  })

  // Button events
  let reset = document.querySelector('#reset')
  reset.addEventListener('click', resetGame)

  let newGame = document.querySelector('#new')
  newGame.addEventListener('click', newField)

  let tutorialButton = document.querySelector('#tutorial-button')
  tutorialButton.addEventListener('click', showTutorial)

  setLang(navigator.language.substring(0, 2))
  window.top.postMessage('getLang', '*')

  // Clear nav if iframe
  if (window.self !== window.top) {
    document.querySelector('nav').innerHTML = ''
  }

  // Message from parent
  window.onmessage = function (e) {
    if (e.data.lang) {
      setLang(e.data.lang)
    }
  }

  // Tutorial popup
  showTip = JSON.parse(localStorage.getItem('showTip')) || false
  if (!showTip) {
    setTimeout(() => {
      tip = document.querySelector('#tip')
      tip.style.opacity = 1
      tip.style.pointerEvents = 'auto'
      tip.addEventListener('click', () => {
        localStorage.setItem('showTip', true)
        tip.style.opacity = 0
      })
    }, 2000)
  }
}

function resetGame() {
  field.reset()
}

function newField() {
  field.flicker(0, 0)
  setTimeout(() => { field.newField() }, 1400)
}

function setLang(language) {
  if (langs[language]) {
    lang = langs[language]
  }
  else lang = langs['en']
  let newGame = document.querySelector('#new-game')
  newGame.innerHTML = lang.newGame || en.newGame

  let resetText = document.querySelector('#reset-text')
  resetText.innerHTML = lang.reset || en.reset

  let tip = document.querySelector('#tip')
  tip.innerHTML = lang.tip || lang.tip
}

function showTutorial() {
  if (!showTip) {
    localStorage.setItem('showTip', true)
    tip.style.opacity = 0
  }

  let wrapper = document.querySelector('#tutorial-wrapper')
  wrapper.style.display = 'block'

  let tutorial = document.createElement('div')
  tutorial.classList.add('tutorial')

  let closeButton = document.createElement('div')
  closeButton.id = 'tutorial-close'
  closeButton.innerHTML = 'X'
  closeButton.addEventListener('click', hideTutorial)

  tutorial.appendChild(closeButton)

  let header = document.createElement('h1')
  header.innerHTML = lang.title || en.title

  tutorial.appendChild(header)
  tutorial.appendChild(document.createElement('hr'))

  let p = document.createElement('p')
  p.innerHTML = lang.tutorial[0] || en.tutorial[0]

  tutorial.appendChild(p)

  let disp = document.createElement('div')
  disp.classList.add('tut-display')
  // p = document.createElement('p')
  // p.innerHTML = (lang.tutorial[1] || en.tutorial[1]) + ' ->'
  // disp.appendChild(p)

  // p = document.createElement('p')
  // p.innerHTML = '<- ' + (lang.tutorial[2] || en.tutorial[2])
  // disp.appendChild(p)
  tutorial.appendChild(disp)

  let h2 = document.createElement('h2')
  h2.innerHTML = `${lang.tutorial[3] || en.tutorial[3]} 1`
  tutorial.appendChild(h2)

  p = document.createElement('p')
  p.innerHTML = lang.tutorial[4] || en.tutorial[4]
  tutorial.appendChild(p)

  let div = document.createElement('div')
  div.classList.add('game')
  // div.style.pointerEvents = 'none'
  let tutorialField1 = new Field(div, 3, 1)
  let cells = [
    { figure: 1, border: 1, inner: 1, amount: 1 },
    { figure: 2, border: 1, inner: 1, amount: 1 },
    { figure: 3, border: 1, inner: 1, amount: 1 }
  ]
  tutorialField1.setCells(cells)
  tutorialField1.resize(300)
  tutorialField1.cells.forEach(cell => {
    cell.canvas.redraw()
  })
  tutorialField1.flicker(1, 0)
  tutorial.appendChild(div)

  console.log(tutorialField1)

  h2 = document.createElement('h2')
  h2.innerHTML = `${lang.tutorial[3] || en.tutorial[3]} 2`
  tutorial.appendChild(h2)

  p = document.createElement('p')
  p.innerHTML = lang.tutorial[5] || en.tutorial[5]
  tutorial.appendChild(p)

  div = document.createElement('div')
  div.classList.add('game')
  div.style.pointerEvents = 'none'
  // let tutorialField2 = new Field(5, div)
  // tutorial.appendChild(div)

  // let int = (field, cells) => {
  //   cells.forEach((cell, i) => {
  //     const [x, y] = cell
  //     field.checkCell(x, y, 0)
  //     setTimeout(() => {
  //       field.cells[x][y].toggleHighlight()
  //     }, 2000 * (i + 1) - 500)
  //     setTimeout(() => {
  //       field.cells[x][y].toggleHighlight()
  //       field.checkCell(x, y)
  //     }, 2000 * (i + 1))
  //   })

  //   setTimeout(() => {
  //     field.flicker()
  //   }, 2000 * cells.length + 1000)

  //   cells = cells.reverse()
  // }
  // let cells1 = [[1, 1], [3, 3]]
  // let cells2 = [[3, 1], [2, 0], [1, 1], [1, 2], [1, 4]]
  // int(tutorialField1, cells1)
  // int(tutorialField2, cells2)

  // tutorialInterval1 = setInterval((field, cells) => {
  //   int(field, cells)
  // }, 2000 * (cells1.length + 2), tutorialField1, cells1)

  // tutorialInterval2 = setInterval((field, cells) => {
  //   int(field, cells)
  // }, 2000 * (cells2.length + 2), tutorialField2, cells2)

  wrapper.appendChild(tutorial)
}

function hideTutorial() {
  let wrapper = document.querySelector('#tutorial-wrapper')
  wrapper.innerHTML = ''
  wrapper.style.display = 'none'

  clearInterval(tutorialInterval1)
  clearInterval(tutorialInterval2)
}