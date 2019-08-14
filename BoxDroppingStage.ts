const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const foreColor : string = "#f44336"
const backColor : string = "#BDBDBD"
const sizeFactor : number = 10

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

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static updateScale(scale : number, dir : number) : number {
        return dir * scale * scGap
    }
}


class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateScale(this.scale, this.dir)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0 && this.scale == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Block {

    div : HTMLDivElement = document.createElement('div')
    state : State = new State()

    constructor(private x : number, private y : number) {
        this.div.style.position = 'absolute'
        this.div.style.left = `${x}px`
        this.div.style.top = `${y}px`
    }

    update(cb  : Function) {
        const size : number = Math.min(w, h) / sizeFactor
        const updatedSize : number = size * ScaleUtil.divideScale(this.state.scale, 0, 2)
        this.div.style.width = `${updatedSize}px`
        this.div.style.height = `${updatedSize}px`
        const newY : number = this.y + (h - this.y) * ScaleUtil.divideScale(this.state.scale, 1, 2)
        this.div.style.top = `${newY}px`
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
}

class BlockContainer {

    blocks : Array<Block> = []

    start(x : number, y : number, addcb : Function, cb : Function) {
        const block = new Block(x, y)
        block.startUpdating(() => {
            this.blocks.push(block)
            addcb(block.div)
            if (this.blocks.length == 1) {
                console.log("starting call")
                cb()
            }
        })
    }

    update(removecb : Function, cb : Function) {
        this.blocks.forEach((block, index) => {
            block.update(() => {
                this.blocks.splice(index, 1)
                removecb(block.div)
                if (this.blocks.length == 0) {
                    console.log("stopping call")
                    cb()
                }
            })
        })
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class Renderer {

    animator : Animator = new Animator()
    blockContainer : BlockContainer = new BlockContainer()

    handleTap(x : number, y : number, addcb : Function, removecb : Function) {
        this.blockContainer.start(x, y, addcb, () => {
            this.animator.start(() => {
                this.blockContainer.update(removecb, () => {
                    this.animator.stop()
                })
            })
        })
    }
}
