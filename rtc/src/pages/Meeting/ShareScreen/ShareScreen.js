import React, { Component } from 'react';
import { connect } from 'react-redux';
import { message } from 'antd';
import './ShareScreen.css';
import * as actions from './action.js';

class ShareScreen extends Component {
    constructor(props) {
        super(props);
        this.onClickShare = this.onClickShare.bind(this);
    }

    onClickShare() {
        let { startShareScreen, mode, participant, shareingStream, shareingStreamId, isShareingStream, isOwnShare } = this.props;
        if ((mode === "interactive") || (mode === "basic-lecture")) {
            if (startShareScreen == true) {
                if (!isOwnShare) {
                    return message.warning('请联系共享屏幕者进行关闭');
                } else {
                    if (participant && participant.streams) {
                        return this.props.onEndShareScreen({ participantId: shareingStreamId });
                    }
                    if (shareingStream && shareingStream.stream) {
                        if (!shareingStream.stream.active) {
                            console.log('shareingStreamId******** active', shareingStreamId)
                        }
                    }
                }

            } else if (startShareScreen == false) {
                var data = { userId: this.props.participantId, userName: this.props.participantName }
                this.props.onShareScreen(data);
            }
        } else if (mode === "lecture") {
            message.error('故事版模式，请先退出');
        }
    }

    render() {
        let { shareingStreamId, shareingStream, isShareingStream, isOwnShare, startShareScreen } = this.props;
        return (
            <div>
                {startShareScreen &&
                    <div className={"tab_btn " + (isOwnShare ? "" : "active")} onClick={this.onClickShare} >
                        <img src={require('../../../images/fenxiang.jpg')} alt="" />
                        <span>停止屏幕共享</span>
                    </div>
                }
                {!startShareScreen &&
                    <div className="tab_btn" onClick={this.onClickShare} >
                        <img src={require('../../../images/fenxiang.jpg')} alt="" />
                        <span>开始屏幕共享</span>
                    </div>
                }
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onShareScreen: (data) => {
            var action = actions.screen_share_start(data);
            dispatch(action);
        },

        onEndShareScreen: (data) => {
            var action = actions.screen_share_stoped(data);
            dispatch(action);
        }
    }
}

const mapStateToProps = (state) => {
    let userId = '', name = '', startShare = false, isOwnShare = false, shareingStream = null, shareingStreamId = "", isShareingStream = true;
    let participant = state.teevid.meeting.participant;
    if (state.teevid.meeting && participant) {
        userId = participant.id;
        name = participant.name;
    }

    let streams = state.teevid.meeting.streams;
    if (streams) {
        Object.entries(streams).map(item => {
            const stream = item[1];
            if (stream.hasScreen() == true) {
                startShare = true;
                shareingStream = stream;
                shareingStreamId = item[0];
                if (stream.stream) {
                    isShareingStream = stream.stream.active;
                } else {
                    isShareingStream = false;
                }
            }
        }
        );
    }
    if (startShare) {
        if (participant) {
            if (participant.streams) {
                if (participant.streams.screenStreamId) {
                    isOwnShare = true;
                }
            }
        }
    }

    return {
        participantId: userId,
        participantName: name,
        startShareScreen: startShare,
        shareingStream: shareingStream,
        shareingStreamId: shareingStreamId,
        mode: state.teevid.meeting.mode,
        participant: state.teevid.meeting.participant,
        isShareingStream: isShareingStream,
        isOwnShare: isOwnShare,
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareScreen);
