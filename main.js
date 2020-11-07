import { createElement, Component, render } from "./toy-react.js"

class MyComponnet extends Component{
  constructor()
  {
    //调动父类Component的构造函数
    super()
    this.state = {
      a: 1,
      b: 2
    }
  }
  render(){
    return <div>
      <h1>My Component</h1>
      <button onclick={()=>{this.setState({a: this.state.a + 1 })}}> add 1 to varibale a</button>
      <span>当前组件state.a.toString()的结果是:</span>
      <span>{this.state.a.toString()}</span>
      {this.children}
    </div>
  }
}

render(<MyComponnet id="a" class="c">
  <div>123</div>
  <div></div>
  <div></div>
</MyComponnet>, document.body );