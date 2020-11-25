const RENDER_TO_DOM = Symbol("render to dom")

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

  get vdom() {
    //递归的调用
    return this.render().vdom
  }

  //使用range去定位需要在哪里插入重新渲染过的节点
  // []代替名字，表示 []里面是一个变量
  [RENDER_TO_DOM](range)
  {
    // 将range变量保存 以便重新绘制
    this._range = range;
    //用_vdom来充当上次渲染得到的旧的vdom，以便更新时进行Dom树对比
    this._vdom = this.vdom
    // 递归的调用
    this._vdom[RENDER_TO_DOM](range)
  }

  update()
  {
    // 检查根节点的type, props是否一致
    let isSameNode = (oldNode, newNode)=>{
      //检查类型
      if(oldNode.type !== newNode.type)
      {
        return false
      }
      //检查属性值
      for(let name in newNode.props)
      {
        if(newNode.props[name] !== oldNode.props[name])
        {
          return false
        }
      }
      //检查属性的数量
      if( Object.keys(oldNode.props).length > Object.keys(newNode.props).length )
      {
        return false
      }
      //文本节点的内容不同
      if(newNode.type === '#text')
      {
        if(newNode.content !== oldNode.content)
        {
          return false
        }
      }
      return true
    }
    // 递归的访问vdom的内容，新旧对比
    let update = (oldNode, newNode) => {
      // 再检查children是否一致
      // #text, content
      if(!isSameNode(oldNode, newNode))
      {
        // 如果不是一个节点，则对旧的节点值进行覆盖，替换，全新渲染
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range

      let newChildren = newNode.vchildren
      let oldChildren = oldNode.vchildren

      if(!newChildren || !newChildren.length)
      {
        return
      }

      let tailRange = oldChildren[oldChildren.length-1]._range
      
      for(let i = 0; i < newChildren.length; i++ )
      {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        if(i < oldChildren.length)
        {
          update(oldChild, newChild)
        }
        else
        {
          //执行插入
          let range = document.createRange()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }

    let vdom = this.vdom
    update(this._vdom, vdom)
    this._vdom = vdom
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
    this.update()
  }
}

class ElementWrapper extends Component {
  constructor(type) 
  {
    super(type)
    this.type = type
    this.root = document.createElement(type)
  }

  get vdom()
  {
    this.vchildren = this.children.map(child=>child.vdom)
    return this
  }

  [RENDER_TO_DOM](range)
  {

    this._range = range
    let root = document.createElement(this.type)

    for(var name in this.props)
    {
      let value = this.props[name]
      // 如果属性名是以"on"开头的字符串，则绑定事件响应函数
      if(name.match(/^on([\s\S]+)/)){
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()), value)
      } else {
        if(name === "className") {
          root.setAttribute("class", value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }

    if(!this.vchildren)
    {
      this.vchildren = this.children.map(child=>child.vdom)
    }

    for(let child of this.vchildren)
    {
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    replaceContent(range, root)
  }
}

class TextWrapper extends Component {
  constructor(content) 
  {
    super(content)
    this.type = '#text'
    this.content = content
  }

  get vdom(){
    return this
  }

  [RENDER_TO_DOM](range)
  {
    this._range = range
    let root = document.createTextNode(this.content)
    replaceContent(range, root)
  }
}

function replaceContent(range, node)
{
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
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
      if( child === null ) {
        continue
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