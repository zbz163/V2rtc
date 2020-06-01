import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Form, Button, message, Select, } from 'antd'
import axios from 'axios';
const { Option } = Select;

class InviteUsersItem extends Component {
    constructor(props) {
        super(props);
        this.inviteUserByID = this.inviteUserByID.bind(this);
        this.state = {
            beInvited:false,
        }
    }
    componentWillMount() {
        let {beInvited} = this.props;
        this.setState({beInvited});
    }
    inviteUserByID(e) {
        let that = this;
        let userID = event.target.getAttribute("data-userid");
        let {account,meetingInfo} = this.props;
        let accountID;
        if (account && account.accessToken) {
            accountID = account.userInfo.accountID;
        } else {
            return message.error('请先登录');
        }
        let meetingID = meetingInfo.meetingID;
        let data = {meetingID,userID};
        axios.post('/rtc/api/user/meetings/addMeetingUsers',data,{headers: { "accesstoken": account.accessToken }}).then((res)=>{
            if (res.status === "ERROR") {
                message.error(res.error.message);
            } else if (res.status === "OK") {
                that.setState({beInvited:true});
            }
        }).catch((error) => {
            message.error(error);
        })
    }
    render() {
        let { user } = this.props;
        let {beInvited} = this.state;
        return (
            <li className="be_invited_user_li">
                <span className="be_invited_user_li_left">{user.userName}</span>
                {!beInvited &&
                    <Button  type="primary" className="be_invited_user_li_right" data-userid={user.userID} onClick={this.inviteUserByID}>邀请</Button>
                }
                {beInvited &&
                    <Button type="primary" disabled className="be_invited_user_li_right">已邀请</Button>
                }
            </li>
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
export default connect(mapStateToProps, null)(Form.create()(InviteUsersItem));