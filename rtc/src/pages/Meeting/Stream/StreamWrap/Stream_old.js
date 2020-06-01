import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Stream.css'

class Stream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      set_width: '',
      set_height: '',
      index_list:0,
    }
    this.resizeBind = this.resizeBind.bind(this);
  }
 
  width_height(index,streams) {
    console.log('============width_height',streams)
    // const idNumber = Object.keys(streams.streams).length;
    const idNumber = Object.keys(streams).length;

    console.log(idNumber)
    if(index == 0){
      console.log('*******************111111111111111')
      let d_width = document.body.clientWidth;//浏览器的宽
      let c_height = document.body.clientHeight;//浏览器的高
      let b_height = (c_height - 50 - 64) / 2;//视频窗口的高
      let b_width = b_height / 3 * 4;//视频窗口的宽 4:3
      let l_width = b_height / 9 * 16;//视频窗口的宽 16:9
      let v_width = (d_width - 50) / 2;//视频窗口的宽
      let d_height = v_width / 4 * 3;//视频窗口的高
      if(idNumber == 1 || idNumber > 2){
        let vs_width = (d_width - 50);//视频窗口的宽
        let ds_height = (vs_width - 64 - 100) / 4 * 3;//视频窗口的高
        if(c_height<ds_height){//浏览器的高小于视频窗口的高
          let x_height = c_height;
          let x_width = x_height / 3 * 4;
          console.log(x_width,x_height)
          this.setState({
            set_width: x_width,
            set_height: x_height
          })
        }else{
          this.setState({
            set_width: vs_width,
            set_height: ds_height
          })
        }
      }else if(idNumber == 2){
        if(l_width < v_width){//如果16:9的宽小于视频窗口的宽
          let v_width = []
          this.setState({
            set_width: l_width,
            set_height: b_height
          })
        }else{
          this.setState({
            set_width: b_width,
            set_height: b_height
          })
        }
      }
    }else if(index == 1){
      let d_width = document.body.clientWidth;//浏览器的宽
      let c_height = document.body.clientHeight;//浏览器的高
      let v_width = (d_width - 50);//视频窗口的宽
      let d_height = v_width / 4 * 3;//视频窗口的高
      if(c_height<d_height){//浏览器的高小于视频窗口的高
        let x_height = c_height;
        let x_width = x_height / 3 * 4;
        this.setState({
          set_width: x_width,
          set_height: x_height
        })
      }else{
        this.setState({
          set_width: v_width,
          set_height: d_height
        })
      }
    }else if(index == 2){
      let c_height = document.body.clientHeight / 5 *4 - 64;//上半部分最大高度
      let d_width = document.body.clientWidth;//浏览器的宽
      let d_height = d_width / 4 * 3;//视频窗口的高
      let h_height = d_width / 16 * 9;//当前比例浏览器的高
      if(d_width/c_height > 16/9){//宽高比大于16/9
        console.log('以16/9来计算',1111)
        if(h_height>c_height){
          let m_width = c_height / 9 * 16;
          console.log(m_width)
          this.setState({
            set_width: m_width,
            set_height: c_height
          })
        }else{
          this.setState({
            set_width: d_width,
            set_height: h_height
          })
        }
        console.log(d_width,h_height)
      }else if(d_width/c_height < 16/9 && d_width/c_height > 4/3){ //宽高比 16/9  4/3 的区间
        console.log('以4/3来计算',2222)
        if(d_height>c_height){
          let m_width = c_height / 3 * 4;
          this.setState({
            set_width: m_width,
            set_height: c_height
          })
        }else{
          let m_height = d_width / 4 * 3;
          this.setState({
            set_width: d_width,
            set_height: m_height
          })
        }
        
      }else if(d_width/c_height < 4/3){//宽高比小于4/3
        console.log('以4/3来计算',3333)
        this.setState({
          set_width: d_width,
          set_height: d_height
        })
      }
    }
  }
  
  componentDidMount() {
    const { id, stream , index,streams} = this.props;
    stream.play(id);
    this.width_height(index,streams);
    window.addEventListener('resize', this.resizeBind(index,streams));
  }
  resizeBind(index,streams) {
    this.width_height(index,streams);
  }
  componentWillUnmount() {
    let {index,streams} = this.props;
    window.removeEventListener('resize', this.resizeBind(index,streams))
  }
  render() {
    const { id, streams, muteParticipants, streamId ,videoDevices,localStreamId} = this.props;
    const {set_width,set_height} = this.state;
    console.log('render',set_width,set_height)
    
    // let idNumber = Object.keys(streams.streams).length;
    // console.log(idNumber)
    // this.setState({idNumber:idNumber})
    if(streamId == localStreamId){
      if(videoDevices.length < 1){
        if (document.getElementById(id)) {
          document.getElementById(id).style.background = "#333";
        }
      }
    }
    if (muteParticipants.length > 0) {
      let noMuteStream = false;
      muteParticipants.map((item) => {
        if (item == streamId) {
          let displayNoneId = 'stream' + streamId;
          if (document.getElementById(displayNoneId)) {
            document.getElementById(displayNoneId).style.display = "none";
            noMuteStream = true;
          }
        }
      })
      if (!noMuteStream) {
        let displayNoneId = 'stream' + streamId;
        if (document.getElementById(displayNoneId)) {
          if (document.getElementById(displayNoneId).style) {
            if (document.getElementById(displayNoneId).style.display) {
              if (document.getElementById(displayNoneId).style.display == 'none') {
                document.getElementById(displayNoneId).style.display = "block";
              }
            }
          }
        }
      }
    } else {
      let displayNoneId = 'stream' + streamId;
      if (document.getElementById(displayNoneId)) {
        if (document.getElementById(displayNoneId).style) {
          if (document.getElementById(displayNoneId).style.display) {
            if (document.getElementById(displayNoneId).style.display == 'none') {
              document.getElementById(displayNoneId).style.display = "block";
            }
          }
        }
      }
    }
    return (
      <div className="swiper-slide">
        <div className="streamBox streamBoxs">
          <div className="stream streams" id={id} style={{ width: this.state.set_width, height: this.state.set_height }}></div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    streams: state.teevid.meeting,
    isStory: state.isStory,
    videoDevices:state.teevid.api.videoDevices,
    localStreamId:state.teevid.meeting.localStreamId,
  }
};

export default connect(mapStateToProps)(Stream);