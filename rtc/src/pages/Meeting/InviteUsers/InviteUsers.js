import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Form, Button, message, Select, } from 'antd'
import './InviteUsers.css';
import InviteUsersItem from './InviteUsersItem';
import _ from 'underscore';
import axios from 'axios';
const { Option } = Select;

class InviteUsers extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { users } = this.props;
        return (
            <ul className="be_invited_user">
                {
                   users.map((item) => (
                        <InviteUsersItem key={item.userID} user={item} beInvited={item.beInvited}/>
                   ))
                }
            </ul>
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
export default connect(mapStateToProps, null)(Form.create()(InviteUsers));