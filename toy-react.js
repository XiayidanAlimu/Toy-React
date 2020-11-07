const RENDER_TO_DOM = Symbol("render to dom")

class ElementWrapper {
  constructor(type) 
  {
    this.root = document.createElement(type)
  }

  setAttribute(name, value)
  {
    // 如果属性名是以"on"开头的字符串，则绑定事件响应函数
    if(name.match(/^on([\s\S]+)/)){
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()), value)
    } else {
      this.root.setAttribute(name, value)
    }
  }

  appendChild(component)
  {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }

  [RENDER_TO_DOM](range)
  {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper 
{
  constructor(content) 
  {
    this.root = document.createTextNode(content)
  }

  [RENDER_TO_DOM](range)
  {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() 
  {
    // 创造一个绝对空对象
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  setAttribute(name, value)
  {
    this.props[name] = value
  }

  appendChild(component)
  {
    this.children.push(component)
  }

  //使用range去定位需要在哪里插入重新渲染过的节点
  // []代替名字，表示 []里面是一个变量
  [RENDER_TO_DOM](range)
  {
    // 将rangeb变量保存 以便重新绘制
    this._range = range;
    // 递归的调用
    this.render()[RENDER_TO_DOM](range)
  }

  // 重新绘制ranged的函数
  rerender()
  {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }

  setState(newState)
  {
    // 旧state不存在时候 短路逻辑直接返回 
    if(this.state === null || typeof this.state !== "object")
    {
      this.state = newState
      this.rerender()
      return
    }
    let merge = (oldState, newState)=>{
      for( let p in newState)
      {
        // typeof 判断对象类型的时候 一定要和 !== null一起使用
        if(oldState[p] !== null || typeof oldState[p] !== "object")
        {
          oldState[p] = newState[p]
        } else {
          // 如果属性值是一个对象 则递归的调用merge
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.state, newState)
    this.rerender()
  }
}

export function createElement(type, attributes, ...children) {
  let e;
  if(typeof type === "string") {
    e = new ElementWrapper(type)
  } else {
    e = new type;
  }

  for( let p in attributes )
  {
    e.setAttribute(p, attributes[p])
  }
  let insertChildren = (children) => {
    for( let child of children ) {
      if( typeof child === "string" ) {
        child = new TextWrapper(child)
      }
      if( (typeof child === "object" && child instanceof Array) ) {
        insertChildren(child)
      }else{
        e.appendChild(child)
      }
    }
  }

  insertChildren(children)
  
  return e
}

export function render (component, parentElement)
{
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}