import React, { PropTypes } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import './ParticpantShowItem.css'

class ParticpantShowItem extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.kickParticipant = this.kickParticipant.bind(this);
        this.remoteMute = this.remoteMute.bind(this);
        this.remoteMuteOver = this.remoteMuteOver.bind(this);
        this.state = {
            muteVideoShow: false,
            muteAudioShow: false,
            realName:"",
            loginName:"",
        }
    }
    componentDidMount() {
        let { muteVideoShow, muteAudioShow ,realName,loginName} = this.state;
        let { remoteParticipants, _id,name } = this.props;
        let nameArr = name.split('@^@');
        if(nameArr[0]){
            realName = nameArr[0];
        }
        if(nameArr[1]){
            loginName = nameArr[1];
        }else{
            loginName = "匿名用户";
        }
        this.setState({realName,loginName})
        console.log('=======name',name)
        if (remoteParticipants && remoteParticipants.length > 0) {
            if (remoteParticipants[_id]) {
                if (remoteParticipants[_id].status.mute.video.byModerator || remoteParticipants[_id].status.mute.video.state) {
                    muteVideoShow = true;
                }
                if (remoteParticipants[_id].status.mute.audio.byModerator || remoteParticipants[_id].status.mute.audio.state) {
                    muteAudioShow = true;
                }
                this.setState({ muteVideoShow, muteAudioShow });
            }
        }
    }
    kickParticipant() {
        let { _id, room } = this.props;
        this.props.kickParticipant({ participantId: _id, roomId: room._id });
    }
    remoteMute(e) {
        let { _id , videoDevices, audioDevices, account, meetingInfo} = this.props;
        let { muteVideoShow, muteAudioShow } = this.state;
        let device = event.target.getAttribute("data-type");
        let stateMute = event.target.getAttribute("data-typeboolean");
        //上报操作状态
        let userID = account.user.userInfo;//登录id
        let playID;//赋值id
        let meetingID = meetingInfo.meetingID;//会议id
        if(userID){
            playID = account.user.userInfo.userID;
        }else{
            playID = window.localStorage.AnonymousUserID;//匿名用户id
        }
        let id = new Date().getTime().toString();
        let from = playID;
        let to = meetingID;
        let xmlns = 'v2rtc:meeting:dealdevice_m';
        let micID = audioDevices[0].deviceId;
        let camID = videoDevices[0].deviceId;
        if (stateMute === "true") {
            stateMute = true;
            if (device === "video") {
                muteVideoShow = true;
                let deal = 'closeCam';
                sendMessageDealdevice(id, from, to, xmlns, meetingID, deal, camID, micID);
            }
            if (device === "audio") {               
                muteAudioShow = true;
                let deal = 'closeMic';
                sendMessageDealdevice(id, from, to, xmlns, meetingID, deal, camID, micID);
            }
        }
       
        this.setState({ muteVideoShow, muteAudioShow });
        let data = { participantId: _id, device, state: stateMute };
        console.log('====DATA',data);
        this.props.remoteMute(data);
    }
    remoteMuteOver(e){
        let { muteVideoShow, muteAudioShow } = this.state;
        let { _id , videoDevices, audioDevices, account, meetingInfo} = this.props;
        let device = event.target.getAttribute("data-type");
        let stateMute = event.target.getAttribute("data-typeboolean");
        //上报操作状态
        let userID = account.user.userInfo;//登录id
        let playID;//赋值id
        let meetingID = meetingInfo.meetingID;//会议id
        if(userID){
            playID = account.user.userInfo.userID;
        }else{
            playID = window.localStorage.AnonymousUserID;//匿名用户id
        }
        let id = new Date().getTime().toString();
        let from = playID;
        let to = meetingID;
        let xmlns = 'v2rtc:meeting:dealdevice_m';
        let micID = audioDevices[0].deviceId;
        let camID = videoDevices[0].deviceId;
        if (stateMute === "false") {
            stateMute = false;
            if (device === "video") {
                let deal = 'openCam';
                sendMessageDealdevice(id, from, to, xmlns, meetingID, deal, camID, micID);
                muteVideoShow = false;
            }
            if (device === "audio") {
                muteAudioShow = false;
                let deal = 'openMic';
                sendMessageDealdevice(id, from, to, xmlns, meetingID, deal, camID, micID);
            }
        }
        this.props.remoteMuteOver({ accepted: true, targetId: _id });
    }
    render() {
        let { changeArr, name, avatar, isRoomOwner, participantId, _id, remoteParticipants } = this.props;
        let { muteVideoShow, muteAudioShow,realName,loginName } = this.state;
        console.error('============pr',this.props)
        changeArr.map((item) => {
            if (item._id === _id) {
                muteVideoShow = item.muteVideoShow;
                muteAudioShow = item.muteAudioShow;
            }
        })
        return (
            <li className="todo-item">
                {!isRoomOwner &&
                    <div className="list_Box">
                        <div className="list_portrait"><img src={avatar} alt="" /></div>
                        <Tooltip placement="topLeft" title={loginName}>
                        <div className="list_name">
                            <div className="list_names">{realName}</div>
                            <div className="list_audio">
                                <img src={require('../../../images/audio.jpg')} alt="" />
                            </div>
                        </div>
                        </Tooltip>
                        
                    </div>
                }
                {(isRoomOwner && participantId === _id) &&
                    <div className="list_Box">
                        <div className="list_portrait"><img src={avatar} alt="" /></div>
                        
                        <Tooltip placement="topLeft" title={loginName}>
                        <div className="list_name">
                            <div className="list_names">{realName}</div>
                            <div className="list_audio">
                                <img src={require('../../../images/audio.jpg')} alt="" />
                            </div>
                        </div>
                        </Tooltip>
                        
                    </div>
                }
                {(isRoomOwner && participantId !== _id) &&
                    <div className="list_Box">
                        <div className="list_portrait"><img src={avatar} alt="" /></div>
                        <Tooltip placement="topLeft" title={loginName}>
                        <div className="list_name">
                            <div className="list_names">
                                <div>{realName}</div>
                                <div>
                                    {!muteVideoShow ?
                                        <img className="moderator_operate" onClick={this.remoteMute} data-type="video" data-typeboolean="true" src={require('../../../images/video.svg')} alt="" />
                                        :
                                        <img className="moderator_operate" onClick={this.remoteMuteOver} data-type="video" data-typeboolean="false" src={require('../../../images/muteVideo.svg')} alt="" />
                                    }
                                    {!muteAudioShow ?
                                        <img className="moderator_operate" onClick={this.remoteMute} data-type="audio" data-typeboolean="true" src={require('../../../images/audio.svg')} alt="" />
                                        :
                                        <img className="moderator_operate" onClick={this.remoteMuteOver} data-type="audio" data-typeboolean="false" src={require('../../../images/muteAudio.svg')} alt="" />
                                    }
                                    <img onClick={this.kickParticipant} className="moderator_operate" src={require('../../../images/error.svg')} alt="" />
                                </div>
                            </div>
                            <div className="list_audio">
                                <img src={require('../../../images/audio.jpg')} alt="" />
                            </div>
                        </div>
                        </Tooltip>
                        
                    </div>
                }
            </li>
        );
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        kickParticipant: (data) => {
            var action = actions.kickParticipant(data);
            dispatch(action);
        },
        remoteMute: (data) => {
            var action = actions.remoteMute(data);
            console.log('====remoteMute action',action);
            dispatch(action);
        },
        remoteMuteOver:(data)=>{
            var action = actions.remoteMuteOver(data);
            console.log('====remoteMuteOver action',action);
            dispatch(action);
        }
    }
};
const mapStateToProps = (state) => {
    // console.log('****************state*********',state)
    let remoteParticipants = state.teevid.meeting.remoteParticipants;
    let arr = [];
    let showRemotePart = {};
    if (remoteParticipants) {
        Object.entries(remoteParticipants).map(item => {
            if (item) {
                const remoteParticipant = item[1];
                let muteVideoShow;
                let muteAudioShow;
                if (remoteParticipant.status.mute.video.byModerator || remoteParticipant.status.mute.video.state) {
                    muteVideoShow = true;
                } else {
                    muteVideoShow = false;
                }
                if (remoteParticipant.status.mute.audio.byModerator || remoteParticipant.status.mute.audio.state) {
                    muteAudioShow = true;
                } else {
                    muteAudioShow = false;
                }
                let data = { muteVideoShow, muteAudioShow, _id: item[0] }
                arr.push(data);
                if (remoteParticipant.name !== "teevid_cef_streaming") {
                    showRemotePart[item[0]] = item[1];
                }
            }
        }
        );
    }
    return {
        changeArr: arr,
        room: state.teevid.meeting.room,
        // remoteParticipants: state.teevid.meeting.remoteParticipants,
        remoteParticipants: showRemotePart,
        account: state.account,
        meetingInfo: state.meetingInfo,
        videoDevices: state.teevid.api.videoDevices,
        audioDevices: state.teevid.api.audioDevices,
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ParticpantShowItem);