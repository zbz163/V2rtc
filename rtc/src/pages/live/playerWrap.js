import React, { Component } from 'react';
import data from './aliplayer.html';  // 引入需要引用的html文件

class PlayerWrap extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            config: props.config
        }
    }
   
    componentDidMount(){
        let { config } = this.props;
        let receiveMessageFromIframe = function ( event, ) {
            console.log(event)
            if(event != undefined){
                // console.log( '我是react,我接受到了来自iframe的模型ID：', event.data );
                
                // 如果子页面加载完成，给子页面传递播放参数，初始化播放器
                const childFrameObj = document.getElementById('playerIframe');
                // 第一个参数: 信息内容，低版本浏览器只支持字符串，高版本可以各种数据都行
                // 第二个参数：目标窗口的源，可以是字符串*表示无限制，或URI,需要协议端口号和主机都匹配才会发送
                childFrameObj.contentWindow.postMessage(config,'*');
             }
        }
        //监听message事件
        window.addEventListener("message", receiveMessageFromIframe, false);
    }
   
    render() {
        let { config } = this.props;
        return (
            <div >
                <iframe
                    id='playerIframe'
                    title="resg"
                    srcDoc={data}
                    style={{ width: '100%', border: '0px', height: '1100px' }}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    scrolling="auto"
                />
            </div>
        )
    }
}


export default PlayerWrap;