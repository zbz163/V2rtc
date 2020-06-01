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
  }
 
  componentDidMount() {
    const { id, stream , index,streams,width,height} = this.props;
    stream.play(id);
    this.setState({
      set_width:width,
      set_height:height
    })
   
  }
 

  render() {
    const { id, streams, muteParticipants, streamId ,videoDevices,localStreamId,width,height} = this.props;
    let set_width = width;
    let set_height = height;

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
          <div className="stream streams" id={id} style={{ width: set_width, height: set_height }}></div>
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