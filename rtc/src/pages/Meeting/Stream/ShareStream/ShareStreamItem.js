import React, { Component } from 'react';
import { connect } from 'react-redux';
// import './Stream.css'
import './ShareStreamItem.css';
class ShareStreamItem extends Component {
    componentDidMount() {
        let { id, stream ,width,height} = this.props;
        stream.play(id);
    }
 
    render() {
        let { id ,width,height} = this.props;
        let x_width = width;
        let x_height = height;
        console.log(x_width,x_height)

        return (
            <div className="streamBox_share" style={{width:x_width,height:x_height}}>
                <div className="stream" id={id} style={{"border":"none","width":"100%","height":"100%",marginRight:'30px'}}></div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        // streams: state.teevid.meeting.streams,
    }
};


export default connect(mapStateToProps)(ShareStreamItem);