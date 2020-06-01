import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, message, Modal, Table, Select, DatePicker } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import axios from "axios";
import md5 from 'md5';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import './Login.css';
import LoginAccount from './account/LoginAccount';
import units from '../../../utils';
// import LoginNotice from './LoginNotice';
import LoginNotice from '../../User/LoginNotice/LoginNotice';
import { storageUtils } from '../../../utils';

const { Option } = Select;
const FormItem = Form.Item;
class Login extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showLogin: false,
            userInfo: { userName: '', userPwd: '' },
            CompanyInfo: {},
        }
    }
    async componentWillMount() {
        let that = this;
        // let { push } = that.props;
        let userInfo;
        let userAccount = await storageUtils.GetUserAccount();
        let userAccountPwd = await storageUtils.GetUserAccountPwd();
        let accountUserInfo = await storageUtils.GetAccountUserInfo();
        let meetingInfo = await storageUtils.GetMeetingInfo();
        let CompanyInfo = await storageUtils.GetCompanyInfo();
        userInfo = { userName: userAccount, userPwd: userAccountPwd }
        if (userAccount) {
            this.setState({ userInfo });
        } else {
            let userName = await storageUtils.GetUserName();
            let userPwd = await storageUtils.GetUserPwd();
            console.error('======userPwd',userPwd)
            userInfo = { userName, userPwd };
            if (userName) {
                this.setState({ userInfo });
            }
        }
        if (userAccount && userAccountPwd) {
            this.setState({ userInfo: { userName: userAccount, userPwd: userAccountPwd } });
        }
        console.error('======userInfo',userInfo)

        if (userInfo.userName && userInfo.userPwd) {
            await axios.get('/rtc/api/misc/svgCode').then(res => {
                this.setState({ svgCode: res.result });
                let { userName, userPwd } = userInfo;
                let { svgCodeID } = res.result;
                let svgVerifyCode = "";
                let expireMMSeconds = 1000 * 3600 * 24;
                let password = userPwd;
                if (userName.indexOf("@") >= 0) {
                    var nameBox = userName.split('@');
                    let data = { userName: nameBox[0], accountName: nameBox[1], svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: false };
                    console.error('====login data',data);
                    axios.post('/rtc/api/misc/user/login', data)
                        .then(res => {
                            if (res.status === "ERROR") {
                                (async () => {
                                    await storageUtils.SetUserPwd('');
                                    await that.setState({ showLogin: true });
                                })()
                            } else if (res.status === "OK") {
                                (async () => {
                                    try {
                                        await storageUtils.SetUserName(userName);
                                        await storageUtils.SetUserPwd(userPwd);
                                        await storageUtils.SetUserAccount('');
                                        await storageUtils.SetUserAccountPwd('');
                                        console.log('====meetingInfo====login',meetingInfo)
                                        if (accountUserInfo && meetingInfo) {
                                            accountUserInfo = JSON.parse(accountUserInfo);
                                            meetingInfo = JSON.parse(meetingInfo);
                                            let nowTime = new Date().getTime();
                                            let meetingEndTime = new Date(meetingInfo.endDateObj).getTime();
                                            if (nowTime > meetingEndTime) {
                                                that.setState({ showLogin: true })
                                                await that.props.login({ name: md5(userName), password: password });
                                                await that.props.loginUser({ accessToken: res.result.accessToken, companyLogoUrl: res.result.companyLogoUrl, companyName: res.result.companyName, userInfo: res.result.userInfo });
                                                return that.props.history.push('/user/info');
                                            } else {
                                                let username = accountUserInfo.realName;
                                                if (!username) {
                                                    username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
                                                }
                                                // let username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
                                                await storageUtils.SetNickName(username);
                                                await storageUtils.SetUserRoomID(meetingInfo.roomID);
                                                let pin = meetingInfo.normalPwd;
                                                // let pin = await storageUtils.GetRoomNormalPwd();
                                                if (!pin) {
                                                    pin = "";
                                                }
                                                await that.enterMeeting(meetingInfo, accountUserInfo, that);
                                                if (CompanyInfo) {
                                                    await that.props.saveCompany({ CompanyInfo })
                                                }
                                                await that.props.login({ name: md5(userName), password: password });
                                                await that.props.loginUser({ accessToken: res.result.accessToken, companyLogoUrl: res.result.companyLogoUrl, companyName: res.result.companyName, userInfo: res.result.userInfo });
                                                await that.props.joinMeeting({ meetingInfo });
                                                username = username +"@^@"+userName;
                                               

                                                await that.props.connect({ username, room: meetingInfo.roomID, pin, connectAnyway: true });
                                                that.setState({ showLogin: true })
                                            }

                                        } else {

                                            await that.props.login({ name: md5(userName), password: password });
                                            await that.props.loginUser({ accessToken: res.result.accessToken, companyLogoUrl: res.result.companyLogoUrl, companyName: res.result.companyName, userInfo: res.result.userInfo });
                                            that.setState({ showLogin: true })
                                            await that.props.history.push('/user/info');
                                        }
                                    } catch (error) {
                                        that.setState({ showLogin: true })
                                    }
                                })()
                            }
                        }).catch(error => {
                            that.setState({ showLogin: true })
                        })
                } else {
                    let data = { accountName: userName, svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: false };
                    axios.post('/rtc/api/misc/account/login', data)
                        .then(res => {
                            if (res.status === "ERROR") {
                                (async () => {
                                    await storageUtils.SetUserAccountPwd('');
                                })()
                            } else if (res.status === "OK") {
                                (async () => {
                                    await storageUtils.SetUserAccount(userName);
                                    await storageUtils.SetUserAccountPwd(userPwd);
                                    await storageUtils.SetUserName('');
                                    await storageUtils.SetUserPwd('');
                                    await that.props.loginAccount({ accountToken: res.result.accessToken, accountInfo: res.result.accountInfo });
                                    await that.props.history.push('/company/profile');
                                })()
                            }
                        }).catch(error => {
                            that.setState({ showLogin: true })
                        })
                }
            })
        } else {
            console.error('======userInfo---------------------',userInfo)
            that.setState({ showLogin: true })
        }
    }
    enterMeeting(meetingInfo, userInfo, that) {
        let userNick = userInfo.realName;
        let userID = userInfo.userID;
        let data = { userNick, userID, meetingID: meetingInfo.meetingID };
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
    getCompanyInfo() {
        let that = this;
        (async () => {
            try {
                let userAccountName = await storageUtils.GetUserAccount();
                let userName = await storageUtils.GetUserName();
                let userAccount = "";
                if (userAccountName) {
                    userAccount = userAccountName
                }
                if (userName) {
                    let nameBox = userName.split('@');
                    userAccount = nameBox[1];
                }
                if (!userAccount) return;
                axios.get('/rtc/api/account/getCompanyInfo', { params: { accountName: userAccount } }).then((res) => {
                    if (res.status === "ERROR") {
                        message.error(res.error.message);
                    } else if (res.status === "OK") {
                        that.setState({ CompanyInfo: res.result })
                    }
                }).catch((error) => {
                    message.error(error);
                })
            } catch (error) {
                message.error(error);
            }
        })()
    }
    render() {
        const { getFieldDecorator } = this.props.form;

        let { showLogin } = this.state;
        let { conNect } = this.props;
        if (conNect == "1") {
            return message.warning('房间标记错误');
        } else if (conNect == "0") {
            this.props.history.push('/meeting');
        }
        return (
            <div className="login">
                {showLogin &&
                    <div>
                        <LoginAccount push={this.props.history.push} />
                        <LoginNotice push={this.props.history.push} />
                    </div>
                }
            </div >
        )
    }
}


const mapStateToProps = (state) => {
    console.log('===================state', state)
    return {
        conNect: state.conNect,
        account: state.account
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        login: (data) => {
            var action = actions.login(data);
            dispatch(action);

        },
        connect: (data) => {
            var action = actions.connect(data);
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
        //--------
        // connect: (data) => {
        //     var action = actions.connect(data);
        //     dispatch(action);
        // },
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Login));