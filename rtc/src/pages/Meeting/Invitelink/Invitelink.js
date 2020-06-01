import React, { Component } from 'react'
import { Form, Icon, Input, Button, message, Modal, Table, Select } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import moment, { now } from 'moment';
import md5 from 'md5';
import { storageUtils } from '../../../utils';
import * as actions from './action.js';
import './Invitelink.css';

const { Option } = Select;
class Invitelink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingID: null,
            meetingInfo: {},
            number: 0,
            showModel: 0,
            CompanyInfo: {},
        };
    }

    async componentWillMount() {
        let that = this;
        let meetingID = this.props.match.params.meetingID;
        if (!meetingID) {
            return that.props.history.push('/login');
        }
        let anonymousUserID = await storageUtils.GetAnonymousUserID();
        // if (anonymousUserID) {
        //     let companyInfo, meetingInfoComponentDidMount;
        //     let anonymousUserName = await storageUtils.GetAnonymousUserName();
        //     let meetingInfo = await storageUtils.GetMeetingInfo();
        //     let CompanyInfo = await storageUtils.GetCompanyInfo();
        //     if (CompanyInfo) {
        //         companyInfo = JSON.parse(CompanyInfo);
        //     } else {
        //         companyInfo = "";
        //     }

        //     // CompanyInfo = JSON.parse(CompanyInfo);
        //     meetingInfo = JSON.parse(meetingInfo);
        //     await that.props.saveCompany({ CompanyInfo: companyInfo });
        //     // await that.createAnonymousUser(that);

        //     // meetingInfoComponentDidMount = JSON.stringify(meetingInfo);
        //     // await storageUtils.SetMeetingInfo(meetingInfoComponentDidMount);
        //     // await storageUtils.SetCompanyInfo(companyInfo);
        //     console.log('=========meetingInfoComponentDidMount', meetingInfo)
        //     await that.enterMeeting(anonymousUserName, meetingInfo.meetingID, that);
        //     await that.props.joinMeeting({ meetingInfo: meetingInfo });
        //     await that.props.connect({ username: anonymousUserName, room: meetingInfo.roomID, pin: "", connectAnyway: true });
        // } else {
            let data = { meetingID };
            axios.get('/rtc/api/user/getMeetingInfo', { params: data })
                .then(res => {
                    console.log('======res getMeetingInfo', res)
                    if (res.status === "OK") {
                        let showModel;
                        if (res.result.normalPwd) {
                            showModel = 1;
                        } else {
                            showModel = 2
                        }
                        let nowTime = new Date().getTime();
                        let endDateObj = res.result.endDateObj;
                        endDateObj = new Date(endDateObj).getTime();
                        if (nowTime > endDateObj) {
                            message.error('链接已失效');
                        }
                        that.setState({ meetingID, showModel, meetingInfo: res.result, number: res.result.users.length });
                        setTimeout(() => {
                            that.getCompanyInfo(that);
                        }, 500)

                        // message.success('修改成功');
                        // that.props.loginAccount({ accountToken: account.accountToken, accountInfo: res.result });
                    } else if (res.status === "ERROR") {
                        message.error(res.error.message);
                    }
                }).catch(error => {
                    console.log('======error', error)
                    message.error(error);
                    // return that.props.history.push('/login');
                })
        // }

        //通过roomId获取会议信息；
    }
    enterMeeting(userNick, meetingID, that) {
        let data = { userNick, meetingID };
        console.log('========enterMeeting data', data)
        axios.post('/rtc/api/user/meetings/enterMeeting', data).then((res) => {
            if (res.status === "ERROR") {
                return message.error(res.error.message);
            } else if (res.status === 'OK') {
                let logID = res.result;
                storageUtils.SetLogID(logID);
                that.props.saveLogID({ logID });
            }
        })
    }
    getCompanyInfo(that) {
        // let that = this;
        (async () => {
            try {
                let { meetingInfo } = that.state;
                if (meetingInfo && meetingInfo.accountID) {
                    let accountID = meetingInfo.accountID;
                    if (!accountID) return message.error('会议室不存在');
                    axios.get('/rtc/api/account/getCompanyInfoByAccountID', { params: { accountID } }).then((res) => {
                        if (res.status === "ERROR") {
                            message.error(res.error.message);
                        } else if (res.status === "OK") {
                            that.setState({ CompanyInfo: res.result })
                        }
                    }).catch((error) => {
                        message.error(error);
                    })
                }

            } catch (error) {
                message.error(error);
            }
        })()
    }
    handleSubmit = e => {
        let that = this;
        let { meetingID, meetingInfo, showModel } = this.state;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let nowTime = new Date().getTime();
                let endDateObj = meetingInfo.endDateObj;
                endDateObj = new Date(endDateObj).getTime();
                if (nowTime > endDateObj) {
                    return message.error('链接已失效');
                }
                if (showModel == 1) {
                    let { name, password, username, pin } = values;
                    let { roomId, CompanyInfo } = that.state;
                    if (!username) return message.error('会议昵称不能为空');
                    if (!pin) return message.error('会议密码不能为空');
                    let data = { meetingID, normalPwd: md5(pin) };
                    axios.post("/rtc/api/user/meetings/check/meetingNormalPwd", data).then((res) => {
                        if (res.status === "ERROR") {
                            if (document.getElementById("invite_warn")) {
                                return document.getElementById("invite_warn").innerHTML = res.error.message;
                            }
                        } else if (res.status === "OK") {
                            (async () => {
                                await storageUtils.SetNickName(username);
                                await storageUtils.SetUserRoomID(meetingInfo.roomID);
                                await that.props.saveCompany({ CompanyInfo });
                                await that.createAnonymousUser(that);
                                await that.enterMeeting(username, meetingID, that);
                                await that.props.joinMeeting({ meetingInfo: meetingInfo });
                                await that.props.connect({ username, room: meetingInfo.roomID, pin: res.result.normalPwd, connectAnyway: true });
                            })()
                        }
                    })
                } else if (showModel == 2) {
                    let { username } = values;
                    let { roomId, CompanyInfo } = that.state;
                    if (!username) return message.error('会议昵称不能为空');
                    (async () => {
                        await storageUtils.SetNickName(username);
                        await storageUtils.SetUserRoomID(meetingInfo.roomID);
                        await that.props.saveCompany({ CompanyInfo });
                        await that.createAnonymousUser(that);

                        let companyInfo, meetingInfoComponentDidMount;
                        meetingInfoComponentDidMount = JSON.stringify(meetingInfo);
                        companyInfo = JSON.stringify(CompanyInfo);
                        // await storageUtils.SetAccountUserInfo(accountUserInfo);
                        await storageUtils.SetAnonymousUserName(username);
                        // let a = await storageUtils.GetAccountUserInfo();
                        await storageUtils.SetMeetingInfo(meetingInfoComponentDidMount);
                        await storageUtils.SetCompanyInfo(companyInfo);
                        await that.enterMeeting(username, meetingID, that);
                        await that.props.joinMeeting({ meetingInfo: meetingInfo });
                        await that.props.connect({ username, room: meetingInfo.roomID, pin: "", connectAnyway: true });
                    })()
                }
            }

        });
    };
    createAnonymousUser(that) {
        new Promise(resolve => {
            axios.post("/rtc/api/user/anonymous").then((res) => {
                if (res.status === "ERROR") {
                    return that.props.history.push('/login');
                } else if (res.status === "OK") {
                    (async () => {
                        await storageUtils.SetAnonymousUserID(res.result.anonymousUserID);
                        resolve();
                    })()
                }
            })
        })
    }
    checkUsername(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        var regEn = /[&<>'"、,]/im;
        if(regEn.test(value)){
            callback('不允许输入&<>’"、,字符')
        }else if(len > 64){
            callback(global.meetingNameLong.writtenWords)
        }else {
            callback();
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { meetingInfo, number, showModel } = this.state;
        let { loginState, conNect } = this.props;
        let that = this;
        if (conNect == '1') {
            if (document.getElementById("invite_warn")) {
                document.getElementById("invite_warn").innerHTML = '会议密码错误或会议不存在';
            }
        } else if (conNect == '0') {
            if (document.getElementById("invite_warn")) {
                document.getElementById("invite_warn").innerHTML = '';
                that.props.history.push('/meeting');
            } else {
                that.props.history.push('/meeting');
            }
        } else if (conNect == '2') {
            location.reload();
        }
        return (
            <div className="sharelinks_box">
                {meetingInfo && showModel == 1 &&
                    <div className="sharelinks">
                        <div className="sharelinks_title">欢迎参加：<span>{meetingInfo.topic}</span>会议</div>
                        <div className="sharelinks_content">
                            <div>会议名称：<span>{meetingInfo.topic}</span></div>
                            <div>会议时间：<span>{moment(meetingInfo.startDateObj).format("MM-DD HH:mm")}</span> --- <span>{moment(meetingInfo.endDateObj).format("MM-DD HH:mm")}</span></div>
                            <div>参会人数：<span>{number}</span></div>
                        </div>
                        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onSubmit={this.handleSubmit}>
                            <Form.Item label="请输入会议昵称">
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入会议昵称' },{ validator: (rule, value, callback) => { this.checkUsername(rule, value, callback) } }], validateTrigger: 'onBlur',
                                })(<Input placeholder="请输入会议昵称" />)}
                            </Form.Item>
                            <Form.Item label="请输入会议密码">
                                {getFieldDecorator('pin', {
                                    rules: [{ required: true, message: '请输入会议密码' },{max:24,min:4, message:global.password.writtenWords}],
                                })(<Input type="password" placeholder="请输入会议密码" />)}
                            </Form.Item>
                            <div style={{ paddingTop: 10 }}>
                                <span className="warning" id="invite_warn" style={{ color: 'red' }}></span>
                            </div>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: "200px", marginLeft: '80px' }}>进入会议</Button>
                            </Form.Item>
                        </Form>
                    </div>
                }
                {meetingInfo && showModel == 2 &&
                    <div className="sharelinks">
                        <div className="sharelinks_title">欢迎参加：<span>{meetingInfo.topic}</span>会议</div>
                        <div className="sharelinks_content">
                            <div>会议名称：<span>{meetingInfo.topic}</span></div>
                            <div>会议时间：<span>{moment(meetingInfo.startDateObj).format("MM-DD HH:mm")}</span> --- <span>{moment(meetingInfo.endDateObj).format("MM-DD HH:mm")}</span></div>
                            <div>参会人数：<span>{number}</span></div>
                        </div>
                        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onSubmit={this.handleSubmit}>
                            <Form.Item label="请输入会议昵称">
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入会议昵称' },{ validator: (rule, value, callback) => { this.checkUsername(rule, value, callback) } }], validateTrigger: 'onBlur',
                                })(<Input placeholder="请输入会议昵称" />)}
                            </Form.Item>
                            <div style={{ paddingTop: 10 }}>
                                <span className="warning" id="invite_warn" style={{ color: 'red' }}></span>
                            </div>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: "200px", marginLeft: '80px' }}>进入会议</Button>
                            </Form.Item>
                        </Form>
                    </div>
                }
            </div>

        )
    }
}


const mapStateToProps = (state) => {
    console.log('-------state', state)
    return {
        room: state.teevid.meeting.room,
        loginState: state.loginState,
        conNect: state.conNect,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        joinMeeting: (data) => {
            var action = actions.joinMeeting(data);
            dispatch(action);
        },
        connect: (data) => {
            var action = actions.connect(data);
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Invitelink));