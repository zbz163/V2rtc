import React, { Component } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import _ from 'underscore';
import './ParticpantShowItem.css';
import ParticipantHideItem from './ParticipantHideItem';

class ParticipantHide extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            hideUsers: [],
        }
    }
    componentDidMount() {
        let { participants, RemoteParticipants, meetingInfo } = this.props;
        if (!participants) {
            return;
        }
        let showUsers = [];
        let namePar = participants.name;
        let nameParArr = namePar.split('@^@');
        if (nameParArr[1]) {
            let nameParLoginName = nameParArr[1].split('@');
            if (nameParLoginName[1]) {
                showUsers.push(nameParLoginName[0]);
            }
        }
        if (!RemoteParticipants) {
            return;
        }
        if (RemoteParticipants) {
            Object.entries(RemoteParticipants).map((item) => {
                let remoteParticipantItem = item[1];
                let name = remoteParticipantItem.name;
                let nameArr = name.split('@^@');
                if (nameArr[1]) {
                    let nameLoginName = nameArr[1].split('@');
                    if (nameLoginName[1]) {
                        showUsers.push(nameLoginName[0]);
                    }
                }

            })
        }
        if (!meetingInfo) {
            return;
        }
        let hideUsers = meetingInfo.users;
        for (let i = 0; i < showUsers.length; i++) {
            for (let j = 0; j < hideUsers.length; j++) {
                if (showUsers[i] == hideUsers[j].userName) {
                    hideUsers.splice(j, 1);
                    break;
                }
            }
        }
        this.setState({ hideUsers })
    }
    render() {
        let { participants, RemoteParticipants, meetingInfo } = this.props;
        console.error('==============this.props',this.props)

        if (!participants) {
            return;
        }
        let showUsers = [];
        let namePar = participants.name;
        let nameParArr = namePar.split('@^@');
        if (nameParArr[1]) {
            let nameParLoginName = nameParArr[1].split('@');
            if (nameParLoginName[1]) {
                showUsers.push(nameParLoginName[0]);
            }
        }
        // let showUsers = [participants.name];
        if (RemoteParticipants) {
            Object.entries(RemoteParticipants).map((item) => {
                let remoteParticipantItem = item[1];
                // showUsers.push(remoteParticipantItem.name);
                let name = remoteParticipantItem.name;
                let nameArr = name.split('@^@');
                if (nameArr[1]) {
                    let nameLoginName = nameArr[1].split('@');
                    if (nameLoginName[1]) {
                        showUsers.push(nameLoginName[0]);
                    }
                }
            })
        }
        if (!meetingInfo) {
            return;
        }
        let hideUsers = meetingInfo.users;
        for (let i = 0; i < showUsers.length; i++) {
            for (let j = 0; j < hideUsers.length; j++) {
                if (showUsers[i] == hideUsers[j].userName) {
                    hideUsers.splice(j, 1);
                    break;
                }
            }
        }
        return (
            <ul className="todo_list">
                {hideUsers.length > 0 &&
                    hideUsers.map((item) => (
                        <ParticipantHideItem key={item._id} item={item} />
                    ))
                }
            </ul>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        participants: state.teevid.meeting.participant,
        RemoteParticipants: state.teevid.meeting.remoteParticipants,
        meetingInfo: state.meetingInfo,
    };
}
export default connect(mapStateToProps)(ParticipantHide);