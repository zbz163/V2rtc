
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import './BasicLectureStream.css'

class Stream extends Component {

    componentDidMount() {
        let { id, stream ,speakerActiveIndex} = this.props;
        let videoShow = stream.videoMuted;
        stream.play(id);
    }
    
    render() {
        let { id,speakerActiveIndex } = this.props;
        return (
            <div className="streamBox" style={{border:'2px solid #666',overflow:'hidden'}}>
                <div className="stream" id={id} style={{"border":"none","width":"100%","height":"100%"}}></div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        streams: state.teevid.meeting.streams,
    }
};


export default connect(mapStateToProps)(Stream);