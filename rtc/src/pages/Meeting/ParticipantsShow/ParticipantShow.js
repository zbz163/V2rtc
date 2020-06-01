import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { message } from 'antd';

import ParticpantShowItem from './ParticpantShowItem';
import ParticipantHide from './ParticipantHide';

const ParticipantShow = ({ Participants, RemoteParticipants }) => {
    var ParticipantsList = [];
    let roomOwnList = [];
    let isRoomOwner = false;
    let participantId = "";
    if (Participants || RemoteParticipants) {
        if (Participants) {
            if (Participants.isRoomOwner) {
                isRoomOwner = true;
            }
            participantId = Participants.id;
            ParticipantsList = [Participants]
            if (RemoteParticipants) {
                Object.entries(RemoteParticipants).map(item => {
                    item.time = new Date().toUTCString();
                    ParticipantsList.push.apply(ParticipantsList, [item[1]])
                })
            } else {
                message.error('请先登录');
                return this.props.history.push('/login');
                // console.log('no remote')
            }
        } else {

        }
    } else {
        // console.log('ParticipantsList is null')
    }
    ParticipantsList = ParticipantsList || []
    return (
        <div>
            <ul className="todo_list">
                {
                    ParticipantsList.map((item) => (
                        <ParticpantShowItem
                            key={item._id}
                            name={item.name}
                            avatar={item.avatar}
                            _id={item._id}
                            participantId={participantId}
                            isRoomOwner={isRoomOwner}
                        />

                    ))
                }
            </ul>
            {Participants && Participants.id &&
                <ParticipantHide />
            }
        </div>

    )
}

const mapStateToProps = (state) => {
    let remoteParticipants = state.teevid.meeting.remoteParticipants;
    let showRemotePart={};
    if (remoteParticipants) {
        Object.entries(remoteParticipants).map(item => {
            if (item) {
                const remoteParticipant = item[1];
                if(remoteParticipant.name !== "teevid_cef_streaming"){
                    showRemotePart[item[0]] = item[1];
                }
            }
        }
        );
    }
    return {
        Participants: state.teevid.meeting.participant,
        // RemoteParticipants: state.teevid.meeting.remoteParticipants
        RemoteParticipants:showRemotePart,
    };
}

export default connect(mapStateToProps)(ParticipantShow);