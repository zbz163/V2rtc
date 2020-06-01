import React, { Component } from 'react';
import './MeetingCharmanPwd.css';
import { Form, Icon } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import md5 from 'md5';
import axios from "axios";
import { storageUtils } from '../../../utils';
class MeetingCharmanPwd extends Component {
    constructor(props) {
        super(props);
        this.joinMeeting1 = this.joinMeeting1.bind(this);
        this.pinChange = this.pinChange.bind(this);
        this.moderator_close = this.moderator_close.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.state = {
            pin: "",
            username: "",
            showModel: 0,
        }
    }
    componentWillMount() {
        let { meetingRoomInfo } = this.props;
        console.log('======meetingRoomInfo', meetingRoomInfo)
        //1:有密码 2没密码
        if (meetingRoomInfo.normalPwd) {
            this.setState({ showModel: 1 })
        } else {
            this.setState({ showModel: 2 })
        }
    }
    enterMeeting(userNick,that) {
        let {meetingRoomInfo} = that.props;
        let data = { userNick, meetingID:meetingRoomInfo.meetingID };
        axios.post('/rtc/api/user/meetings/enterMeeting', data).then((res) => {
            if (res.status === "ERROR") {
                return message.error(res.error.message);
            }else if(res.status === 'OK'){
                let logID=res.result;
                storageUtils.SetLogID(logID);
                that.props.saveLogID({logID});
            }
        })
    }
    pinChange(event) {
        this.setState({
            pin: event.target.value
        });
    }
    nameChange(event) {
        this.setState({
            username: event.target.value
        });
    }
    joinMeeting1() {
        let that = this;
        let { pin, username, showModel } = this.state;
        let { meetingRoomInfo, CompanyInfo } = this.props;
        var len = 0;
        for (var i = 0; i < username.length; i++) {
            var a = username.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        var regEn = /[&<>'"、,]/im;
        if(regEn.test(username)){
            return document.getElementById("meeting_charman_pwd_pin_warn").innerHTML = '不允许输入&<>’"、,字符';
        }else if(len > 24){
            return document.getElementById("meeting_charman_pwd_pin_warn").innerHTML = global.personal.writtenWords;
        }else if (!username) {
            return document.getElementById("meeting_charman_pwd_pin_warn").innerHTML = '昵称不能为空';
        }
        console.error('=====joinMeeting1');
        // let username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
        if (showModel == 1) {
            let data = { meetingID: meetingRoomInfo.meetingID, normalPwd: md5(pin) };
            axios.post("/rtc/api/user/meetings/check/meetingNormalPwd", data).then((res) => {
                if (res.status === "ERROR") {
                    if (document.getElementById("meeting_charman_pwd_pin_warn")) {
                        return document.getElementById("meeting_charman_pwd_pin_warn").innerHTML = res.error.message;
                    }
                } else if (res.status === "OK") {
                    (async () => {
                        await storageUtils.SetNickName(username);
                        await storageUtils.SetUserRoomID(meetingRoomInfo.roomID);
                        await that.props.saveCompany({ CompanyInfo });
                        await that.enterMeeting(username,that);
                        await that.props.joinMeeting({ meetingInfo: meetingRoomInfo });
                        await that.props.connect({ username, room: meetingRoomInfo.roomID, pin: res.result.normalPwd, connectAnyway: true });
                    })()
                }
            })
        } else if (showModel == 2) {
        console.error('=====joinMeeting1 username',username);
            (async () => {
                await storageUtils.SetNickName(username);
                await storageUtils.SetUserRoomID(meetingRoomInfo.roomID);
                await that.props.saveCompany({ CompanyInfo });
                await that.enterMeeting(username,that);
                await that.props.joinMeeting({ meetingInfo: meetingRoomInfo });
                await that.props.connect({ username, room: meetingRoomInfo.roomID, pin: "", connectAnyway: true });
            })()
        }

    }
    moderator_close() {
        this.props.hindMeetingCharmanPwd(false);
    }
    render() {
        let { meetingRoomInfo } = this.props;
        let { showModel } = this.state;
        // const { getFieldDecorator } = this.props.form;

        return (
            <div className="model meetingCharmanPwd" id="meeting_charman_pwd">
                <div className="moderator_close" onClick={this.moderator_close}>
                    <Icon type="close" />
                </div>
                <div className="moderator_content">
                    <div className="moderator_wrap_box">
                        {showModel == 1 &&
                            <div className="box">
                                <div className="moderator_title">入会</div>
                                <div className="username">
                                    <label>用户名称<span>&thinsp;*</span></label>
                                    <div className="username-ip">
                                        <input type="text" className="name" onChange={this.nameChange} />
                                    </div>
                                </div>
                                <div className="password">
                                    <label>密码<span>&thinsp;*</span></label>
                                    <div className="password-ip">
                                        <input type="password" className="pin" onChange={this.pinChange} autoComplete="off" />
                                    </div>
                                </div>
                                <div style={{ paddingTop: 10 }}>
                                    <span className="warning" id="meeting_charman_pwd_pin_warn" style={{ color: 'red' }}></span>
                                </div>
                                <div className="btn-login" onClick={this.joinMeeting1}>
                                    <span>确定</span>
                                </div>
                            </div>
                        }
                        {showModel == 2 &&
                            <div className="box">
                                <div className="moderator_title">入会</div>
                                <div className="username">
                                    <label><span style={{color:'red',fontSize:'18px'}}>*&thinsp;</span>用户名称</label>
                                    <div className="username-ip">
                                        <input type="text" className="name" onChange={this.nameChange} />
                                    </div>
                                </div>
                                <div style={{ paddingTop: 10 }}>
                                    <span className="warning" id="meeting_charman_pwd_pin_warn" style={{ color: 'red' }}></span>
                                </div>
                                <div className="btn-login" onClick={this.joinMeeting1}>
                                    <span>确定</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        connect: (data) => {
            var action = actions.connect(data);
            dispatch(action);
        },
        joinMeeting: (data) => {
            var action = actions.joinMeeting(data);
            dispatch(action);
        },
        saveCompany: (data) => {
            var action = actions.saveCompany(data);
            dispatch(action);
        },
        saveLogID: (data) => {
            var action = actions.saveLogID(data);
            dispatch(action);
        },
    }
}
// export default connect(mapStateToProps, mapDispatchToProps)(MeetingCharmanPwd);

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(MeetingCharmanPwd));

