import { createElement, Component, render } from "./toy-react.js"

class MyComponnet extends Component{
  render(){
    return <div>
      <h1>My Component</h1>
      {this.children}
    </div>
  }
}

render(<MyComponnet id="a" class="c">
  <div>123</div>
  <div></div>
  <div></div>
</MyComponnet>, document.body );