import React, { Component } from 'react';
import { Button, Input, Table, Drawer, Form, Col, Row, message, Modal } from 'antd';
import { connect } from 'react-redux';
import md5 from 'md5';
import axios from 'axios';
import './Rooms.css';
import moment from 'moment';
import _ from "underscore";
import { thisExpression } from '@babel/types';
import Tips from '../../../../config/Tips';

const { Search } = Input;
const { confirm } = Modal;
const data = [];
class Rooms extends Component {
    constructor(props, context) {
        super(props, context);
        this.searchMeetingRoomByName = this.searchMeetingRoomByName.bind(this);
        this.changePage = this.changePage.bind(this);
        this.reloadData = this.reloadData.bind(this);
        const columns = [
            {
                title: '会议室名称',
                dataIndex: 'name',
                key: 'name',
                ellipsis:true
            },
            {
                title: '创建时间',
                dataIndex: 'createDate',
                key: 'createDate',
            },
            {
                title: '简介',
                dataIndex: 'desc',
                key: 'desc',
                ellipsis:true
            },
            {
                title: '操作',
                key: 'operation',
                dataIndex: 'operation',
                render: (text, record) => (
                    <span>
                        <Button className="rooms_operation_btn" type="primary" onClick={() => this.EditRoomInfo(record)}>编辑</Button>
                        <Button className="rooms_operation_btn" type="primary" onClick={() => this.resetPwd(record)}>重置密码</Button>
                        <Button className="rooms_operation_btn" type="danger" onClick={() => this.removeRoom(record.roomID)}>删除</Button>
                    </span>
                ),
            },
        ];
        this.state = {
            visible: false,
            edit: false,
            reset: false,
            roomInfo: {},
            rooms: [],
            total: 0,
            columns,
            userData: {},
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
        await this.getRoomsList();
    }
    async reloadData(){
        this.refs.searchBar.input.state.value='';
        await this.setState({page:1,searchName:"",isSearch:false});
        await this.getRoomsList();
    }
    async changePage(page, changePage) {
        await this.setState({ page });
        await this.getRoomsList();
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
    getRoomsList() {
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
            that.searchMeetingRoomByName(searchName);
        } else {
            (async () => {
                try {
                    axios.get('/rtc/api/account/meetingsRooms/all', { params: { accountID, limit, page }, headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                let rooms = res.result.data;
                                rooms.map((item, index) => {
                                    item.key = index;
                                    let createTime = new Date(item.createDateObj).getTime();
                                    item.createDate = moment(createTime).format("YYYY-MM-DD HH:mm");
                                })
                                that.setState({
                                    rooms,
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
                } catch (error) {
                    message.error(error);
                }
            })()
        }

    }
    searchMeetingRoomByName(value) {
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
            (async () => {
                try {
                    await that.setState({ searchName: "", page: 1, isSearch: false });
                    await that.getRoomsList();
                } catch (error) {
                    message.error(error);
                }
            })()
        } else {
            (async () => {
                try {
                    console.error('======isSearch', isSearch, page)
                    if (!isSearch) {
                        page = 1;
                    }
                    console.error('======isSearch', isSearch, page)
                    let data = { accountID, page, limit, name: value };
                    axios.get('/rtc/api/account/searchRooms', { params: data, headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                let rooms = res.result.data;
                                rooms.map((item, index) => {
                                    item.key = index;
                                    let createTime = new Date(item.createDateObj).getTime();
                                    item.createDate = moment(createTime).format("YYYY-MM-DD HH:mm");
                                })
                                if (!isSearch) {
                                    that.setState({
                                        rooms,
                                        total: res.result.total,
                                        showWrap: true,
                                        searchName: value,
                                        isSearch: true,
                                        page: 1
                                    })
                                } else {
                                    that.setState({
                                        rooms,
                                        total: res.result.total,
                                        showWrap: true,
                                        searchName: value,
                                    })
                                }
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
    EditRoomInfo(e) {
        this.setState({ roomInfo: e });
        this.setState({
            visible: true,
            edit: true,
        });
    }
    onClose = () => {
        this.setState({
            visible: false,
            roomInfo: {},
            edit: false,
            reset: false,
        });
    };
    resetPwd(e) {
        this.setState({ roomInfo: e });
        this.setState({
            visible: true,
            reset: true,
        });
    }
    removeRoom(e) {
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
            title: '确认删除此会议室吗?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                (async () => {
                    try {
                        let data = { roomID: e };
                        axios.post('/rtc/api/account/meetingsRooms/delete', data, { headers: { "accesstoken": account.accountToken } })
                            .then(res => {
                                if (res.status === "OK") {
                                    (async () => {
                                        let { rooms, page, searchName } = that.state;
                                        if (rooms.length == 0) {
                                            if (page > 0) {
                                                page--;
                                            } else {
                                                page = 1;
                                            }
                                        }
                                        await that.setState({ page })
                                        await message.success('删除成功');
                                        if (searchName) {
                                            await that.searchMeetingRoomByName(searchName);
                                        } else {
                                            await that.getRoomsList();
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
    handleSubmit = e => {
        e.preventDefault();
        let that = this;
        let { edit, roomInfo } = that.state;
        let { account, push } = this.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        if (!accountInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (edit) {
                    //编辑
                    let { name, desc } = values;
                    if (!name) return message.error("会议室名称不能为空");
                    if (!roomInfo.roomID) return message.error('会议室不存在');
                    if (!desc) {
                        desc = "";
                    }
                    let data = { roomID: roomInfo.roomID, name, desc, state: 1 };
                    axios.post('/rtc/api/account/meetingsRooms/edit', data, { headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                if (res.result) {
                                    message.success('编辑成功');
                                    that.getRoomsList();
                                    that.onClose();
                                } else {
                                    message.error('编辑失败');
                                }
                            } else if (res.status === "ERROR") {
                                message.error(res.error.message);
                            }
                        }).catch((error) => {
                            message.error(error);
                            return push('/login');
                        })
                } else {
                    //重置密码
                    let { charmanPwd, normalPwd } = values;
                    if (!charmanPwd) return message.error("主持人密码不能为空");
                    if (!roomInfo.roomID) return message.error('会议室不存在');
                    if (!normalPwd) {
                        normalPwd = "";
                    } else {
                        normalPwd = md5(normalPwd);
                    }
                    charmanPwd = md5(charmanPwd);
                    let data = { roomID: roomInfo.roomID, charmanPwd, normalPwd, state: 2 };
                    axios.post('/rtc/api/account/meetingsRooms/edit', data, { headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                if (res.result) {
                                    message.success('重置成功');
                                    that.onClose();
                                } else {
                                    message.error('重置失败');
                                }
                            } else if (res.status === "ERROR") {
                                message.error(res.error.message);
                            }
                        }).catch((error) => {
                            message.error(error);
                            return push('/login');
                        })
                }
            }
        })
    }
    checkNames(rule, value, callback) {
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
    checkDesc(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        if(len > 256){
            callback(global.meetingNameLong.writtenWords)
        }else {
            callback();
        }
    }
    checkCharmanPwd(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        var reg=/^[0-9a-zA-Z]*$/i;
        if(!reg.test(value)){
            callback('只能输入字母与数字');
        }else if(len == 0){
            callback()
        }else if(len< 4 || len > 24){
            callback(global.password.writtenWords)
        }else {
            callback();
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { account } = this.props;
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        let { rooms, columns, total, showWrap, limit, page, roomInfo, edit, reset } = this.state;
        return (
            <div style={{ padding: '20px' }}>
                <div className="rooms_header">
                    <div>
                        <div className="rooms_search">
                            <Search ref= "searchBar" placeholder="请输入会议室名称" onSearch={this.searchMeetingRoomByName} enterButton />
                        </div>
                        <div>
                        <Button type="primary" onClick={this.reloadData} style={{marginLeft:"5px"}}>刷新</Button>
                        </div>
                        {roomInfo.roomID &&
                            <Drawer title={edit ? "编辑会议室" : "重置密码"} width={720} onClose={this.onClose} visible={this.state.visible}>
                                <Form onSubmit={this.handleSubmit} className="password_box">
                                    <Input type="userName" autoComplete="new-password" hidden />
                                    <Input type="password" autoComplete="new-password" hidden />
                                    {edit ?
                                        <div>
                                            <Row gutter={24}>
                                                <Col span={24}>
                                                    <Form.Item label="会议室名称">
                                                        {getFieldDecorator('name', {
                                                            initialValue: roomInfo.name,
                                                            rules: [{ required: true, message: '请输入会议室名称'},{ validator: (rule, value, callback) => { this.checkNames(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                        })(<Input style={{ width: '100%' }} placeholder="请输入会议室名称" />)}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={24}>
                                                <Col span={24}>
                                                    <Form.Item label="会议室介绍">
                                                        {getFieldDecorator('desc', {
                                                            initialValue: roomInfo.desc,
                                                            rules: [{ validator: (rule, value, callback) => { this.checkDesc(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                        })(
                                                            <Input style={{ width: '100%' }} placeholder="请输入会议室介绍" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </div>
                                        :
                                        <div>
                                            <Row gutter={24}>
                                                <Col span={24}>
                                                    <Form.Item label="主持人密码">
                                                        {getFieldDecorator('charmanPwd', {
                                                            rules: [{ required: true,whitespace:true, message: '请输入主持人密码'},{ validator: (rule, value, callback) => { this.checkCharmanPwd(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                        })(<Input type="password" placeholder="请输入主持人密码" autoComplete="off" />)}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={24}>
                                                <Col span={24}>
                                                    <Form.Item label="会议室密码">
                                                        {getFieldDecorator('normalPwd', {
                                                            rules: [{ validator: (rule, value, callback) => { this.checkCharmanPwd(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                        })(<Input type="password" placeholder="请输入会议室密码" autoComplete="off" />)}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </div>
                                    }
                                    <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                                        <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                                        <Button type="primary" htmlType="submit" >提交</Button>
                                    </div>
                                </Form>
                            </Drawer>

                        }
                    </div>
                </div>
                {rooms.length > 0 && showWrap &&
                    <Table columns={columns} dataSource={rooms} pagination={{ defaultPageSize: limit, total, current: page, onChange: this.changePage }} />
                }
                {rooms.length < 1 && showWrap &&
                    <div>
                        <div>
                            当前没有会议室，请添加！！！
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

export default connect(mapStateToProps, null)(Form.create()(Rooms));