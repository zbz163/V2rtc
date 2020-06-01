import React, { Component } from 'react';
import { Form, message, Modal, Icon, Button, Alert } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import './Main.css';
import { storageUtils } from '../../../utils';
import Sliders from '../Slider/slider.js';
import LoginPanel from '../Login/loginPanel/LoginPanel';
import Invitation from '../Invitation/Invitation';
import * as actions from './action.js';
import StreamWrap from '../Stream/StreamWrap/StreamWrap';
import ShareStream from '../Stream/ShareStream/ShareStream';
import SendChat from '../Chat/sendChat';
import ShowChat from '../Chat/showChat';
import ParticipantShow from '../ParticipantsShow/ParticipantShow';
import ShareScreen from '../ShareScreen/ShareScreen';
import StoryBoards from '../StoryBoards/StoryBoardsBox/StoryBoards';
import BasicLecture from '../Stream/BasicLectureStream/BasicLectureBox';
import { func } from 'prop-types';
const { confirm } = Modal;
import { Prompt } from 'react-router';
import { asEffect } from 'redux-saga/utils';
class Main extends Component {
    // 状态机
    constructor(props, context) {
        super(props, context);
        this.disConnected = this.disConnected.bind(this);
        this.muteVideo = this.muteVideo.bind(this);
        this.muteAudio = this.muteAudio.bind(this);
        this.recordingStart = this.recordingStart.bind(this);
        this.recordingStop = this.recordingStop.bind(this);
        this.liveStart = this.liveStart.bind(this);
        this.liveStop = this.liveStop.bind(this);
        this.showBasicLecture = this.showBasicLecture.bind(this);
        this.addStoryBoard = this.addStoryBoard.bind(this);
        this.main_hide = this.main_hide.bind(this);
        this.raiseHand = this.raiseHand.bind(this);
        this.reload = this.reload.bind(this);
        this.tick = this.tick.bind(this);
        this.state = {
            display_gongxiang: 'none', //此状态机为display的取值
            display_ches: 'none',
            display_comment: 'none',
            display_slider: 'none',
            tabActiveIndex: 0,
            loginpanel: 'none',
            Invitation: 'none',
            display_personal: 'none',
            muteAudio: false,
            muteVideo: false,
            speakerActiveIndex: 0,
            index_list: 0,
            logoUrl: "",
            showLogoUrl: false,
            isHand: false,
            isLive: false,
            commentNews: 'none',
            v2Messages: '',
            lastNumber: '',
            commentNumber: '',
            Handis: true,
            liveInfo: {},
            muteByself: false,
            childrenMsg:false,
            enable:true
        }
    }
    componentWillReceiveProps(nextProps) {
        let { commentNews, lastNumber, commentNumber } = this.state;
        let v2Messages_length = nextProps.v2Messages.length;
        let commentLength = v2Messages_length - lastNumber;
        let comment = document.getElementById("comment_content").style.display;
        if (v2Messages_length == 0 || commentLength == 0) {
            this.setState({
                commentNews: 'none'
            })
        } else if (v2Messages_length != 0 && comment != 'block') {
            this.setState({
                commentNews: 'block'
            })
        }
        if (commentLength >= 99) {
            this.setState({
                commentNumber: '99+'
            })
        } else {
            this.setState({
                commentNumber: commentLength
            })
        }
    }

    moderatorRegisters() {
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
        let deal = '1';
        let charmanPws = pin;
        let socket;
        socket = createWebSocket(socketCluster);
        sendMessageModerator(id, from, to, xmlns, meetingID, deal, charmanPws);

        setTimeout(function(){
            let dataName = datas;
            console.log(dataName)
            if (meetingInfo && meetingInfo.meetingID) {
                let data = { meetingID: meetingInfo.meetingID, charmanPwd: md5(pin) }
                let MeetingPin= md5(pin);
                console.log("=============MeetingPin",MeetingPin);
                axios.post('/rtc/api/user/meetings/check/meetingCharmanPwd', data).then((res) => {
                    if(xmlns == 'v2rtc:meeting:moderator' && dataName.data.success == true){
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
    async componentDidMount() {   
        let that = this;
        let { account, companyInfo, videoDevices, audioDevices, meetingInfo, streamingState } = this.props;
        let meetingPin = await storageUtils.GetMeetingPin();
        console.error('=======meetingPin', meetingPin);
        let leaveMeetingTime = await storageUtils.GetLeaveMeetingTime();
        let nowTime = new Date().getTime();
        console.error('====nowTime', nowTime, 'leaveMeetingTime', leaveMeetingTime)
        console.error('==============live Info data', { mid: meetingInfo.meetingID })
        let liveInfo = {}; 
        
        console.log(account,this.props,window,this.state)
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
        let xmlns = 'v2rtc:meeting:reportdeviceId';
        setTimeout(function(){
            let mic = audioDevices[0].deviceId;
            let cam = videoDevices[0].deviceId;
            console.log(mic,cam)
            sendMessageToServer(id, from, to, xmlns, meetingID, mic, cam);
        },1000)

        if (nowTime - leaveMeetingTime > 5000) {
            console.log('==========OK')
            // await storageUtils.SetMeetingPin("");
        } else {
            console.error('=======dis', meetingPin);
            if (meetingPin) {
                let data = { meetingID: meetingInfo.meetingID, charmanPwd: meetingPin }
                await axios.post('/rtc/api/user/meetings/check/meetingCharmanPwd', data).then((res) => {
                    console.log('=======a', res)
                    if (res.status === "ERROR") {

                    } else if (res.status === "OK") {
                        console.error('=======dis========', meetingPin);
                        that.props.moderatorRegister({ pin: res.result.charmanPwd });
                        // console.error('=====liveInfo', liveInfo)
                    }
                })

                await axios.get('/rtc/api/live', { params: { mid: meetingInfo.meetingID } }).then((res) => {
                    console.log('=======live res', res)
                    if (res.status === "ERROR") {
                        return;
                    } else if (res.status === "OK") {
                        if (!res.result.liveInfo) {
                            storageUtils.SetLiveID("");
                        } else {
                            liveInfo = res.result.liveInfo;
                            that.setState({ liveInfo: res.result.liveInfo })
                            if (liveInfo && liveInfo.liveID) {
                                let num = res.result.liveInfo.actionRecords.length - 1;
                                if (liveInfo.actionRecords[num].actionType == 0) {
                                    // that.props.stopStreaming();
                                    that.setState({ isLive: false });
                                    storageUtils.SetLiveID(liveInfo.liveID);
                                } else if (liveInfo.actionRecords[num].actionType == 1) {
                                    that.setState({ isLive: true });
                                    storageUtils.SetLiveID(liveInfo.liveID);
                                } else if (liveInfo.actionRecords[num].actionType == 2) {
                                    let num1 = num - 1;
                                    if (liveInfo.actionRecords[num1].actionType == 1) {
                                        that.props.stopStreaming();
                                        that.setState({ isLive: false });
                                        storageUtils.SetLiveID(liveInfo.liveID);
                                    } else if (liveInfo.actionRecords[num1].actionType == 0) {
                                        that.setState({ isLive: false });
                                        storageUtils.SetLiveID(liveInfo.liveID);
                                    }
                                } else if (liveInfo.actionRecords[num].actionType == 3) {
                                    that.setState({ isLive: false });
                                    storageUtils.SetLiveID("");
                                }
                            }
                        }
                    }
                })
            }
        }


        let { showLogoUrl, logoUrl } = this.state;
        if (companyInfo && companyInfo.companyName) {
            logoUrl = companyInfo.logoUrl;
            if (logoUrl) {
                showLogoUrl = true;
            }
        } else {
            if (account.user && account.user.companyName) {
                logoUrl = account.user.companyLogoUrl;
                if (logoUrl) {
                    showLogoUrl = true;
                }
            }
        }
        this.setState({ showLogoUrl, logoUrl });
        document.onclick = this.main_hide;
        this.tick();
        let interval = setInterval(() => {//计时器
            let { meetingInfo } = that.props;
            let nowTime = new Date().getTime();
            let endDateObj = meetingInfo.endDateObj;
            let endTime = new Date(endDateObj).getTime();
            let lastTime, overTime;
            if (nowTime < endTime) {
                lastTime = parseInt(Math.floor(endTime - nowTime) / 1000 / 60);
                if (lastTime == 3) {
                    message.warning('会议将在三分钟后到期', 20);
                }
            } else {
                overTime = parseInt(Math.floor(nowTime - endTime) / 1000 / 60);
                if (overTime == 2) {
                    clearInterval(interval);
                    storageUtils.SetMeetingInfo('');
                    let { isLive } = that.state;
                    if (isLive) {
                        // that.setState({ isLive: false });
                        // that.props.stopStreaming();
                        // storageUtils.SetLiveID("");
                        (async () => {
                            await that.liveStop();
                            await that.props.disConnected();
                        })()
                    } else {
                        that.props.disConnected();
                    }
                    setTimeout(() => {
                        that.props.history.push('/login');
                    }, 500)
                }
            }
        }, 60000)
  
  
 
        // let switchHidden;
        // let switchShow;
        // document.addEventListener('visibilitychange', function() {
        //     if (document.hidden) {
        //         switchHidden = new Date();
        //         console.log('*****************切换走了')
        //     } else {
        //         switchShow = new Date();
        //         let timeDifference = (switchShow.getTime() - switchHidden.getTime()) / 1000;
        //         that.tick(timeDifference);
        //         console.log('*****************切换回来了',timeDifference)
        //     }
        // });
       
    }
   
    componentWillMount() {
        let that = this;
        // 拦截判断是否离开当前页面
        window.addEventListener('beforeunload', this.beforeunload);
    }
    componentWillUnmount() {
        // 销毁拦截判断是否离开当前页面
        //上报操作状态
        let { account , meetingInfo} = this.props;
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
          
        setTimeout(function(){
            let that = this;
            (async () => {
                let logID = await storageUtils.GetLogID();
                await that.reload(that);
                let nowTime = new Date().getTime();
                await storageUtils.SetLeaveMeetingTime(nowTime);
                let leaveMeetingTime = await storageUtils.GetLeaveMeetingTime();
                if (nowTime == leaveMeetingTime) {
                    if (logID) {
                        axios.post('/rtc/api/user/meetings/LeaveMeeting', { logID }).then((res) => {
                            storageUtils.SetLogID("");
                            window.removeEventListener('beforeunload', this.beforeunload);
                        })
                    }
                }
                // await that.props.stopStreaming();
            })()
        },1000)

    }
    beforeunload(e) {
        // let confirmationMessage = '你确定离开此页面吗?';
        // (e || window.event).returnValue = confirmationMessage;
        // return confirmationMessage;
    }
    reload(that) {

    }

    tick=()=> {
        var timer;
        var count = 0;
        var clickStart = 0;
        // console.log('***********时间差',timeDifference)
        var txt = document.getElementById('txt');
        clickStart++;
        // if(timeDifference != undefined){
        //     // console.log(txt.innerHTML)
        // }else{
            
        // }
        if (clickStart % 2 == 0) {
            clearInterval(timer);
            clickStart = 0;
        } else {
            timer = setInterval(function () {
                let h = parseInt(count / 1000 / 60 / 60);
                let m = parseInt(count / 1000 / 60) % 60;
                let s = parseInt(count / 1000) % 60;
                // let ms = parseInt(count / 10) % 100;
                h = h < 10 ? '0' + h : h;
                m = m < 10 ? '0' + m : m;
                s = s < 10 ? '0' + s : s;
                // ms = ms < 10 ? '0' + ms : ms;
                txt.innerHTML = h + ':' + m + ':' + s;
                count += 10;
            }
                , 10)
        }
        
    }
    getChildrenMsg = (msg) => {
        this.setState({
            childrenMsg: msg
        })
    }
    main_hide() {
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        if (document.getElementById("ches_content") && document.getElementById("ches_content").style) {
            document.getElementById("ches_content").style.display = 'none';
        }
        if (document.getElementById("gongxiang_content") && document.getElementById("gongxiang_content").style) {
            document.getElementById("gongxiang_content").style.display = 'none';
        }
        if (document.getElementById("comment_content") && document.getElementById("comment_content").style) {
            document.getElementById("comment_content").style.display = 'none';
        }
        if (document.getElementById("slider_click") && document.getElementById("slider_click").style && this.state.childrenMsg  == false) {
            document.getElementById("slider_click").style.display = 'none';
        }
        if (document.getElementById("invitation_content") && document.getElementById("invitation_content").style) {
            document.getElementById("invitation_content").style.display = 'none';
        }
        if (document.getElementById("personal_content") && document.getElementById("personal_content").style) {
            document.getElementById("personal_content").style.display = 'none';
        }
        this.setState({
            Invitation: 'none',
            childrenMsg: false,
        })
    }
    componentDidUpdate() {
        let recordingEnd = this.props.recording;
        let { participant, isRoomOwner, parMuByMoByVi, parMuByMoByAu } = this.props;
        let { muteByself } = this.state;
        let that = this;
        let muteByMo = parMuByMoByVi || parMuByMoByAu;
        if (!participant) {
            (async () => {
                let userInfo;
                let userAccount = await storageUtils.GetUserAccount();
                let userAccountPwd = await storageUtils.GetUserAccountPwd();
                userInfo = { userName: userAccount, userPwd: userAccountPwd }
                if (!userAccount) {
                    let userName = await storageUtils.GetUserName();
                    let userPwd = await storageUtils.GetUserPwd();
                    userInfo = { userName, userPwd };
                }
                let anonymousUserID = await storageUtils.GetAnonymousUserID();
                let meetingInfo = await storageUtils.GetMeetingInfo();
                let { isLive } = this.state;
                if (isRoomOwner) {
                    if (isLive) {
                        that.setState({ isLive: false });
                        // that.props.stopStreaming();
                        // storageUtils.SetLiveID("");
                    }
                }
                debugger;
                if (userInfo.userName && userInfo.userPwd) {
                    // that.props.stopStreaming();
                    setTimeout(() => {
                        that.props.disConnected();
                        that.props.history.push('/login');
                    }, 500)
                } else {
                    if (anonymousUserID && meetingInfo) {
                        meetingInfo = JSON.parse(meetingInfo);
                        that.props.disConnected();
                        // that.props.stopStreaming();
                        setTimeout(() => {
                            that.props.history.push(`/invite/${meetingInfo.meetingID}`);
                        }, 500)
                    } else {
                        that.props.disConnected();
                        // that.props.stopStreaming();
                        setTimeout(() => {
                            // that.props.history.push('/login');
                        }, 500)
                    }
                }
            })()
        }

        let { startTime, endTime } = recordingEnd;
        if (startTime < endTime) {
            let restTime;
            var dateInterval = endTime - startTime; //获取时间差毫秒
            var DD = Math.floor(dateInterval / (24 * 60 * 60 * 1000));
            var hourLevel = dateInterval % (24 * 60 * 60 * 1000);
            var HH = Math.floor(hourLevel / (60 * 60 * 1000))
            var minutesLevel = hourLevel % (60 * 60 * 1000);
            var mm = Math.floor(minutesLevel / (60 * 1000));
            var ss = Math.round((minutesLevel % (60 * 1000)) / 1000);
            if (DD > 0) {
                restTime = `${DD}天${HH}时${mm}分${ss}秒`;
            } else {
                if (HH > 0) {
                    restTime = `${HH}时${mm}分${ss}秒`;
                } else {
                    if (mm > 0) {
                        restTime = `${mm}分${ss}秒`;

                    } else {
                        restTime = `${mm}分${ss}秒`;
                    }
                }
            }
            message.success(`录制时长：${restTime}`);
        }
    }
    personal_content_state() {
        const personal_content = document.getElementById("personal_content");
        if (personal_content.style.display == 'block') {
            return personal_content.style.display = 'none';
        } else if (personal_content.style.display == 'none') (
            personal_content.style.display = 'block'
        )
    }
    ches_content_state() {
        const ches_content = document.getElementById("ches_content");
        if (ches_content.style.display == 'block') {
            return ches_content.style.display = 'none';
        } else if (ches_content.style.display == 'none') (
            ches_content.style.display = 'block'
        )
    }
    gongxiang_content_state() {
        const gongxiang_content = document.getElementById("gongxiang_content");
        if (gongxiang_content.style.display == 'block') {
            gongxiang_content.style.display = 'none'
        } else if (gongxiang_content.style.display == 'none') (
            gongxiang_content.style.display = 'block'
        )
    }
    comment_content_state() {
        const comment_content = document.getElementById("comment_content");
        if (comment_content.style.display == 'block') {
            comment_content.style.display = 'none'
        } else if (comment_content.style.display == 'none') (
            comment_content.style.display = 'block'
        )
    }
    slider_content_state() {
        const slider_content = document.getElementById("slider_click");
        if (slider_content.style.display == 'block') {
            slider_content.style.display = 'none'
        } else if (slider_content.style.display == 'none') (
            slider_content.style.display = 'block'
        )
    }
    e_ches(e) {
        e.nativeEvent.stopImmediatePropagation();  //阻止冒泡且触发其他事件
    }
    e_gongxiang(e) {
        e.nativeEvent.stopImmediatePropagation();
    }
    e_comment(e) {
        e.nativeEvent.stopImmediatePropagation();
    }
    e_slider(e) {
        e.nativeEvent.stopImmediatePropagation();
    }
    e_personal(e) {
        e.nativeEvent.stopImmediatePropagation();
    }
    display_personal(e) {
        e.nativeEvent.stopImmediatePropagation();
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        const gongxiang_content_s = document.getElementById("gongxiang_content");
        const comment_content_s = document.getElementById("comment_content");
        const slider_content_s = document.getElementById("slider_click");
        const ches_content_s = document.getElementById("ches_content");
        if (gongxiang_content_s.style.display == 'block' || comment_content_s.style.display == 'block' || slider_content_s.style.display == 'block' || ches_content_s.style.display == 'block') {
            gongxiang_content_s.style.display = 'none';
            comment_content_s.style.display = 'none';
            slider_content_s.style.display = 'none';
            ches_content_s.style.display = 'none';
        }
        this.personal_content_state();
        this.setState({
            Invitation: 'none',
        })
    }
    display_ches(e) {
        e.nativeEvent.stopImmediatePropagation();
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        const gongxiang_content_s = document.getElementById("gongxiang_content");
        const comment_content_s = document.getElementById("comment_content");
        const slider_content_s = document.getElementById("slider_click");
        const personal_content_s = document.getElementById("personal_content");
        if (gongxiang_content_s.style.display == 'block' || comment_content_s.style.display == 'block' || slider_content_s.style.display == 'block' || personal_content_s.style.display == 'block') {
            gongxiang_content_s.style.display = 'none';
            comment_content_s.style.display = 'none';
            slider_content_s.style.display = 'none';
            personal_content_s.style.display = 'none';
        }
        this.ches_content_state();
        this.setState({
            Invitation: 'none',
        })
    }
    display_gongxiang(e) {
        e.nativeEvent.stopImmediatePropagation();
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        const ches_content_s = document.getElementById("ches_content");
        const comment_content_s = document.getElementById("comment_content");
        const slider_content_s = document.getElementById("slider_click");
        const personal_content_s = document.getElementById("personal_content");
        if (ches_content_s.style.display == 'block' || comment_content_s.style.display == 'block' || slider_content_s.style.display == 'block' || personal_content_s.style.display == 'block') {
            ches_content_s.style.display = 'none';
            comment_content_s.style.display = 'none';
            slider_content_s.style.display = 'none';
            personal_content_s.style.display = 'none';
        }
        this.gongxiang_content_state();
        this.setState({
            Invitation: 'none',
        })
    }
    display_comment(e) {
        e.nativeEvent.stopImmediatePropagation();
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        const ches_content_s = document.getElementById("ches_content");
        const gongxiang_content_s = document.getElementById("gongxiang_content");
        const slider_content_s = document.getElementById("slider_click");
        const personal_content_s = document.getElementById("personal_content");
        if (ches_content_s.style.display == 'block' || gongxiang_content_s.style.display == 'block' || slider_content_s.style.display == 'block' || personal_content_s.style.display == 'block') {
            ches_content_s.style.display = 'none';
            gongxiang_content_s.style.display = 'none';
            slider_content_s.style.display = 'none';
            personal_content_s.style.display = 'none';
        }
        this.comment_content_state();
        this.setState({
            Invitation: 'none',
            commentNews: 'none',
        })
    }
    display_slider(e) {
        e.nativeEvent.stopImmediatePropagation();
        let { v2Messages } = this.props;
        let comments = document.getElementById("comment_content").style.display;
        if(comments == 'block'){
            this.setState({
                lastNumber: v2Messages.length
            })
        }
        const ches_content_s = document.getElementById("ches_content");
        const gongxiang_content_s = document.getElementById("gongxiang_content");
        const comment_content_s = document.getElementById("comment_content");
        const personal_content_s = document.getElementById("personal_content");
        if (ches_content_s.style.display == 'block' || gongxiang_content_s.style.display == 'block' || comment_content_s.style.display == 'block' || personal_content_s.style.display == 'block') {
            ches_content_s.style.display = 'none';
            gongxiang_content_s.style.display = 'none';
            comment_content_s.style.display = 'none';
            personal_content_s.style.display = 'none';
        }
        this.slider_content_state();
        this.setState({
            Invitation: 'none',
        })
    }

    loginpanel() {
        this.setState({
            loginpanel: 'block',
        })
    }
    Invitation() {
        document.getElementById("ches_content").style.display = 'none';
        this.setState({
            Invitation: 'block',
        })
    }
    callback = (loginpanel) => {
        this.setState({ loginpanel });
    }
    Invitations = (Invitation) => {
        const ches_content = document.getElementById("ches_content");
        if (ches_content.style.display == 'block') {
            return ches_content.style.display = 'none';
        } else if (ches_content.style.display == 'none') (
            ches_content.style.display = 'block'
        )
        this.setState({ Invitation });

    }
    changeColor(e) {
        let show1 = document.getElementById("speaker_zhe1")
        let show2 = document.getElementById("speaker_zhe2")
        if (e.target.checked == true) {
            show1.className = "speaker_zhe";
            show2.className = "speaker_zhe";
        } else if (e.target.checked == false) {
            show1.className = "antzone1";
            show2.className = "antzone1";

        }
    }
    disConnected() {
        let that = this;
        let { isLive, } = this.state;
        let { streamingState, isRoomOwner, account, meetingInfo,  } = this.props;
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
        let xmlns = 'v2rtc:meeting:exit';

        console.log('isRoomOwner', isRoomOwner, 'streamingState', streamingState, 'isLive', isLive)
        if (isRoomOwner) {
            if (isLive) {
                return message.warning('请先结束直播');
            } else {
                that.props.stopStreaming();
                storageUtils.SetMeetingInfo("");
                storageUtils.SetMeetingPin("");
                that.props.disConnected();
                sendMessageToServer(id, from, to, xmlns, meetingID,);
            }
        } else {
            that.props.stopStreaming();
            storageUtils.SetMeetingPin("");
            storageUtils.SetMeetingInfo("");
            that.props.disConnected();
            sendMessageToServer(id, from, to, xmlns, meetingID,);
        }
    }


    muteVideo() {
        const { localStreamId, streams } = this.props;
        if (localStreamId && streams) {
            let streamBySelf = streams[localStreamId];
            if (!streamBySelf) {
                return message.error('当前本地视频流不存在');
            } else {
                let muteByself = !streamBySelf.videoMuted || streamBySelf.audioMuted;
                console.error('================11111111',!streamBySelf.videoMuted,muteByself)
                this.setState({ muteVideo: !streamBySelf.videoMuted, muteByself })
                this.props.muteVideo({ state: !streamBySelf.videoMuted });
            }
        }
    }
    muteAudio() {
        const { localStreamId, streams } = this.props;
        if (localStreamId && streams) {
            let streamBySelf = streams[localStreamId];
            if (!streamBySelf) {
                return message.error('当前本地视频流不存在');
            } else {
                let muteByself = streamBySelf.videoMuted || !streamBySelf.audioMuted;
                this.setState({ muteAudio: !streamBySelf.audioMuted, muteByself })
                this.props.muteAudio({ state: !streamBySelf.audioMuted });
            }
        }
    }
    recordingStart() {
        let room = this.props.room;
        let participant = this.props.participant;
        if (!participant) {
            return message.error('请先登录');
        }
        let userId = participant.id;
        if (!room) {
            return message.error('会议室不存在，无法录屏');
        }
        let roomId = room.id;
        this.props.recordingStart({ roomId, userId });
    }
    async liveStart() {
        let that = this;
        let { meetingInfo, account } = this.props;
        let userID, meetingID;
        if (meetingInfo && account) {
            // chainmanPwd = meetingInfo.charmanPwd;
            meetingID = meetingInfo.meetingID;
            if (account.user) {
                if (account.user.userInfo) {
                    userID = account.user.userInfo.userID;
                }
            }
        }
        let data;
        let chainmanPwd = await storageUtils.GetMeetingPin();
        if (userID && meetingID && chainmanPwd) {
            data = { userID, meetingID, chainmanPwd }
        } else {
            return;
        }
        console.error('========开始直播', data);
        axios.post('/rtc/api/live/start', data)
            .then(res => {
                console.log('=======res start live', res)
                if (res.status === "ERROR") {
                    // that.props.stopStreaming();
                    // storageUtils.SetLiveID("");
                    that.liveStop();
                    return message.warning(res.error.message);

                } else if (res.status === "OK") {
                    (async () => {
                        console.error('=========OK start', res)
                        // await that.setState({ isLive: true });
                        await that.props.startStreaming();
                        await storageUtils.SetLiveID(res.result.liveID);
                        that.setState({ isLive: true });
                        let interval1 = setInterval(() => {//计时器
                            axios.get('/rtc/api/live', { params: { mid: meetingID } }).then((resLivInfo) => {
                                console.log('=======live res', resLivInfo)
                                if (resLivInfo.status === "ERROR") {
                                    return;
                                } else if (resLivInfo.status === "OK") {
                                    let liveInfo = {};
                                    liveInfo = resLivInfo.result.liveInfo;
                                    if (liveInfo && liveInfo.liveID) {

                                        let num = liveInfo.actionRecords.length - 1;
                                        if (liveInfo.actionRecords[num].actionType == 0) {

                                            let { isLive } = that.state;
                                            let { isRoomOwner } = that.props;
                                            if (isRoomOwner && isLive) {
                                                message.warning('直播异常，请刷新页面')
                                                // that.liveStop();
                                                that.setState({ isLive: false });
                                                clearInterval(interval1);
                                                // return that.props.history.push('/login');

                                            }else{
                                                clearInterval(interval1);
                                            }
                                        } else if (liveInfo.actionRecords[num].actionType == 1) {
                                            clearInterval(interval1);
                                        } else if (liveInfo.actionRecords[num].actionType == 2) {
                                            clearInterval(interval1);
                                        }
                                    }
                                }
                            })
                        }, 15000)
                    })()
                }

            }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
            })
    }
    async liveStop() {
        let that = this;
        let { meetingInfo, account } = this.props;
        let userID, meetingID;
        if (meetingInfo && account) {
            meetingID = meetingInfo.meetingID;
            if (account.user) {
                if (account.user.userInfo) {
                    userID = account.user.userInfo.userID;
                }
            }
        }
        let data;
        let chainmanPwd = await storageUtils.GetMeetingPin();
        let liveID = await storageUtils.GetLiveID();
        console.log('==========data====stop', 'userID', userID, 'meetingID', meetingID, 'chainmanPwd', chainmanPwd, 'liveID', liveID)
        if (userID && meetingID && chainmanPwd && liveID) {
            data = { userID, meetingID, chainmanPwd, liveID }
        } else {
            return;
        }
        console.error('=====结束直播', data);
        axios.post('/rtc/api/live/stop', data)
            .then(res => {
                if (res.status === "ERROR") {
                    return message.warning(res.error.message);
                } else if (res.status === "OK") {
                    (async () => {
                        await that.setState({ isLive: false });
                        await that.props.stopStreaming();
                        await storageUtils.SetLiveID("");
                    })()
                }
            }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
            })
    }
    setFalseIsLive() {
        this.setState({ isLive: false });
    }
    async recordingStop() {
        let room = this.props.room;
        let participant = this.props.participant;
        if (!participant) {
            return message.error('请先登录');
        }
        let recording = this.props.recording;
        if (recording.userId != participant.id) {
            return message.error('无权暂停');
        }
        if (!room) {
            return message.error('会议室不存在，无法录屏');
        }
        let roomId = room.id;
        await this.props.recordingStop({ roomId });
    }
    showBasicLecture() {
        let { mode, loginState, moderator, account, meetingInfo } = this.props;
        let { speakerActiveIndex } = this.state;
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
         let xmlns = 'v2rtc:meeting:meetingmode';
        if (loginState != 1) {
            return message.error('请先登录');
        }
        if (moderator === "0") {
            return message.error('请先输入主持人密码');
        }
        if (moderator === '2') {
            return message.error('主持人密码错误，请重新输入');
        }
        if (mode === "basic-lecture" && moderator === "1") {//关闭主持人模式
            this.props.logoutBasicLecture()
            let deal = '0';
            sendMessageMettingMode(id, from, to, xmlns, meetingID, deal);

        } else if (mode === "interactive" && moderator === "1") {//开始主持人模式
            this.props.showBasicLecture({ speakerActiveIndex });
            let deal = '1';
            sendMessageMettingMode(id, from, to, xmlns, meetingID, deal);
        }
    }

    addStoryBoard() {
        let { loginState } = this.props;
        if (loginState !== "1") {
            return message.error('请先登录');
        } else {
            this.props.history.push('/storyBoardsList');
        }
    }
    raiseHand() {
        let that = this;
        let { isHand, Handis ,enable} = this.state;
        let { account, meetingInfo } = this.props;
        const { localStreamId, streams } = this.props;
        if (localStreamId && streams) {
            let streamBySelf = streams[localStreamId];
            if (!streamBySelf) {
                return message.error('当前本地视频流不存在');
            } else {
                // let muteByself = !streamBySelf.videoMuted || streamBySelf.audioMuted;
                // console.error('================11111111',!streamBySelf.videoMuted,muteByself)
                this.setState({ muteVideo: false, muteByself : false})
                this.props.muteVideo({ state: false });
            }
        }
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
        let xmlns = 'v2rtc:meeting:handRaised_user';
        let deal = 'openAll';
        sendMessageRaiseHand(id, from, to, xmlns, meetingID, deal);
        setTimeout(function(){
            let dataName = datas;
            if(dataName.data.success == true){
                that.props.raiseHand({ state: true });
                that.setState({ enable : true })
                console.log('============5555555555555///////////',dataName,enable)
            }else{
                that.setState({ enable : false })
                return message.warning('30秒内只能申请一次');
            }
        },10)
    }
    responRaiseHand() {
        let { enable } = this.state;
        let { handRemoteParticipant, handRemoteParticipantId , account, meetingInfo ,isHandRemoteParticipant,localStreamId, streams} = this.props;
        let that = this;
        that.setState({ enable : false })
        if(isHandRemoteParticipant == true){
            that.props.raiseHandResponse({ accepted: false, targetId: handRemoteParticipantId });
        }
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
        let xmlns = 'v2rtc:meeting:handRaised_moderator';
        let resHand = false;
        let handResCon = confirm({
            title: `${handRemoteParticipant}举手请求使用摄像头和麦克风`,
            okText: '同意',
            cancelText: '拒绝',
            id: `raisehand${handRemoteParticipantId}`,
            onOk() {
                let deal = 'openAll';
                sendMessageRaiseHand(id, from, to, xmlns, meetingID, deal,handRemoteParticipantId);
                resHand = true;
                that.props.raiseHandResponse({ accepted: true, targetId: handRemoteParticipantId });
            },
            onCancel() {
                let deal = 'closeAll';
                sendMessageRaiseHand(id, from, to, xmlns, meetingID, deal,handRemoteParticipantId);
                resHand = true;
                that.props.raiseHandResponse({ accepted: false, targetId: handRemoteParticipantId });
            }
        });
                
        setTimeout(() => {
            if (!resHand) {
                handResCon.destroy();
            }
        }, 30000);
    }
    render() {
        let that = this;
        let { isLive, tabActiveIndex, muteVideo, muteAudio, speakerActiveIndex, index_list, showLogoUrl, logoUrl ,enable} = this.state;
        let { meetingInfo, mode, recording, remoteParticipants, participant, startShare, shareingStream, shareingStreamId, streams, moderator, isHandRemoteParticipant, muteVideoBySelf } = this.props;
        let recording_state = "1";
        console.log(streams,this.props,datas)
        if (recording && recording.recordingState) {
            if (recording.recordingState === "2") {
                recording_error = recording.message;
            }
            recording_state = recording.recordingState;
        }

        let participantsTotal = 1;
        let participantsTotalArr = Object.entries(remoteParticipants);
        participantsTotal = participantsTotalArr.length + participantsTotal;
        let isRoomOwner;
        let handShow = false;
        let muteVideoByModerator = false;
        let muteAudioByModerator = false;
        if (participant) {
            isRoomOwner = participant.isRoomOwner || false;
            // muteAudioByModerator = participant.status.mute.audio.byModerator;
            // muteVideoByModerator = participant.status.mute.video.byModerator;
            muteAudioByModerator = participant.status.unmuteRequest.audio;
            muteVideoByModerator = participant.status.unmuteRequest.video;
            if (muteAudioByModerator || muteVideoByModerator) {
                handShow = true;
            }
        }
        
        if (isRoomOwner) {
            if (isHandRemoteParticipant === true || enable == true) {
                setTimeout(function () {
                    let isHandRemoteParticipant1 = that.props.isHandRemoteParticipant;
                    if (isHandRemoteParticipant1 === true) {
                        that.responRaiseHand();
                    }
                }, 1000)
            }
        }
        return (
            <div>
                <div className="header">
                    <ul>
                        <li>
                            <div className="left_img_Box">
                                {showLogoUrl &&
                                    <img className="left_img" src={logoUrl} alt="" />
                                }
                                {!showLogoUrl &&
                                    <img src={require('../../../images/lists.png')} alt="" />
                                }
                            </div>
                            <div className="header-left">
                                {meetingInfo && meetingInfo.topic &&
                                    <p className="metting_title">{meetingInfo.topic}</p>
                                }
                                {!meetingInfo || !meetingInfo.topic &&
                                    <p>房间不存在</p>
                                }
                                <p id="txt"></p>
                                {/* <span id="txt">00:00:00</span> */}
                            </div>
                        </li>
                        <li>
                            <div>
                                {(!muteVideoByModerator && !muteVideo) && <img src={require('../../../images/video.svg')} alt="" onClick={this.muteVideo} style={{ width: "20px", height: "20px" }} />}
                                {(!muteVideoByModerator && muteVideo) && <img src={require('../../../images/muteVideo.svg')} alt="" onClick={this.muteVideo} style={{ width: "20px", height: "20px" }} />}
                                {muteVideoByModerator && <img src={require('../../../images/muteVideo.svg')} alt="" style={{ width: "20px", height: "20px" }} />}
                            </div>
                            <div>
                                {(!muteAudioByModerator && !muteAudio) && <img src={require('../../../images/audio.svg')} alt="" onClick={this.muteAudio} style={{ width: "20px", height: "20px" }} />}
                                {(!muteAudioByModerator && muteAudio) && <img src={require('../../../images/muteAudio.svg')} alt="" onClick={this.muteAudio} style={{ width: "20px", height: "20px" }} />}
                                {muteAudioByModerator && <img src={require('../../../images/muteAudio.svg')} alt="" style={{ width: "20px", height: "20px" }} />}
                            </div>
                            <div className="esc" onClick={this.disConnected}>
                                <div className="esc_box"><img src={require('../../../images/esc.jpg')} alt="" /></div>
                            </div>
                            {isRoomOwner &&
                                <div className="live_Box" style={{ margin: '0px 0 0 10px',width:'80px' }}>
                                    {!isLive && <Button type="primary" onClick={this.liveStart} style={{width:'100%'}}>开始直播</Button>}
                                    {isLive && <Button type="danger" onClick={this.liveStop} style={{width:'100%'}}>结束直播</Button>}
                                    {/* {recording_state === "2" && <Button type="primary" onClick={this.liveStart}>开始直播</Button>} */}
                                </div>
                            }
                            {/* <div className="recording_Box" style={{ margin: '20px 0 0 40px' }}>
                                {recording_state === "1" && <Button type="primary" onClick={this.recordingStart}>录制</Button>}
                                {recording_state === "0" && <Button type="danger" onClick={this.recordingStop}>停止录制</Button>}
                                {recording_state === "2" && <Button type="primary" onClick={this.recordingStart}>录制</Button>}
                            </div> */}
                            {handShow &&
                                <div>
                                    <div><img onClick={this.raiseHand} src={require('../../../images/hand.svg')} alt="" style={{ width: "20px", height: "20px" }} /></div>
                                </div>
                            }
                        </li>

                        <li>
                            <div className="personalLayout">
                                <div style={{ color: '#fff' }} onClick={this.display_personal.bind(this)}>
                                    <Icon type="layout" style={{ fontSize: '20px', cursor: 'pointer', color: "rgb(153,170,192)" }} title="布局" />
                                </div>
                                <div className="personal" id="personal_content" onClick={this.e_personal.bind(this)} style={{ display: this.state.display_personal, right: '0', opacity: '1' }}>
                                    <p className="personal_title">请选择适合自己的布局</p>
                                    <div className="personal_one" onClick={this.indexListClick.bind(this, 0)}>
                                        <div className="personal_one_bg"></div>
                                        <div className="personal_one_bg"></div>
                                        <div className="personal_one_bg"></div>
                                        <div className="personal_one_bg"></div>
                                        <div className={"personal_position " + (index_list === 0 ? 'personal_actives' : '')}></div>
                                    </div>
                                    <div className="personal_two" onClick={this.indexListClick.bind(this, 1)}>
                                        <div className="personal_two_bg">
                                            <div className="personal_two_position"></div>
                                        </div>
                                        <div className={"personal_position " + (index_list === 1 ? 'personal_actives' : '')}></div>
                                    </div>
                                    <div className="personal_three" onClick={this.indexListClick.bind(this, 2)}>
                                        <div className="personal_three_top"></div>
                                        <div className="personal_three_bottom">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                        <div className={"personal_position " + (index_list === 2 ? 'personal_actives' : '')}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="slider">
                                <img src={require('../../../images/slider.jpg')} alt="" onClick={this.display_slider.bind(this)} />
                                {/* 设备处理 */}
                                <div className="slider_click" id="slider_click" onClick={this.e_slider.bind(this)} style={{ display: this.state.display_slider, position: 'absolute', right: '0', opacity: '1', top: '64px' }}>
                                    <Sliders parent={ this }/>
                                </div>
                                <div className="sj"></div>
                            </div>
                            <div className="comment" style={{ position: 'relative' }}>
                                <img src={require('../../../images/comment.png')} alt="" onClick={this.display_comment.bind(this)} />
                                <div className='comment_news' style={{ display: this.state.commentNews }}>{this.state.commentNumber}</div>
                                <div className="comment_content" id="comment_content" onClick={this.e_comment.bind(this)} style={{ display: this.state.display_comment, right: '-174px', opacity: '1' }} >
                                    <div className="comment_title">聊天</div>
                                    {/* 聊天 */}
                                    <div className="comment_screen" id="comment_screen"><ShowChat /></div>
                                    <SendChat />
                                </div>
                                <div className="comment_box"><i className="fa fa-comments-o"></i></div>
                            </div>
                            <div className="ches" >
                                <img src={require('../../../images/ches.jpg')} alt="" onClick={this.display_ches.bind(this)} />
                                <div className="ches_content" id="ches_content" onClick={this.e_ches.bind(this)} style={{ display: this.state.display_ches, right: '0', opacity: '1' }} >
                                    <div className="ches_box">
                                        <div className="ches_title">
                                            <div>{participantsTotal}参会者</div>
                                            <div className="invitation" onClick={this.Invitation.bind(this)}><span>邀请</span><img src={require('../../../images/jia.png')} alt="" /></div>
                                        </div>
                                        {/* 参会者 */}
                                        <div className="comment_screen"><ParticipantShow /></div>
                                    </div>
                                </div>
                                <div className="invitation_content" onClick={this.e_ches.bind(this)} id="invitation_content" style={{ display: this.state.Invitation, right: '0', opacity: '1' }}>
                                    <Invitation Invitation={this.Invitations} props={this.props} />
                                </div>
                            </div>
                            <div className="gongxiang">
                                <img src={require('../../../images/gongxiang.jpg')} alt="" onClick={this.display_gongxiang.bind(this)} />
                                <div className="gongxiang_content" id="gongxiang_content" onClick={this.e_gongxiang.bind(this)} style={{ display: this.state.display_gongxiang, right: '0', opacity: '1' }}>
                                    <div className="gongxiang_tab">
                                        <div className="tab_top">
                                            <div className={"gongxiang_btn " + (tabActiveIndex === 0 ? 'active' : '')} onClick={this.handleTabClick.bind(this, 0)}>
                                                <span>讨论模式</span>
                                                <div className={"top_xian " + (tabActiveIndex === 0 ? 'top_active' : '')}></div>
                                            </div>
                                            <div className={"gongxiang_btn " + (tabActiveIndex === 1 ? 'active' : '')} onClick={this.handleTabClick.bind(this, 1)}>
                                                <span>主持人模式</span>
                                                <div className={"top_xian " + (tabActiveIndex === 1 ? 'top_active' : '')}></div>
                                            </div>

                                            {/* 暂时隐藏故事板模式 */}
                                            {/* <div className={"gongxiang_btn " + (tabActiveIndex === 2 ? 'active' : '')} onClick={this.handleTabClick.bind(this, 2)}>
                                                <span>故事版模式</span>
                                                <div className={"top_xian " + (tabActiveIndex === 2 ? 'top_active' : '')}></div>
                                            </div> */}
                                        </div>
                                        <div className="tab_content">
                                            {/* 主持人 */}
                                            <div className={"m-sys-view " + (tabActiveIndex === 0 ? 'active' : '')}>
                                                <span>所有人能够看见和听到其他人。房间主人能够主持会议，管理参会者。</span>
                                                <ShareScreen />
                                            </div>
                                            <div className={"m-sys-view " + (tabActiveIndex === 1 ? 'active' : '')}>
                                                <span>作为主持人您能够决定参会者的收看视图和发言等。</span>
                                                <div className="speaker">
                                                    <p className="speaker_title">主持人设置</p>
                                                    <div className="speaker_input" onChange={this.changeColor}>
                                                        <input type="checkbox" value="red" defaultChecked={true} style={{ marginBottom: '14px' }} />
                                                        <p>自动</p>
                                                    </div>
                                                </div>
                                                <ul className="speaker_click">
                                                    <li className={"speaker_one " + (speakerActiveIndex === 0 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 0)}>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 0 ? 'actives' : '')}></div>
                                                    </li>
                                                    <li className={"speaker_two " + (speakerActiveIndex === 1 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 1)}>
                                                        <div></div>
                                                        <div></div>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 1 ? 'actives' : '')}></div>
                                                    </li>
                                                    <li className={"speaker_three " + (speakerActiveIndex === 2 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 2)}>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 2 ? 'actives' : '')}></div>
                                                    </li>
                                                    <div className="speaker_zhe" id="speaker_zhe1"></div>
                                                </ul>
                                                <ul className="speaker_click speaker_padding">
                                                    <li className={"speaker_four " + (speakerActiveIndex === 3 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 3)}>
                                                        <div></div>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 3 ? 'actives' : '')}></div>
                                                    </li>
                                                    <li className={"speaker_five " + (speakerActiveIndex === 4 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 4)}>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 4 ? 'actives' : '')}></div>
                                                    </li>
                                                    <li className={"speaker_six " + (speakerActiveIndex === 5 ? 'active' : '')} onClick={this.speakerTabClick.bind(this, 5)}>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                        </div>
                                                        <div className={"speaker_position " + (speakerActiveIndex === 5 ? 'actives' : '')}></div>
                                                    </li>
                                                    <div className="speaker_zhe" id="speaker_zhe2"></div>
                                                </ul>
                                                {isRoomOwner && <div className="speaker_btn" onClick={this.showBasicLecture}>
                                                    <img src={require('../../../images/speaker.jpg')} alt="" />
                                                    <span>{mode === "basic-lecture" ? "关闭主持人模式" : "开始主持人模式"}</span>
                                                </div>}
                                                <ShareScreen />
                                            </div>
                                            <div className={"m-sys-view " + (tabActiveIndex === 2 ? 'active' : '')} style={{ overflowY: 'auto', height: "calc(100vh - 120px)" }}>
                                                <div>选择您想播放的故事板，推送浸入式体验的富媒体内容到参会者。</div>
                                                <div className="storyboard">
                                                    <p>故事板 <img className="add_storyboard_img" src={require('../../../images/add.svg')} alt="" onClick={this.addStoryBoard} /></p>
                                                    <StoryBoards />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <LoginPanel style={{ display: this.state.panel }} push={this.props.history.push} isLive={isLive} setFalseIsLive={this.setFalseIsLive.bind(this)} />

                        </li>
                    </ul>
                </div>
                <div >{!startShare && mode !== "basic-lecture" && <StreamWrap message={this.state.index_list} />}</div>
                {!startShare && mode === "basic-lecture" && <BasicLecture speakerActiveIndex={speakerActiveIndex} />}
                {startShare && <ShareStream startShare={startShare} shareingStream={shareingStream} shareingStreamId={shareingStreamId} streams={streams} />}

            </div>
        )
    }
}

Object.assign(Main.prototype, {
    handleTabClick(tabActiveIndex) {
        this.setState({
            tabActiveIndex
        })
    },
    indexListClick(index_list) {
        this.setState({
            index_list
        })
    },
    speakerTabClick(speakerActiveIndex) {
        let { participant, mode } = this.props;
        if (mode !== "basic-lecture") {
            this.setState({
                speakerActiveIndex
            })
            return message.error('请先开启主持人模式')
        }
        if (participant) {
            let isRoomOwner = participant.isRoomOwner || false;
            if (isRoomOwner) {
                this.setState({
                    speakerActiveIndex
                })
                if (mode === "basic-lecture") {
                    this.props.setLectureLayout({ speakerActiveIndex })
                }
            }
        }

    }
})
const mapStateToProps = (state) => {
    console.log('*********state*********', state);
    let startShare = false;
    let shareingStream = null;
    let shareingStreamId = null;
    let streams = state.teevid.meeting.streams;

    if (streams) {
        Object.entries(streams).map(item => {
            const stream = item[1];
            if (stream.hasScreen() == true) {
                startShare = true;
                shareingStream = stream;
                shareingStreamId = item[0];
            }
        }
        );
    }
    let remoteParticipants = state.teevid.meeting.remoteParticipants;
    let handRemoteParticipant = null;
    let isHandRemoteParticipant = false;
    let handRemoteParticipantId = null;
    let muteVideoBySelf = false;
    let showRemotePart = {};
    if (remoteParticipants) {
        Object.entries(remoteParticipants).map(item => {
            if (item) {
                const remoteParticipant = item[1];
                if (remoteParticipant.status.handRaised === true) {
                    isHandRemoteParticipant = true;
                    let name = remoteParticipant.name;
                    let nameArr = name.split('@^@');
                    let realName = nameArr[0];
                    handRemoteParticipant = realName;
                    handRemoteParticipantId = item[0];
                    muteVideoBySelf = remoteParticipant.status.mute.video.state;
                }
                if (remoteParticipant.name !== "teevid_cef_streaming") {
                    showRemotePart[item[0]] = item[1];
                }
            }
        }
        );
    }
    let participant = state.teevid.meeting.participant;
    let isRoomOwner = false;
    let parMuByMoByVi = false;
    let parMuByMoByAu = false;
    console.error('=========participant',participant)
    if (participant) {
        isRoomOwner = participant.isRoomOwner || false;
        // parMuByMoByVi = participant.status.mute.video.byModerator;
        // parMuByMoByAu = participant.status.mute.audio.byModerator;
        parMuByMoByVi = participant.status.unmuteRequest.audio;
        parMuByMoByAu = participant.status.unmuteRequest.video;
    }
    console.error('===============streamingState', state.teevid.meeting.streamingState)
    return {
        mode: state.teevid.meeting.mode,
        localStreamId: state.teevid.meeting.localStreamId,
        streams: state.teevid.meeting.streams,
        recording: state.recording,
        room: state.teevid.meeting.room,
        participant: state.teevid.meeting.participant,
        // remoteParticipants: state.teevid.meeting.remoteParticipants,
        remoteParticipants: showRemotePart,
        v2Messages: state.v2Message,
        startShare,
        shareingStream,
        shareingStreamId,
        loginState: state.loginState,
        moderator: state.moderator,
        isHandRemoteParticipant,
        handRemoteParticipant,
        handRemoteParticipantId,
        muteVideoBySelf,
        account: state.account,
        meetingInfo: state.meetingInfo,
        companyInfo: state.companyInfo,
        videoDevices: state.teevid.api.videoDevices,
        audioDevices: state.teevid.api.audioDevices,
        streamingState: state.teevid.meeting.streamingState,
        isRoomOwner: isRoomOwner,
        parMuByMoByVi,
        parMuByMoByAu
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        disConnected() {
            var action = actions.disConnected();
            dispatch(action);
        },
        muteVideo: (data) => {
            var action = actions.muteVideo(data);
            dispatch(action);
        },
        muteAudio: (data) => {
            var action = actions.muteAudio(data);
            dispatch(action);
        },
        recordingStart: (data) => {
            var action = actions.recordingStart(data);
            dispatch(action);
        },
        recordingStop: (data) => {
            var action = actions.recordingStop(data);
            dispatch(action);
        },
        setLectureLayout: (data) => {
            var action = actions.setLectureLayout(data);
            dispatch(action);
        },
        showBasicLecture: (data) => {
            var action = actions.showBasicLecture(data);
            dispatch(action);
        },
        logoutBasicLecture: () => {
            var action = actions.logoutBasicLecture();
            dispatch(action);
        },
        raiseHand: (data) => {
            var action = actions.raiseHand(data);
            dispatch(action);
        },
        raiseHandResponse: (data) => {
            var action = actions.raiseHandResponse(data);
            console.error('===========action',action)
            dispatch(action);
        },
        startStreaming: () => {
            var action = actions.startStreaming();
            dispatch(action);
        },
        stopStreaming: () => {
            var action = actions.stopStreaming();
            dispatch(action);
        },
        moderatorRegister: (data) => {
            var action = actions.moderatorRegister(data);
            dispatch(action);
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Main));
