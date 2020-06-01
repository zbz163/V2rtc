import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from './action.js';
import './scenesOperate.css';
class ScenesOperate extends React.Component {
    constructor(props, context) {
        super(...arguments);
        this.prev = this.prev.bind(this);
        this.add = this.add.bind(this);
        this.outLectureMode = this.outLectureMode.bind(this);
    }

    prev(event){
        const {slideNumber,slideTotal} = this.props;
        if(slideNumber > 0){
            let number = slideNumber - 1;
            this.props.slideNumberChanged({number});
        }
    }
    add(event){
        const {slideNumber,slideTotal} = this.props;
        if((slideTotal - 1) > slideNumber){
            let number = slideNumber + 1;
            this.props.slideNumberChanged({number});
        }
    }
    outLectureMode(){
        const {streams,localStreamId} = this.props;
        const stream = streams[localStreamId];
        const id = streams[localStreamId].stream.id;
        stream.stop();
        const {storyboardId} = this. props;
        this.props.setMode({mode:'interactive',stbId:storyboardId});
    }
    render() {
        let isLeft = 0;
        let isRight = 0;
        const {slideNumber, isStory, slideTotal} = this.props;
        if(slideNumber == 0){
            if(slideTotal > 1){
                isRight = 1;
            }
        }else{
            isLeft = 1;
            if((slideTotal - 1) > slideNumber){
                isRight = 1;
            }
        }
        return (
             <ul className="operate_ul">
             {/* <li className="operate_li" ><div ><img src={require('../../../../images/play.png')} alt=""/></div> </li> */}
             <li className="operate_li" onClick={this.outLectureMode}><div ><img  src={require('../../../../images/out.png')} alt=""/></div> </li>
             <li className={"operate_li " + (isLeft === 0 ? "active" : "")} onClick={this.prev}><div><img  src={require('../../../../images/leftArrow.png')} alt=""/></div> </li>
             <li className={"operate_li " + (isRight === 0 ? "active" : "")} onClick={this.add}><div><img  src={require('../../../../images/rightArrow.png')} alt=""/></div> </li>
         </ul>
        );
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        setMode: (data) => {
            var action = actions.setMode(data);
            dispatch(action);
        },
        slideNumberChanged:(data)=>{
            var action = actions.slideNumberChanged(data);
            dispatch(action);
        }
    }
}
const mapStateToProps = (state) => {
    return {
        slideNumber: state.teevid.meeting.slideNumber,
        isStory: state.isStory,
        slideTotal:state.teevid.api.storyboard.scenes.length,
        storyboardId:state.teevid.meeting.storyboardId,
        streams:state.teevid.meeting.streams,
        localStreamId:state.teevid.meeting.localStreamId,
        slideNumber1:state.slideNumber,
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ScenesOperate);