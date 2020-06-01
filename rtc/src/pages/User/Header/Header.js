import React, { Component } from 'react';
import { Button, Modal, message } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import md5 from 'md5';
import './Header.css';
import * as actions from './action.js';
// import LoginNotice from '../LoginNotice/LoginNotice';
import { storageUtils } from '../../../utils';

const { confirm } = Modal;


class CompanyUser extends Component {
    constructor(props) {
        super(props);
        this.logoutUser = this.logoutUser.bind(this);
        this.logOffUser = this.logOffUser.bind(this);
        this.toMeetingManage = this.toMeetingManage.bind(this);
        this.state = {
            userInfo: {},
        }
    }
    componentWillMount() {
        let that = this;
        let { user, push } = this.props;
        if (user && !user.companyName) {
            return push('/login');
        } else {
            if (user && !user.accessToken) {
                return push('/login');
            }
        }
        this.setState({ userInfo: user.userInfo })
    }
    toMeetingManage() {
        let { push } = this.props;
        push('/user/meetingsList');
    }
    logOffUser() {
        let that = this;
        let { user, push } = this.props;
        if (!user) {
            // message.error('请先登录');
            return push('/login');
        } else {
            if (!user.accessToken) {
                message.error('请先登录');
                return push('/login');
            } else {
                confirm({
                    title: '确认注销吗?',
                    okText: '确认',
                    cancelText: '取消',
                    onOk() {
                        axios.get('/rtc/api/user/logout', { params: {}, headers: { "accesstoken": user.accessToken } })
                            .then(res => {
                                if (res.status === "OK") {
                                    message.success('注销成功');
                                    (async () => {
                                        await storageUtils.SetUserName("");
                                        await storageUtils.SetUserPwd("");
                                        await that.props.logoutUser();
                                        return push('/login');
                                    })()
                                } else if (res.status === "ERROR") {
                                    message.error(res.error.message);
                                    return push('/login');
                                }
                            }).catch(error => {
                                message.error(error);
                                return push('/login');
                            })
                    }
                });
            }
        }
    }
    logoutUser() {
        let that = this;
        let { user, push } = this.props;
        if (!user) {
            // message.error('请先登录');
            return push('/login');
        } else {
            if (!user.accessToken) {
                message.error('请先登录');
                return push('/login');
            } else {
                confirm({
                    title: '确认退出吗?',
                    okText: '确认',
                    cancelText: '取消',
                    onOk() {
                        axios.get('/rtc/api/user/logout', { params: {}, headers: { "accesstoken": user.accessToken } })
                            .then(res => {
                                if (res.status === "OK") {
                                    message.success('退出成功');
                                    (async () => {
                                        await storageUtils.SetUserPwd("");
                                        let a = await storageUtils.GetUserPwd();
                                        let b = await storageUtils.GetUserName();
                                        await that.props.logoutUser();
                                        await push('/login');
                                    })()

                                } else if (res.status === "ERROR") {
                                    message.error(res.error.message);
                                    return push('/login');
                                }
                            }).catch(error => {
                                message.error(error);
                                return push('/login');
                            })
                    }
                });
            }
        }
    }
    homepage_portrait_box() {
        const portrait_list = document.getElementById("portrait_list");
        if (portrait_list.style.display == 'none') {
            portrait_list.style.display = 'block'
        } else if (portrait_list.style.display == 'block') {
            portrait_list.style.display = 'none'
        }
    }
    render() {
        let { user, conNect, push } = this.props;
        let { userInfo } = this.state;
        if (conNect && conNect == 0) {
            push('/meeting');
        }
        return (
            <div className="homepage_portrait">
                {user && user.companyName &&
                    <div className="homepage_name">
                        <p>{user.userInfo.realName}</p>
                        <p>{user.companyName}</p>
                    </div>
                }
                {userInfo.avatarUrl &&
                    <div className="homepage_portrait_box" onClick={this.homepage_portrait_box}>
                        <img className="homepage_portrait_box_img" src={userInfo.avatarUrl} alt="" />
                    </div>
                }
                {!userInfo.avatarUrl &&
                    <div className="homepage_portrait_box" onClick={this.homepage_portrait_box}>
                        <img className="homepage_portrait_box_img" src={require('../../../images/avatar.jpg')} alt="" />
                    </div>
                }
                {/* <div className="homepage_portrait_box" onClick={this.homepage_portrait_box}></div> */}
                <div className="portrait_list" id="portrait_list" style={{ display: 'none' }}>
                    <div onClick={this.toMeetingManage}>会议管理</div>
                    <div onClick={this.logoutUser}>退出登录</div>
                    <div onClick={this.logOffUser}>注销</div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.account.user,
        conNect: state.conNect,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        logoutUser: () => {
            var action = actions.logoutUser();
            dispatch(action);
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyUser);

