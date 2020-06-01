import React, { Component } from 'react';
import { Button, Input, Table, Drawer, Form, Col, Row, message, Modal, Select } from 'antd';
import { connect } from 'react-redux';
import md5 from 'md5';
import axios from 'axios';
import './MeetingLog.css';
import moment from 'moment';
import _ from "underscore";
import { thisExpression } from '@babel/types';

const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;

const data = [];
class MeetingLog extends Component {
    constructor(props, context) {
        super(props, context);
        this.changeMeeting = this.changeMeeting.bind(this);
        this.changePage = this.changePage.bind(this);
        const columns = [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '昵称',
                key: 'userName',
                dataIndex: 'userName',
            },
            {
                title: '是否实名',
                dataIndex: 'isAnonymous',
                key: 'isAnonymous',
            },
            {
                title: '实名',
                dataIndex: 'createName',
                key: 'createName',
            },
            {
                title: '开始时间',
                dataIndex: 'begin',
                key: 'begin',
            },
            {
                title: '结束时间',
                key: 'end',
                dataIndex: 'end',
            },
        ];
        this.state = {
            columns,
            page: 1,
            limit: 10,
            total: 0,
            meetingInfo: {},
            meetingID: "",
            users: [],
            rooms: [],
            meetings: [],
            meetingLogs: [],
            showWrap: false,
        };
    }
    async componentWillMount() {
        let that = this;
        let { account, push } = this.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let accesstoken = account.accountToken;
        try {

            await that.getUsersList(that, accesstoken);
            await that.getMeetingsList(that, accesstoken);
            setTimeout(() => {
                that.getmeetingLogs();
            }, 1000)
        } catch (error) {
            message.error(error);
        }
    }
    async changePage(page, changePage) {
        await this.setState({ page });
        await this.getmeetingLogs();
    }
    getmeetingLogs() {
        let that = this;
        let { account, push } = that.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let accesstoken = account.accountToken;
        // let { push } = that.props;
        let { meetingInfo, limit, page, meetingID } = that.state;
        if (meetingID) {
            (async () => {
                await axios.get('/rtc/api/account/meetingLogs/pageData', { params: { meetingID, limit, page }, headers: { accesstoken } })
                    .then(res => {
                        console.log('=========getmeetingLogs', res);
                        if (res.status === "OK") {
                            let meetingLogs = res.result.data;
                            let { users, meetings } = that.state;
                            meetingLogs.map((item, index) => {
                                if (item.userID) {
                                    let userItem = _.first(_.where(users, { userID: item.userID }))
                                    if (userItem) {
                                        item.createName = userItem.realName;
                                    }
                                    item.isAnonymous = "是"
                                } else {
                                    item.createName = '';
                                    item.isAnonymous = "否"
                                }
                                // let meet
                                item.begin = moment(item.beginTime).format("YYYY-MM-DD HH:mm:ss");
                                if (item.endTime) {
                                    item.end = moment(item.endTime).format("YYYY-MM-DD HH:mm:ss");
                                } else {
                                    item.end = "";
                                }
                                item.key = index + 1;
                            })
                            that.setState({
                                meetingLogs: meetingLogs,
                                total: res.result.total,
                                showWrap: true,
                            })
                        } else if (res.status === "ERROR") {
                            message.error(res.error.message);
                        }
                    }).catch((error) => {
                        message.error(error);
                        return push('/login');
                    })
            })()
        }else{
            that.setState({
                meetingLogs: [],
                total: 0,
                showWrap: true,
            })
        }

    }
    getUsersList(that, accesstoken) {
        let { push } = that.props;
        (async () => {
            let data = { q: "", sort: "userId", desc: true, from: 0, count: 999999 };
            await axios.get('/rtc/api/account/users/pageData', { params: data, headers: { accesstoken } })
                .then(res => {
                    if (res.status === "OK") {
                        let users = res.result.data;
                        that.setState({
                            users: users,
                        })
                    } else if (res.status === "ERROR") {
                        message.error(res.error.message);
                    }
                }).catch((error) => {
                    message.error(error);
                    return push('/login');
                })
        })()
    }
    getMeetingsList(that, accesstoken) {
        let { push, account } = that.props;
        let accountID = '';
        if (account && account.accountInfo) {
            accountID = account.accountInfo.accountID;
        }
        (async () => {
            try {
                axios.get('/rtc/api/account/meetings', { params: { accountID, limit: 999999, page: 1 }, headers: { accesstoken } })
                    .then(res => {
                        console.log('======res getMeetingsList', res);
                        if (res.status === "OK") {
                            let meetings = res.result.data;
                            let meetingInfo = {};
                            let meetingID = "";
                            if (meetings.length > 0) {
                                meetingInfo = meetings[0];
                                meetingID = meetings[0].meetingID;
                            }
                            that.setState({
                                meetings: meetings,
                                meetingInfo,
                                meetingID,
                            })
                        } else if (res.status === "ERROR") {
                            message.error(res.error.message);
                        }
                    }).catch((error) => {
                        message.error(error);
                        return push('/login');
                    })
            } catch (error) {
                message.error(error);
            }
        })()
    }
    changeMeeting(event) {
        console.log('=========changeMeeting', event);
        let meetingID = event;
        let that = this;
        let { account, push } = that.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let accesstoken = account.accountToken;
        that.setState({ page: 1, meetingID });
        setTimeout(() => {
            that.getmeetingLogs(that, accesstoken);
        }, 500);

    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { account } = this.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        let { page, limit, total, meetingLogs, meetingInfo, meetings, showWrap, meetingID, columns } = this.state;
        return (
            <div style={{ padding: '20px' }}>
                {showWrap &&
                    <div>
                        <div className="users_header">
                            <div>
                                <Select defaultValue={meetingID} style={{ width: '100%', maxHeight: "170px" }} onChange={this.changeMeeting}>
                                    {
                                        Object.entries(meetings).map(item => {
                                            return (<Option value={item[1].meetingID} key={item[1].meetingID}>{item[1].topic}</Option>)
                                        })
                                    }
                                </Select>
                            </div>
                        </div>
                        {meetingLogs.length > 0 && showWrap &&
                            <Table columns={columns} dataSource={meetingLogs} pagination={{ defaultPageSize: limit, total, onChange: this.changePage }} />
                        }
                        {meetingLogs.length < 1 && showWrap &&
                            <div>
                                <div>
                                    当前没有参会日志，请添加！！！
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        account: state.account
    };
}

export default connect(mapStateToProps, null)(Form.create()(MeetingLog));