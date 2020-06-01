import React, { Component } from 'react';
import { Button, Input, Table, Drawer, Form, Col, Row, message, Modal } from 'antd';
import { connect } from 'react-redux';
import md5 from 'md5';
import axios from 'axios';
import './Meetings.css';
import moment from 'moment';
import _ from "underscore";
import { thisExpression } from '@babel/types';

const { Search } = Input;
const { confirm } = Modal;
const data = [];
class Meetings extends Component {
    constructor(props, context) {
        super(props, context);
        this.searchMeeting = this.searchMeeting.bind(this);
        this.changePage = this.changePage.bind(this);
        this.reloadData = this.reloadData.bind(this);
        const columns = [
            {
                title: '会议名称',
                dataIndex: 'topic',
                key: 'topic',
            },
            {
                title: '会议室',
                dataIndex: 'roomName',
                key: 'roomName',
            },
            {
                title: '开始时间',
                dataIndex: 'startDate',
                key: 'startDate',
            },
            {
                title: '结束时间',
                key: 'endDate',
                dataIndex: 'endDate',
            },
            {
                title: '创建者',
                key: 'creator',
                dataIndex: 'creator',
            },
            {
                title: '操作',
                key: 'operation',
                dataIndex: 'operation',
                render: (text, record) => (
                    <span>
                        {/* <Button type="primary" onClick={() => this.EditUser(record)}>编辑</Button> */}
                        <Button type="danger" onClick={() => this.removeMeeting(record.meetingID)}>删除</Button>
                    </span>
                ),
            },
        ];
        this.state = {
            visible: false,
            meetingList: [],
            total: 0,
            columns,
            userData: {},
            edit: false,
            resetPwdShow: false,
            resetPwdData: {},
            page: 1,
            limit: 10,
            users: [],
            showWrap: false,
            searchName: "",
            isSearch: false,
        };
    }
    async componentWillMount() {
        let that = this;
        await this.getUsersList();
        setTimeout(() => {
            that.getMeetingsList();
        }, 500);
    }
    async reloadData() {
        let that = this;
        this.refs.searchBar.input.state.value = '';
        await this.setState({ page: 1, searchName: "", isSearch: false });
        await this.getUsersList();
        setTimeout(function () {
            that.getMeetingsList();
        }, 500)
    }
    async changePage(page, changePage) {
        await this.setState({ page });
        await this.getMeetingsList();
    }
    getUsersList() {
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

        (async () => {
            let data = { q: "", sort: "userId", desc: true, from: 0, count: 999 };
            await axios.get('/rtc/api/account/users/pageData', { params: data, headers: { "accesstoken": account.accountToken } })
                .then(res => {
                    if (res.status === "OK") {
                        let users = res.result.data;
                        users.map((item) => {
                            item.createDate = moment(item.createDate).format("YYYY-MM-DD HH:mm:ss");
                            item.loginName = item.userName + "@" + accountInfo.accountName;
                            item.operation = "暂无";
                        })
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
    getMeetingsList() {
        let that = this;
        let { account, push } = this.props;
        let accountInfo = {};
        let accountID = '';
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
            accountID = account.accountInfo.accountID;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let { page, limit, searchName } = this.state;
        if (searchName) {
            that.searchMeeting(searchName);
        } else {
            (async () => {
                try {
                    axios.get('/rtc/api/account/meetings', { params: { accountID, limit, page }, headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            console.log('======res hasUser', res);
                            if (res.status === "OK") {
                                let users = that.state.users;
                                let meetingList = res.result.data;
                                meetingList.map((item, index) => {
                                    if (!item.remarks) {
                                        item.remarks = "全体参与，无故不得缺席！！！"
                                    }
                                    item.key = index;
                                    if (item.topic) {
                                        item.meetingName = item.topic;
                                    } else {
                                        item.meetingName = item.roomName;
                                    }
                                    let user = _.first(_.where(users, { userID: item.userID }));
                                    if (user) {
                                        item.creator = user.realName;
                                    } else {
                                        item.creator = '员工已离职';
                                    }
                                    let startTime = new Date(item.startDateObj).getTime();
                                    let endTime = new Date(item.endDateObj).getTime();
                                    item.startDate = moment(startTime).format("YYYY-MM-DD HH:mm");
                                    item.endDate = moment(endTime).format("YYYY-MM-DD HH:mm");
                                })
                                that.setState({
                                    meetingList: meetingList,
                                    total: res.result.total,
                                    showWrap: true
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

    }
    searchMeeting(value) {
        let that = this;
        let { account, push } = this.props;
        let accountInfo = {};
        let accountID = '';
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
            accountID = account.accountInfo.accountID;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let { page, limit, isSearch } = this.state;
        if (!value) {
            page = 1;
            isSearch = false;
        } else {
            if (!isSearch) {
                page = 1;
                isSearch = true;
            }
        }
        // if (!value) return;
        (async () => {
            try {
                let data = { accountID, page, limit, name: value };
                axios.get('/rtc/api/account/searchMeetings', { params: data, headers: { "accesstoken": account.accountToken } })
                    .then(res => {
                        console.log('======res hasUser', res);
                        if (res.status === "OK") {
                            let users = that.state.users;
                            let meetingList = res.result.data;
                            meetingList.map((item, index) => {
                                if (!item.remarks) {
                                    item.remarks = "全体参与，无故不得缺席！！！"
                                }
                                item.key = index;
                                if (item.topic) {
                                    item.meetingName = item.topic;
                                } else {
                                    item.meetingName = item.roomName;
                                }
                                let user = _.first(_.where(users, { userID: item.userID }));
                                if (user) {
                                    item.creator = user.realName;
                                } else {
                                    item.creator = '员工已离职';
                                }
                                let startTime = new Date(item.startDateObj).getTime();
                                let endTime = new Date(item.endDateObj).getTime();
                                item.startDate = moment(startTime).format("YYYY-MM-DD HH:mm");
                                item.endDate = moment(endTime).format("YYYY-MM-DD HH:mm");
                            })
                            that.setState({
                                meetingList: meetingList,
                                total: res.result.total,
                                showWrap: true,
                                searchName: value,
                                page,
                                isSearch,
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
    removeMeeting(e) {
        let that = this;
        let { account, push } = this.props;
        let accountInfo = {};
        let accountID = '';
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
            accountID = account.accountInfo.accountID;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        confirm({
            title: '确认删除此会议吗?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                (async () => {
                    try {
                        let data = { meetingID: e };
                        axios.post('/rtc/api/account/deleteMeeting', data, { headers: { "accesstoken": account.accountToken } })
                            .then(res => {
                                console.log('======res hasUser', res);
                                if (res.status === "OK") {
                                    (async () => {
                                        let { meetingList, page, searchName } = that.state;
                                        if (meetingList.length == 0) {
                                            if (page > 0) {
                                                page--;
                                            } else {
                                                page = 1;
                                            }
                                        }

                                        await that.setState({ page })
                                        await message.success('删除成功');
                                        if (searchName) {
                                            await that.searchMeeting(searchName);
                                        } else {
                                            await that.getMeetingsList();
                                        }
                                    })()

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
        })

    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { account } = this.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        let { meetingList, columns, total, showWrap, limit, page } = this.state;
        return (
            <div style={{ padding: '20px' }}>
                <div className="users_header">
                    <div>
                        <div className="users_search"><Search ref="searchBar" placeholder="请输入会议名称" onSearch={this.searchMeeting} enterButton /></div>
                        <div>
                            <Button type="primary" onClick={this.reloadData} style={{ marginLeft: "5px" }}>刷新</Button>
                        </div>
                    </div>
                </div>
                {meetingList.length > 0 && showWrap &&
                    <Table columns={columns} dataSource={meetingList} pagination={{ defaultPageSize: limit, total, current: page, onChange: this.changePage }} />
                }
                {meetingList.length < 1 && showWrap &&
                    <div>
                        <div>
                            当前没有会议，请添加！！！
                    </div>
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

export default connect(mapStateToProps, null)(Form.create()(Meetings));