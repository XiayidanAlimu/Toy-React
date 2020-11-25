# Toy-React

### 环境搭建
1. 安装node环境
2. 到工作空间根目录运行
    + git clone
    + npm install

### 代码打包运行
npx webpack

### 学习目标 

1. 基于实 DOM 体系的 toy-react 的 component 的设定,实现自定义组件
2. 给 toy-react 添加state, 对应的生命周期，实现动态修改内容的功能
现在的版本toy-react已经很相像React，但存在致命问题是其没有引入虚拟Dom，每次都是全量的更新整个Dom树，对性能的损耗很大
3. 虚拟DOM的原理和关键实现
创建Virtual Dom，diff算法

差别:
React从14版本开始使用Fiber,Hooks，再加上虚拟DOM的diff算法事件中心




