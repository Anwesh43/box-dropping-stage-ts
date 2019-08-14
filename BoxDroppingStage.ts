const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const foreColor : string = "#f44336"
const backColor : string = "#BDBDBD"

class Stage {

    body : HTMLBodyElement

    init() {
        this.body = document.createElement('body')
        this.body.style.background = backColor
        document.body.appendChild(this.body)
    }

    add(component) {
        this.body.appendChild(component)
    }
}
