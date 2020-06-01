import React, { Component } from 'react';
import { connect } from 'react-redux';
// import Stream from './Stream';
import Stream from './Stream';

import _ from 'underscore';
import './StreamWrap.css';
import Swiper from './swiper.js'
import './swiper.min.css'
// import StoryBoards from './storyboards/StoryBoards';
import StoryBoardsScenes from '../StoryBoardsStream/StoryBoardsScenesStream';

class StreamWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index_list: 0,
      translateX: 50,
      translateY: 50,
      set_width: 1230,
      set_height: 799
    }
  }

  small_down=(e)=> {
    var obig = this.refs.move.parentNode;
    var osmall = this.refs.move;
    var e = e || window.event;
    /*用于保存小的div拖拽前的坐标*/
    osmall.startX = e.clientX - osmall.offsetLeft;
    osmall.startY = e.clientY - osmall.offsetTop;
    /*鼠标的移动事件*/
    document.onmousemove = function(e) {
      var e = e || window.event;
      osmall.style.left = e.clientX - osmall.startX + "px";
      osmall.style.top = e.clientY - osmall.startY + "px";
      /*对于大的DIV四个边界的判断*/
      let x=obig.offsetWidth-osmall.offsetWidth
      let y=obig.offsetHeight-osmall.offsetHeight
      if (e.clientX - osmall.startX <= 0) {
        osmall.style.left = 0 + "px";
      }
      if (e.clientY - osmall.startY <= 0) {
        osmall.style.top = 0 + "px";
      }
      if (e.clientX - osmall.startX >= x) {
        osmall.style.left = x + "px";
      }
      if (e.clientY - osmall.startY >= y) {
        osmall.style.top = y + "px";
      }
    };
    /*鼠标的抬起事件,终止拖动*/
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }
  componentWillReceiveProps(nextProps){
    console.log(nextProps)
    console.log(Object.keys(nextProps.streams).length)
    let spLength = Object.keys(nextProps.streams).length;
    if(spLength > 4){
      this.setState({
        index_list:2
      })
    }else{
      this.setState({
        index_list:nextProps.message
      })
    }
  }

  render() {
    const { streams, storyboard, isStory, streamList, stateMode, localStreamId, lecturerId, participant ,remoteParticipants ,speakerActiveIndexs} = this.props;
    // console.log(streams)
    let shipinLength = Object.keys(streams).length;
    let translateX = 50;
    let translateY = 50 + 'px';
    let muteParticipants = [];
    var mediaStreamId;
    var isLecturer = false;
    var galleryThumbs = new Swiper('.gallery-thumbs', {
      spaceBetween: 10,
      slidesPerView: 5,
      freeMode: true,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
      observer:true

    });
    var galleryTop = new Swiper('.gallery-top', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
        swiper: galleryThumbs
      },
      effect : 'fade',
      observer:true
    });
    if (participant && participant.streams) {
      console.log(lecturerId,participant.id,participant)
      //当前用户为主持人
      if (participant.id) {
          mediaStreamId = participant.streams.mediaStreamId;
          isLecturer = true;
      } else {
          //当前用户不是主持人
          for (var key in remoteParticipants) {
              if (lecturerId == key) {
                  mediaStreamId = remoteParticipants[key].streams.mediaStreamId;
              }
          }
      }
  }
    for(var key in remoteParticipants){
      if(remoteParticipants[key]){
        let isMuteByModerator  = remoteParticipants[key].status.mute.video.byModerator;
        let isMuteBySelf = remoteParticipants[key].status.mute.video.state;
        if(isMuteByModerator || isMuteBySelf){
          muteParticipants.push(remoteParticipants[key].streams.mediaStreamId);
        }
      }
    }
    if (stateMode == 'interactive') { //interactive
      const {index_list} = this.state;
      const {streams} = this.props;
      const idNumber = Object.keys(streams).length;
      let set_width;
      let set_height;
      if(index_list == 0){
        const d_width = document.body.clientWidth;//浏览器的宽
        const c_height = document.body.clientHeight;//浏览器的高
        const b_height = (c_height - 50 - 64) / 2;//视频窗口的高
        const bt_height = (c_height - 50 - 64);//两人模式下视频窗口的高
        const b_width = b_height / 3 * 4;//视频窗口的宽 4:3
        const l_width = b_height / 9 * 16;//视频窗口的宽 16:9
        const lt_width = bt_height / 9 * 16 / 2 - 50;//两人模式下视频窗口的宽 16:9
        const v_width = (d_width - 50) / 2;//视频窗口的宽
        const ls_height = v_width / 16 * 9;//两人模式下视频窗口的宽 16:9
        const d_height = v_width / 4 * 3;//视频窗口的高
        if(idNumber == 1){
          const vs_width = (d_width - 50);//视频窗口的宽
          const ds_height = vs_width/ 16 * 9  - 64;//视频窗口的高
          const xin_width = bt_height / 9 * 16;
            set_width  = xin_width;
            set_height  = bt_height;
        }else if(idNumber == 2){
          set_width  = v_width;
          set_height  = ls_height;
        }else if(idNumber > 2){
          if(l_width < v_width){//如果16:9的宽小于视频窗口的宽
            set_width  = l_width;
            set_height  = b_height;
          }else{
            set_width  = b_width;
            set_height  = b_height;
          }
        }
      } else if(index_list == 1){
        let d_width = document.body.clientWidth;//浏览器的宽
        let c_height = document.body.clientHeight;//浏览器的高
        let v_width = (d_width - 50);//视频窗口的宽
        let d_height = v_width / 4 * 3;//视频窗口的高
        if(c_height<d_height){//浏览器的高小于视频窗口的高
          let x_height = c_height;
          let x_width = x_height / 3 * 4;
          set_width  = x_width;
          set_height  = x_height;
        }else{
          set_width  = v_width;
          set_height  = d_height;
        }
      }else if(index_list == 2){
        let c_height = document.body.clientHeight / 5 *4 - 64;//上半部分最大高度
        let d_width = document.body.clientWidth;//浏览器的宽
        let d_height = d_width / 4 * 3;//视频窗口的高
        let h_height = d_width / 16 * 9;//当前比例浏览器的高
        if(d_width/c_height > 16/9){//宽高比大于16/9
          if(h_height>c_height){
            let m_width = c_height / 9 * 16;
            console.log(m_width)
            set_width  = m_width;
            set_height  = c_height;
          }else{
            set_width  = d_width;
            set_height  = h_height;
          }
          console.log(d_width,h_height)
        }else if(d_width/c_height < 16/9 && d_width/c_height > 4/3){ //宽高比 16/9  4/3 的区间
          if(d_height>c_height){
            let m_width = c_height / 3 * 4;
            set_width  = m_width;
            set_height  = c_height;
          }else{
            let m_height = d_width / 4 * 3;
            set_width  = d_width;
            set_height  = m_height;
          }
          
        }else if(d_width/c_height < 4/3){//宽高比小于4/3
          set_width  = d_width;
          set_height  = d_height;
        }
      }
      var renderStoryboardScenes = '';
      if (this.state.index_list === 0) {
        let wrapperBox = document.getElementById("wrapperBox");
        // console.log(wrapperBox)
        if(idNumber < 5 && wrapperBox){
          wrapperBox.style.display = 'flex';
          wrapperBox.style.justifyContent = 'center';
        }
        var renderStreams = Object.entries(streams).map(item => {
          const stream = item[1].stream;
          if (stream) {
            if (!isStory) {
              // console.log(11111111111111111111111111,isStory)
              // console.log(set_width,set_height)
              return (<Stream
                stream={item[1]}
                index={this.state.index_list}
                id={stream.id}
                width={set_width}
                height={set_height}
                key={stream.id}
                streamId={item[0]}
                muteParticipants={muteParticipants}
              />);
              
            } else {
              for (var key in streamList) {
                console.log(22222222222222222222)

                const storyStreamId = streamList[localStreamId].elementID
                if (storyStreamId) {

                  return (<Stream
                    stream={item[1]}
                    id={stream.id}
                    key={stream.id}
                    width={set_width}
                    height={set_height}
                    storyStreamId={storyStreamId}
                    streamId={item[0]}
                    muteParticipants={muteParticipants}
                  />);
                }
              }
            }
          } else {
            console.log('======stream no')
          }
        }
        );
      }else if(this.state.index_list === 1){
        let wrapperBox = document.getElementById("wrapperBox");
        if(idNumber < 5 && wrapperBox){
          wrapperBox.style.display = 'flex';
          wrapperBox.style.justifyContent = 'center';
        }
        let num = 0;
        if(streams[mediaStreamId]){
            var lectureBox = (<Stream
              index={this.state.index_list}
              stream={streams[mediaStreamId]}
              id={streams[mediaStreamId].stream.id}
              width={set_width}
              height={set_height}
              key={streams[mediaStreamId].stream.id}
              streamId={streams[mediaStreamId].stream.id}
              muteParticipants={muteParticipants}
            />)
        }
        var renderStreams1 = Object.entries(streams).map(item => {
          const stream = item[1].stream;
          if(shipinLength > 2){
            translateX = 50 + (shipinLength - 2) * 200 + 'px'
          }
          if (stream) {
            if (mediaStreamId != item[0]) {
            if (!isStory) {
              return (<Stream
                stream={item[1]}
                index={this.state.index_list}
                id={stream.id}
                width={set_width}
                height={set_height}
                key={stream.id}
                streamId={item[0]}
                muteParticipants={muteParticipants}
              />);
              
            } else {
              for (var key in streamList) {
                const storyStreamId = streamList[localStreamId].elementID
                if (storyStreamId) {
                  return (<Stream
                    stream={item[1]}
                    id={stream.id}
                    key={stream.id}
                    width={set_width}
                    height={set_height}
                    storyStreamId={storyStreamId}
                    streamId={item[0]}
                    muteParticipants={muteParticipants}
                  />);
                }
              }
            }
          } else {
            console.log('======stream no')
          }
        }
        })
        // var renderStreams1 = Object.entries(streams).map(item => {
        //     if (mediaStreamId != item[0]) {
        //         num = num + 1;
        //         if (num > 1) {
        //             return;
        //         }
        //         let stream = item[1].stream;
        //         if (!stream) {
        //             return console.log('error: no stream');
        //         }
        //         const storyStreamId = streamList[localStreamId].elementID
        //         return (<Stream
        //           stream={item[1]}
        //           index={this.state.index_list}
        //           id={stream.id}
        //           width={set_width}
        //           height={set_height}
        //           key={stream.id}
        //           storyStreamId={storyStreamId}
        //           streamId={item[0]}
        //           muteParticipants={muteParticipants}
        //         />);
        //     }
        // })
        var renderStreams1_arr = _.filter(renderStreams1, (item) => { if (item !== "undefined") { return item } });
        var renderStreams1_bottom = '';
        if (renderStreams1_arr.length == 0) {
            renderStreams1_bottom = <div></div>;
        }
      }else if(this.state.index_list === 2){
        let wrapperBox = document.getElementById("wrapperBox");
        if(idNumber >=5){
          // wrapperBox.style.display = 'flex';
          // wrapperBox.style.justifyContent = 'center';
          wrapperBox.removeAttribute("style");
        }
        var lectureBox2 = Object.entries(streams).map(item => {
          const stream = item[1].stream;
          if (stream) {
            if (!isStory) {
              return (<Stream
                index={this.state.index_list}
                stream={item[1]}
                id={stream.id}
                width={set_width}
                height={set_height}
                key={stream.id}
                streamId={item[0]}
                muteParticipants={muteParticipants}
              />);
              
            } 
          }
        }
        );
        var lectureBox2_bottom = Object.entries(streams).map(item => {
          const stream = item[1].stream;
          if (stream) {
            if (!isStory) {
              return (<Stream
                index={this.state.index_list}
                stream={item[1]}
                id={stream.id+'1'}
                width={set_width}
                height={set_height}
                key={stream.id}
                streamId={item[0]}
                muteParticipants={muteParticipants}
              />);
              
            } 
          }
        }
        );
      }
    }
    //lecture
    else if (stateMode == 'lecture') {
      if (lecturerId && participant) {
        //lecturer wrap
        if (lecturerId == participant.id) {
          var renderStreams = Object.entries(streams).map(item => {
            const stream = item[1].stream;
            if (stream) {
              if (!isStory) {
                return (<Stream
                  stream={item[1]}
                  id={stream.id}
                  key={stream.id}
                  streamId={item[0]}
                  muteParticipants={muteParticipants}
                />);
              } else {
                //for begin
                for (var key in streamList) {
                  const storyStreamId = streamList[localStreamId].elementID
                  if (storyStreamId) {
                    return (<Stream
                      stream={item[1]}
                      id={stream.id}
                      key={stream.id}
                      storyStreamId={storyStreamId}
                      streamId={item[0]}
                      muteParticipants={muteParticipants}
                    />);
                  }
                }
                //for end
              }

            } else {
              console.log('====stream is undefined')
            }

          }
          );
          if (storyboard) {
            var storyboardScenes = storyboard.scenes;
            var renderStoryboardScenes = (<StoryBoardsScenes
              scenesList={storyboardScenes} />);
          } else {
            var renderStoryboardScenes = '';
          }
        } else {
          //remoteParticipants wrap
          if (storyboard) {
            var storyboardScenes = storyboard.scenes;
            var renderStoryboardScenes = (<StoryBoardsScenes
              scenesList={storyboardScenes} />);
          } else {
            var renderStoryboardScenes = '';
          }

        }
      } else {
        console.log('=====error=====:lecturerId or participant is undefined')
      }

    }

    return (
      <div className='meeting'>
        {/* {renderStoryboardScenes}

{renderStreams} */}
        <div className="jianting" id="jianting" style={{display:'none'}}>{this.props.message}</div>
        <div className={"speakers speakers_fl " + (this.state.index_list === 0 ? 'speaker_actives' : '')} >
          {renderStoryboardScenes}

          {renderStreams}                 
        </div>
        <div className={"speakers speakers_swiper " + (this.state.index_list === 1 ? 'speaker_active' : '')} style={{ width:"100vw" ,height:"calc(100vh - 64px)" ,position:"relative"}}>
          <div className="metting_bg" style={{ width:"100vw" ,height:"calc(100vh - 64px)" ,margin:"0 auto" ,overflow:'hidden'}}>
            {lectureBox}
          </div>
          <div className="metting_position" ref="move" onMouseDown={e => this.small_down(e)} style={{position:"absolute", right: translateX,bottom:translateY }}>
            <div className="metting_multiple">
            {renderStreams1}
            </div>
          </div>
          {renderStreams1_bottom}
        </div>
        <div className={"speakers speakers_swiper " + (this.state.index_list === 2 ? 'speaker_active' : '')} style={{width:'100%'}}>
          <div className="swiper-container gallery-top">
            <div className="swiper-wrapper" >
              {lectureBox2}
            </div>
            
          </div>
          <div className="swiper-container gallery-thumbs">
            <div className="swiper-wrapper" id="wrapperBox">
              {lectureBox2_bottom}
            </div>
            <div className="swiper-button-next swiper-button-white"></div>
            <div className="swiper-button-prev swiper-button-white"></div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log(state)
  return {
    streams: state.teevid.meeting.streams,
    storyboard: state.teevid.api.storyboard,
    participant: state.teevid.meeting.participant,
    streamList: state.teevid.meeting.streams,
    isStory: state.isStory,
    stateMode: state.teevid.meeting.mode || '',
    localStreamId: state.teevid.meeting.localStreamId,
    lecturerId: state.teevid.meeting.lecturerId,
    remoteParticipants: state.teevid.meeting.remoteParticipants,
    speakerActiveIndexs:state.teevid.meeting.lectureLayout,
  }
};

export default connect(mapStateToProps)(StreamWrap);