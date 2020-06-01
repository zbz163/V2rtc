import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from './action.js';
import { message } from 'antd';

class StoryBoardsItem extends React.Component {
    constructor(props, context) {
        super(...arguments);
        this.showStory = this.showStory.bind(this);
    }
    showStory(event) {
        // let { lecturerId, participant, isRoomOwner, startShare, mode } = this.props;
        let { lecturerId, startShare, participant } = this.props;
        let participantId, isRoomOwner, mode;
        if (participant) {
            participantId = participant.id;
            isRoomOwner = participant.isRoomOwner;
            mode = participant.mode;
        }

        if (!isRoomOwner) {
            return message.error('你不是当前房间的主持人');
        }
        if (startShare) {
            return message.error('正在屏幕共享，请先退出屏幕共享');
        }
        if (mode === "basic-lecture") {
            return message.error('正在主持人模式，请先退出主持人模式');
        }
        if (lecturerId && lecturerId.length > 0) {
            if (lecturerId === participantId) {
                const stbId = event.target.getAttribute("data-stbid");
                var data = { mode: "lecture", stbId };
                this.props.showStory(data);
            } else {
                return message.error('你不是当前房间的主持人');
            }
        } else {
            const stbId = event.target.getAttribute("data-stbid");
            var data = { mode: "lecture", stbId };
            this.props.showStory(data);
        }
    }

    render() {
        // const {_id, title, completed, scenes,thumbnail } = this.props;
        const { _id, title, scenes, thumbnail } = this.props;

        return (
            <li>
                <img className='storyBoardsItemImg' data-stbid={_id} src={thumbnail} style={{ width: '200', height: '150' }} onClick={this.showStory} />
                <p className="storyboard_name">{title}</p>
                <p className="storyboard_scene">{scenes}场景</p>
            </li>
        );
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        showStory: (data) => {
            var action = actions.showStory(data);
            dispatch(action);
        },
    }
}
const mapStateToProps = (state) => {
    let startShare = false;
    let streams = state.teevid.meeting.streams;
    if (streams) {
        Object.entries(streams).map(item => {
            const stream = item[1];
            if (stream.hasScreen() == true) {
                startShare = true;
            }
        }
        );
    }
    return {
        participant: state.teevid.meeting.participant,
        lecturerId: state.teevid.meeting.lecturerId,
        startShare: startShare,
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryBoardsItem);