import React, { Component } from 'react';
import './LoginPanel.css';
import { Form, Icon, message } from 'antd';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import * as actions from '../action.js';
import md5 from 'md5';
import { thisExpression } from '@babel/types';
import axios from 'axios';
import { storageUtils } from '../../../../utils';

class LoginPanel extends Component {
    constructor(props) {
        super(props);
        this.nameChange = this.nameChange.bind(this);
        this.pwdChange = this.pwdChange.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.signin = this.signin.bind(this);
        this.moderatorRegisterShow = this.moderatorRegisterShow.bind(this);
        this.moderator_close = this.moderator_close.bind(this);
        this.moderatorRegister = this.moderatorRegister.bind(this);
        this.pinChange = this.pinChange.bind(this);
        this.logoutModerator = this.logoutModerator.bind(this);
        this.state = {
            loginpanel: 'none',
            name: '',
            password: '',
            outSystemShow: false,
            pin: "",
            e_show: 'block',
            e_hide: 'none',
            svgCode: {},
        }
    }
    componentWillReceiveProps(nextProps) {
        var user_operate = document.getElementById("user_operate");
        if (nextProps.style.display == 'none') {
            if (user_operate.classList.contains('active')) {
                this.setState({
                    outSystemShow: false,
                    panel: 'none'
                })
                if (this.state.panel == undefined && nextProps.style.display == 'none') {
                    this.setState({
                        outSystemShow: false,
                        panel: 'block'
                    })
                }
                if (this.state.panel == 'none') {
                    this.setState({
                        outSystemShow: false,
                        panel: 'block'
                    })
                }
                if (this.state.panel == 'block') {
                    this.setState({
                        outSystemShow: !false,
                        panel: 'none'
                    })
                }
            } else if (!user_operate.classList.contains('active')) {
                this.setState({
                    outSystemShow: false,
                    panel: 'block'
                })
            }
        } else {
            if (user_operate.classList.contains('active')) {
                this.setState({
                    outSystemShow: !false,
                })
            } else {
                this.setState({
                    outSystemShow: false,
                })
            }

        }
    }
    moderator_close() {
        document.getElementById('moderator_pwd').style.display = "none";

    }
    moderatorRegisterShow() {
        document.getElementById('moderator_pwd').style.display = "block";
        console.log('--------------moderatorRegisterShow')
        document.getElementById("PinWarn").innerHTML = '';
        let outSystemShow = this.state.outSystemShow;
        this.setState({ outSystemShow: !outSystemShow });
    }
    moderatorRegister() {
        let that = this;
        let pin = this.state.pin;
        let { meetingInfo } = this.props;
        let { remoteParticipants , account} = this.props;
        let roomOwnerHas = false;
         //上报操作状态
         let userID = account.user.userInfo;//登录id
         let playID;//赋值id
         let meetingID = meetingInfo.meetingID;//会议id
         console.log(this.props)
         if(userID){
             playID = account.user.userInfo.userID;
         }else{
             playID = window.localStorage.AnonymousUserID;//匿名用户id
         }
         let id = new Date().getTime().toString();
         let from = playID;
         let to = meetingID;
         let xmlns = 'v2rtc:meeting:moderator';
        if (remoteParticipants) {
            console.log(remoteParticipants)
            Object.entries(remoteParticipants).map(item => {
                if (item) {
                    const remoteParticipant = item[1];
                    console.log(remoteParticipant)
                    if (remoteParticipant.isRoomOwner) {
                        console.log(remoteParticipant.isRoomOwner)
                        roomOwnerHas = true;
                    }
                }
            });
        }
        // if (roomOwnerHas) {
        //     that.setState({ pin: '' });
        //     return document.getElementById("PinWarn").innerHTML = '已存在主持人';
        // }
        let deal = '1';
        let charmanPws = pin;
        let socket;
        socket = createWebSocket(socketCluster);
        sendMessageModerator(id, from, to, xmlns, meetingID, deal, charmanPws);
        console.log('***********申请成为主持人',1111111111111)

        setTimeout(function(){
            let dataName = datas;
            console.log(dataName)
            if (meetingInfo && meetingInfo.meetingID) {
                let data = { meetingID: meetingInfo.meetingID, charmanPwd: md5(pin) }
                let MeetingPin= md5(pin);
                console.log("=============MeetingPin",MeetingPin);
                axios.post('/rtc/api/user/meetings/check/meetingCharmanPwd', data).then((res) => {
                    if(res.status == 'ERROR'){
                        return document.getElementById("PinWarn").innerHTML = '主持人密码错误';
                    }else if(xmlns == 'v2rtc:meeting:moderator' && dataName.data.success == true){
                        (async () => {
                            await storageUtils.SetMeetingPin(MeetingPin);
                            const a = await storageUtils.GetMeetingPin();
                            await that.props.moderatorRegister({ pin: res.result.charmanPwd });
                            await that.setState({ pin: '' });
                            let deal = '2';
                            let charmanPws = pin;
                            sendMessageModerator(id, from, to, xmlns, meetingID, deal, charmanPws);
                        })()
                    }else{
                        if (document.getElementById("PinWarn")) {
                            return document.getElementById("PinWarn").innerHTML = '主持人已存在';
                        }
                    }
                })
            } else {
                if (document.getElementById("PinWarn")) {
                    document.getElementById("PinWarn").innerHTML = "请先登录";
                }
            }
        },100)
    }
    pinChange(event) {
        this.setState({
            pin: event.target.value
        })
    }
    signin() {
        const { loginState } = this.props;
        let outSystemShow = this.state.outSystemShow;
        if (loginState === "1") {
            this.setState({ outSystemShow: !outSystemShow })
        } else {
            document.getElementById('login_box').style.display = "block";
            // $(".signin_box").show();
        }
    }
    change = () => {
        // this.props.callback(this.state.loginpanel);
        document.getElementById('login_box').style.display = "none";
    }
    pwdChange(event) {
        this.setState({
            password: event.target.value
        });
    }

    nameChange(event) {
        this.setState({
            name: event.target.value
        });
    }
    async login() {
        let that = this;
        let { name, password } = this.state;
        let { remoteParticipants , account} = this.props;
        let roomOwnerHas = false;
        console.log('77777777777777777777777777',this.props)
        if (!name.trim() || !password.trim()) {
            document.getElementById("warn").innerHTML = "账号或密码不能为空";
        } else {
            await axios.get('/rtc/api/misc/svgCode').then(res => {
                this.setState({ svgCode: res.result });
                // let { userName, userPwd } = userInfo;
                let { svgCodeID } = res.result;
                let svgVerifyCode = "";
                let expireMMSeconds = 1000 * 3600 * 24;
                password = md5(password);
                if (name.indexOf("@") >= 0) {
                    var nameBox = name.split('@');
                    let data = { userName: nameBox[0], accountName: nameBox[1], svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: false };
                    axios.post('/rtc/api/misc/user/login', data)
                        .then(res => {
                            if (res.status === "ERROR") {
                                (async () => {
                                    await storageUtils.SetUserPwd('');
                                })()
                            } else if (res.status === "OK") {
                                (async () => {
                                    await storageUtils.SetUserName(name);
                                    await storageUtils.SetUserPwd(password);
                                    await storageUtils.SetUserAccount('');
                                    await storageUtils.SetUserAccountPwd('');
                                    await that.props.login({ name: md5(name), password: password });
                                    await that.props.loginUser({ accessToken: res.result.accessToken, companyLogoUrl: res.result.companyLogoUrl, companyName: res.result.companyName, userInfo: res.result.userInfo });
                                    await that.setState({ name: '', password: '' });
                                })()
                            }
                        })
                } else {
                    document.getElementById("warn").innerHTML = "账号不存在";
                    // let data = { accountName: name, svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: false };
                    // axios.post('/rtc/api/misc/account/login', data)
                    //     .then(res => {
                    //         if (res.status === "ERROR") {
                    //             (async () => {
                    //                 await storageUtils.SetUserAccountPwd('');
                    //             })()
                    //         } else if (res.status === "OK") {
                    //             (async () => {
                    //                 await storageUtils.SetUserAccount(name);
                    //                 await storageUtils.SetUserAccountPwd(password);
                    //                 await storageUtils.SetUserName('');
                    //                 await storageUtils.SetUserPwd('');
                    //                 await that.props.loginAccount({ accountToken: res.result.accessToken, accountInfo: res.result.accountInfo });
                    //                 await that.setState({ name: '', password: '' });
                    //             })()
                    //         }
                    //     })
                }
                document.getElementById("signin_name").value = '';
                document.getElementById("signin_password").value = '';
            })
        }
    }
    logout() {
        let that = this;
        let { push } = that.props;
        (async () => {
            await storageUtils.SetUserAccountPwd('');
            await storageUtils.SetUserPwd('');
            await that.props.logout();
            await that.props.disConnected();
            // await this.setState({ outSystemShow: false });
            await push('/login');
        })()

    }
    show() {
        const signin_password = document.getElementById("signin_password");
        if (signin_password.type == "text") {
            signin_password.type = "password";
            this.setState({ e_hide: 'none', e_show: 'block' })
        } else {
            signin_password.type = "text";
            this.setState({ e_hide: 'block', e_show: 'none' })
        };
    }
    logoutModerator() {
        let that = this;
        console.log('=============logoutModerator');
        let roomId, participantId;
        let { participant, push , account , meetingInfo} = this.props;
        if (participant) {
            if (participant._id) {
                participantId = participant._id;
            }
            if (participant.room) {
                if (participant.room._id) {
                    roomId = participant.room._id;
                }
            }
        }
        let outSystemShow = this.state.outSystemShow;
        let { isLive } = this.props;
        if (isLive) {
            // that.setState({ isLive: false });
            that.props.stopStreaming();
            storageUtils.SetLiveID("");
            that.props.setFalseIsLive();
        }
        this.setState({ outSystemShow: !outSystemShow });
        let data = { roomId, participantId, pin: "" };
        this.props.logoutModerator(data);


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
         let xmlns = 'v2rtc:meeting:moderator';
         let deal = '0';
         sendMessageModerator(id, from, to, xmlns, meetingID, deal);
    }
    render() {
        let { loginState, moderator, isOwner } = this.props;
        console.log(isOwner)
        let { outSystemShow } = this.state;
        if (loginState == "1") {
            if (document.getElementById('login_box')) {
                if (document.getElementById('login_box').style) {
                    document.getElementById('login_box').style.display = "none";
                }
            }
            if (document.getElementById("warn")) {
                document.getElementById("warn").innerHTML = ''
            }
        } else if (loginState == "2") {
            if (document.getElementById("warn")) {
                document.getElementById("warn").innerHTML = '账号或密码错误，请重新输入';
            }
        }
        if (moderator == '1') {
            if (document.getElementById('moderator_pwd')) {
                if (document.getElementById('moderator_pwd').style) {
                    document.getElementById('moderator_pwd').style.display = "none";
                }
            }
            if (document.getElementById("PinWarn")) {
                document.getElementById("PinWarn").innerHTML = ''
            }
        } else if (moderator == '2') {
            document.getElementById("PinWarn").innerHTML = "主持人密码错误";
        }
        return (
            <div className="renshu" >
                <img src={require('../../../../images/avatar.jpg')} alt="" onClick={this.signin} />
                <div id="user_operate" className={"user_operate " + (outSystemShow ? "active" : "")} >
                    {moderator !== "1" &&
                        < div className="out_system" onClick={this.moderatorRegisterShow}>
                            输入主持人密码
                        </div>
                    }
                    {moderator == "1" && !isOwner &&
                        < div className="out_system" onClick={this.moderatorRegisterShow}>
                            输入主持人密码
                        </div>
                    }
                    {isOwner &&
                        < div className="out_system" onClick={this.logoutModerator}>
                            退出主持人
                        </div>
                    }
                    <div className="out_system" onClick={this.logout}>
                        退出系统
                    </div>
                </div>
                <div className="signin_box" id="login_box">
                    <div className="signin_close" >
                        <Icon type="close" onClick={this.change} />
                    </div>
                    <div className="signin_content">
                        <div className="content_box">
                            <div className="box">
                                <div className="logo">
                                    <img src="./images/logo.png" alt="" />
                                </div>
                                <div className="login-title">登录</div>
                                <div className="username">
                                    <label>用户名称<span>&thinsp;*</span></label>
                                    <div className="username-ip">
                                        <input type="text" className="name" onChange={this.nameChange} id="signin_name"/>
                                    </div>
                                </div>
                                <div className="password">
                                    <label>密码<span>&thinsp;*</span></label>
                                    <div className="password-ip">
                                        <input type="password" className="password" onChange={this.pwdChange} id="signin_password" autoComplete="off" />
                                        <Icon type="eye-invisible" onClick={this.show.bind(this)} style={{ display: this.state.e_show }} />
                                        <Icon type="eye" id="signin_icon" onClick={this.show.bind(this)} style={{ display: this.state.e_hide }} />
                                    </div>
                                </div>
                                <div style={{ paddingTop: 10 }}>
                                    <span className="warning" id="warn" style={{ color: 'red' }}></span>
                                </div>
                                <div className="btn-login" onClick={this.login}>
                                    <span>登录</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* moderator register */}
                <div className="moderator_box modalFarme" id="moderator_pwd">
                    {/* <div className="moderator_close" onClick={this.moderator_close}><i className="layui-icon layui-icon-close"></i></div> */}
                    <div className="moderator_close" onClick={this.moderator_close}>
                        <Icon type="close" />
                    </div>
                    <div className="moderator_content">
                        <div className="moderator_wrap_box">
                            <div className="box">
                                <div className="moderator_title">需要密码以完成该操作。如果您是主持人，请现在输入密码。</div>
                                <div className="password">
                                    {/* <label>主持人密码<span>&thinsp;*</span></label> */}
                                    <div className="password-ip">
                                        <input type="password" className="pin" onChange={this.pinChange} value={this.state.pin} autoComplete="off" />
                                    </div>
                                </div>
                                <div style={{ paddingTop: 10 }}>
                                    <span className="warning" id="PinWarn" style={{ color: 'red' }}></span>
                                </div>
                                <div className="btn-login" onClick={this.moderatorRegister}>
                                    <span>确定</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    let isOwner = false;
    let participant = state.teevid.meeting.participant;
    if (participant) {
        if (participant.isRoomOwner) {
            isOwner = true;
        }
    }
    return {
        participant: state.teevid.meeting.participant,
        loginState: state.loginState,
        moderator: state.moderator,
        meetingInfo: state.meetingInfo,
        account: state.account,
        remoteParticipants: state.teevid.meeting.remoteParticipants,
        isOwner,
        videoDevices: state.teevid.api.videoDevices,
        audioDevices: state.teevid.api.audioDevices,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        login: (data) => {
            var action = actions.login(data);
            dispatch(action);
        },
        logout: () => {
            var action = actions.logout();
            dispatch(action);
        },
        moderatorRegister: (data) => {
            var action = actions.moderatorRegister(data);
            dispatch(action);
        },
        disConnected() {
            var action = actions.disConnected();
            dispatch(action);
        },
        loginAccount: (data) => {
            var action = actions.loginAccount(data);
            dispatch(action);
        },
        loginUser: (data) => {
            var action = actions.loginUser(data);
            dispatch(action);
        },
        logoutModerator: (data) => {
            var action = actions.logoutModerator(data);
            dispatch(action);
        },
        stopStreaming:()=>{
            var action = actions.stopStreaming();
            dispatch(action);
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(LoginPanel));

