import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import * as Actions from '../actions/Action_meeting';
import './StoryBoardsStreamItem.css';



class StoryBoardsStreamItem extends React.Component {
    constructor(props, context) {
        super(...arguments);
    }
    componentDidMount() {
        const { streamsVideo, streams, _id, streamId } = this.props;
        streamsVideo.play(streamId);
    }

    render() {
        const { _id, item, streams, streamId ,lecturerId,participantId} = this.props;
        return (
            <div className={"streamBox " + (lecturerId === participantId ? "lecture" : "participant")} style={{ height: `${item.style.height}`, width: `${item.style.width}`, position: 'absolute', top: `${item.position.top}%`, left: `${item.position.left}%`}}>
                {item.contentType === "video" && !item.hidden && <div
                    className='stream'
                    id={streamId} style={{ height: `${item.style.height}`, width: `${item.style.width}`, position: 'relative', zIndex: `item.position.index` }}
                >
                </div>}
                {item.contentType === "text" && <p className="scene-wrapper__text__font_size__50 scene-wrapper__text__alignment__center" type="text" style={{ height: `${item.style.height}`, width: `${item.style.width}`, position: 'relative', zIndex: `item.position.index` }}>{item.content} </p>}
                {item.contentType === "image" && <img src={item.content} alt="" style={{ height: `${item.style.height}`, width: `${item.style.width}`, position: 'relative', zIndex: `item.position.index` }} />}
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
        participantId:state.teevid.meeting.participant.id,
        lecturerId: state.teevid.meeting.lecturerId
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryBoardsStreamItem);