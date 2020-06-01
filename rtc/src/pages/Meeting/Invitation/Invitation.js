import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Form, Button, message, Select } from 'antd'
import './Invitation.css';
import InviteUsers from '../InviteUsers/InviteUsers';
import _ from 'underscore';
import copy from 'copy-to-clipboard';
import axios from 'axios';
const { Option } = Select;

class Invitation extends Component {
    constructor(props) {
        super(props);
        this.generateLink = this.generateLink.bind(this);
        this.invitationUsers = this.invitationUsers.bind(this);
        this.copyLink = this.copyLink.bind(this);
        this.copyliveLink = this.copyliveLink.bind(this);
        this.state = {
            Invitation: 'none',
            linkData: null,
            liveData:null,
            users: [],
            showInvitationUsers: false,
        }
    }
    componentWillMount() {
        let { meetingInfo } = this.props;
        let that = this;
        let path, meetingID,invitaPath,livePath;
        if (meetingInfo && meetingInfo.meetingID) {
            meetingID = meetingInfo.meetingID;
        }
        if (!meetingID) {
            return ;
        } else {
            invitaPath = `${window.location.origin}/invite/${meetingID}`;
            livePath = `${window.location.origin}/live/${meetingID}`;
            that.setState({ linkData: invitaPath ,liveData:livePath})
        }
    }
    change = () => {
        this.props.Invitation(this.state.Invitation);
    }
    generateLink() {
        let { meetingInfo } = this.props;
        let that = this;
        let path, meetingID;
        if (meetingInfo && meetingInfo.meetingID) {
            meetingID = meetingInfo.meetingID;
        }
        if (!meetingID) {
            return message.error('您现在不在会议室，请先进入会议室')
        } else {
            path = `${window.location.origin}/invite/${meetingID}`;
            that.setState({ linkData: path })
        }
    }
    invitationUsers() {
        let that = this;
        let { showInvitationUsers } = this.state;
        if (showInvitationUsers) {
            this.setState({ showInvitationUsers: false });
        } else {
            let { account } = this.props;
            let accountID;
            if (account && account.accessToken) {
                accountID = account.userInfo.accountID;
            } else {
                return message.error('请先登录');
            }
            axios.get('/rtc/api/user/users/all', { params: { accountID }, headers: { "accesstoken": account.accessToken } }).then((res) => {
                if (res.status === "ERROR") {
                    message.error(res.error.message);
                } else if (res.status === "OK") {
                    let users = res.result.data;
                    if (users.length > 0) {
                        let { meetingInfo } = that.props;
                        let invitedUsers;
                        if (meetingInfo && meetingInfo.meetingID) {
                            invitedUsers = meetingInfo.users;
                        }
                        invitedUsers.map((item) => {
                            for (let i = 0; i < users.length; i++) {
                                let itemUser = users[i];
                                if (itemUser.userID === item) {
                                    itemUser.beInvited = true;
                                    break;
                                }
                            }
                        })
                        that.setState({ showInvitationUsers: true, users });
                    }
                }
            }).catch((error) => {
                message.error(error);
            })
        }
    }
    copyLink() {
        let { linkData } = this.state;
        copy(linkData);
        message.success('复制成功')
    }
    copyliveLink(){
        let { liveData } = this.state;
        copy(liveData);
        message.success('复制成功')
    }
    render() {
        let { linkData,liveData, showInvitationUsers, users } = this.state;
        return (
            <div className="in_p">
                <div className="invitation_top">
                    <span>邀请成员</span>
                    <div className="invitation_btn" onClick={this.change}>退回</div>
                </div>
                {/* <Button type="primary" onClick={this.generateLink} style={{ width: "100%", borderRadius: '20px', marginTop: '20px' }}>生成邀请链接</Button> */}
                {linkData &&
                    <div className="invitation_link">
                        <h4 className="invitation_link_title">会议室入会链接</h4>
                        <p className="invitation_link_info" id="copyLink" >{linkData}</p>
                        <Button data-clipboard-action="copy" data-clipboard-target="#copyLink" type="primary" onClick={this.copyLink} style={{ width: "60%", borderRadius: '20px', marginTop: '20px' }}>复制链接</Button>
                    </div>
                    
                }
                {liveData &&
                    <div className="live_link">
                    <h4 className="live_link_title">直播观看链接</h4>
                    <p className="live_link_info" id="copyLink" >{liveData}</p>
                    <Button data-clipboard-action="copy" data-clipboard-target="#copyLink" type="primary" onClick={this.copyliveLink} style={{ width: "60%", borderRadius: '20px', marginTop: '20px' }}>复制链接</Button>
                </div>
                }
                {/* <Button type="primary" onClick={this.invitationUsers} style={{ width: "100%", borderRadius: '20px', marginTop: '20px' }}>邀请成员</Button>
                {showInvitationUsers &&
                    <InviteUsers users={users} />
                }
                <div className="invitation_form">
                    <div className="form_sip">
                        <p>拨叫一个设备或者电话到会议中（SIP）:</p>
                        <div className="sip_ip">
                            <input type="text" placeholder="输入SIP地址" />
                        </div>
                        <div className="sip_btn"><span>拨叫</span></div>
                        <div className="ip_onbulr">
                            <img src={require('../../../images/phone.jpg')} alt="" />
                            <p>SIP呼入地址:<span></span></p>
                        </div>
                    </div>
                    <div className="form_sip sip_two">
                        <p>使用一个视频会议终端加入(SIP):</p>
                        <div className="sip_ip">
                            <input type="text" placeholder="输入SIP地址" />
                        </div>
                        <div className="sip_btn" id="sip_address"><span>拷贝地址</span></div>
                    </div>
                    <div className="form_sip">
                        <p>使用电脑或智能手机加入:</p>
                        <div className="sip_ip">
                            <input type="text" placeholder="输入SIP地址" />
                        </div>
                        <div className="sip_btn" id="sip_address"><span>拷贝链接</span></div>
                    </div>
                </div> */}
            </div>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        room: state.teevid.meeting.room,
        account: state.account.user,
        meetingInfo: state.meetingInfo,
    };
}

export default connect(mapStateToProps, null)(Form.create()(Invitation));

// export default Form.create()(Invitation);