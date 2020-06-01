import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import * as Actions from '../actions/Action_meeting';
import { spawn } from 'child_process';
import StoryBoardsStreamItem from './StoryBoardsStreamItem';
import ScenesOperate from '../../StoryBoards/scenesOperate/scenesOperate';
import './StoryBoardsScenesStream.css';


class StoryBoardsScenes extends React.Component {
    constructor(props, context) {
        super(props, context);
        const { id, scenesList,slideNumber } = this.props;
    }

    render() {
        const { id, localStreamId, streamList ,slideNumber,scenesList,participant,lecturerId} = this.props;
        var scenes = scenesList[slideNumber].elements;
        const streamsVideo = streamList[localStreamId];
        let streamId = '';
        if(streamsVideo && streamsVideo.stream){
             streamId = streamsVideo.stream.id;
        }
        let participantId = "";
        if(participant){
            participantId = participant.id;
        }
        return (
            <div className={"stream streams " + (lecturerId === participantId ? "lecture" : "participant")} id={id} style={{ position: 'relative', overflow: 'hidden' }}>
                {streamId &&
                    scenes.map((item) => (
                        <StoryBoardsStreamItem
                            key={item._id}
                            item={item}
                            _id={item._id}
                            streamsVideo={streamsVideo}
                            streams = {localStreamId}
                            streamId = {streamId}
                        />
                    ))
                }
                {lecturerId === participantId && <ScenesOperate />}
                
            </div>

        );
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
    }
}
const mapStateToProps = (state) => {
    return {
        localStreamId: state.teevid.meeting.localStreamId || [],
        streamList: state.teevid.meeting.streams,
        slideNumber: state.teevid.meeting.slideNumber,
        participant:state.teevid.meeting.participant,
        lecturerId: state.teevid.meeting.lecturerId
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(StoryBoardsScenes);