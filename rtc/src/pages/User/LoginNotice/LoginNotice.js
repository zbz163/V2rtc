import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, message, Modal, Table, Select, DatePicker } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import axios from "axios";
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import _ from "underscore";
import md5 from 'md5';
import { storageUtils } from '../../../utils';
import MeetingCharmanPwd from '../meetingCharmanPwd/MeetingCharmanPwd';
import { resolveOnChange } from 'antd/lib/input/Input';
import Tips from '../../../config/Tips';
const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;
class NewMeeting extends Component {
    constructor(props, context) {
        super(props, context);
        this.changeMeetingRoom = this.changeMeetingRoom.bind(this);
        this.open = this.open.bind(this);
        this.state = {
            nickName: "",
            data: [],
            page: 1,
            visible: false,
            NotifyList: [],
            changeMeeting: "",
            changeNotify: [],
            startValue: moment(new Date(), "YYYY-MM-DD HH-MM-SS"),
            endValue: null,
            endOpen: false,
            newMeetingInfo: {
                meetingName: "",
                roomName: "",
                note: "",
                meetingUsers: []
            },
            open: 'none',
            down: 'block',
            up: 'none'
        }
    }
    
    componentWillMount() {
        let that = this;
        (async () => {
            let nowTime = new Date();
            let meetingTime = await storageUtils.GetMeetingTime();
            let endTime;
            if (meetingTime) {
                meetingTime = parseInt(meetingTime);
                endTime = nowTime.getTime() + meetingTime;
            } else {
                endTime = nowTime.getTime() + (2 * 60 * 60 * 1000);
            }
            endTime = moment(new Date(endTime), "YYYY-MM-DD HH-MM-SS");
            let { changeMeeting, newMeetingInfo, staffList } = that.props;
            if (changeMeeting && newMeetingInfo) {
                let changeNotify = newMeetingInfo.meetingUsers;
                changeNotify = _.pluck(changeNotify, "userID");
                let staffListArr = [];
                if (changeNotify.length > 0) {
                    for (let i = 0; i < changeNotify.length; i++) {
                        let item = _.first(_.where(staffList, { userID: changeNotify[i] }));
                        if (item) {
                            staffListArr.push(item);
                        }
                    }
                }
                if (staffListArr.length > 0) {
                    staffListArr = _.pluck(staffListArr, "userID");
                }
                await that.setState({ endValue: endTime, changeMeeting, newMeetingInfo, changeNotify: staffListArr });
            }
        })()
    }
    changeMeetingRoom(event) {
        let roomID = event;
        let { newMeetingInfo, changeMeeting, changeNotify } = this.state;
        let { staffList, roomsList } = this.props;
        let staffListArr = [];
        if (roomsList.length > 0) {
            roomsList.forEach((value, index, array) => {
                if (value.roomID === event) {
                    if (value.users.length > 0) {
                        let usersList = value.users;
                        newMeetingInfo.meetingUsers = value.users;
                        changeNotify = _.pluck(usersList, "userID");


                        if (changeNotify.length > 0) {
                            for (let i = 0; i < changeNotify.length; i++) {
                                let item = _.first(_.where(staffList, { userID: changeNotify[i] }));
                                if (item) {
                                    staffListArr.push(item);
                                }
                            }
                        }
                        if (staffListArr.length > 0) {
                            staffListArr = _.pluck(staffListArr, "userID");
                        }
                    } else {
                        if (staffList.length > 0) {
                            newMeetingInfo.meetingUsers = [staffList[0].userID];
                            // changeNotify = [staffList[0].userID]
                            staffListArr = [staffList[0].userID]
                        }
                    }
                    return;
                }
            })
        }
        this.setState({ changeMeeting: event, newMeetingInfo, changeNotify: staffListArr })
    }
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    };

    onStartChange = value => {
        let startValue = value;
    };

    onEndChange = value => {
        let endValue = value;
    };

    handleStartOpenChange = open => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    };

    handleEndOpenChange = open => {
        this.setState({ endOpen: open });
    };
    handleCancel = e => {//发起新的会议取消按钮的回调
        this.props.hindNewMeeting(false);
    };
    handleSubmitModal = e => {
        e.preventDefault();
        let that = this;
        let { staffList } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                (async () => {
                    let { topic, roomID, users, startDate, endDate, remarks, normalPwd, charmanPwd } = values;
                    if (normalPwd) {
                        normalPwd = md5(normalPwd);
                    }
                    if (charmanPwd) {
                        charmanPwd = md5(charmanPwd);
                    }
                    if (!startDate) return message.error('开始时间不能为空');
                    startDate = new Date(startDate).getTime();
                    if (!endDate) return message.error('结束时间不能为空');
                    endDate = new Date(endDate).getTime();
                    if (endDate < startDate) return message.error('结束时间不能大于开始时间');
                    if (!roomID) return message.error('请选择会议室');
                    let checkMeetingTime = await that.checkMeetingTime(roomID, startDate, endDate);
                    if (!checkMeetingTime.state) return message.error(checkMeetingTime.message);
                    await storageUtils.SetNewMeetingName(topic);
                    let meetingTime = endDate - startDate;
                    await storageUtils.SetMeetingTime(meetingTime);
                    let arr = [];
                    for (let i = 0; i < users.length; i++) {
                        let item = _.first(_.where(staffList, { userID: users[i] }));
                        if (item) {
                            arr.push(item);
                        }
                    }
                    let data = { topic, roomID, startDate, endDate, remarks, users: arr, normalPwd, charmanPwd };
                    let { account } = that.props;
                    if (!account.accessToken) {
                        return message.error('请先登录');
                    }
                    axios.post('/rtc/api/user/meetings', data, { headers: { "accesstoken": account.accessToken } }).then((res) => {
                        if (res.status === "ERROR") {
                            return message.error(res.error.message);
                        } else if (res.status === "OK") {
                            message.success('发起会议成功');
                            return that.props.hindNewMeeting(false);
                        }
                    })
                })()

            } else {
                let { topic, users, startDate, endDate } = err;
                if (topic) return message.error(topic.errors[0].message);
                if (startDate) return message.error(startDate.errors[0].message);
                if (endDate) return message.error(endDate.errors[0].message);
                if (users) return message.error(users.errors[0].message);
            }
        });
    };
    open(e) {
        e.preventDefault();
        if (this.state.open == 'none') {
            this.setState({
                open: "block",
                down: 'none',
                up: 'block'
            })
        } else if (this.state.open == 'block') {
            this.setState({
                open: "none",
                down: 'block',
                up: 'none'
            })
        }
    }
    async checkMeetingTime(roomID, startDate, endDate) {
        let data = { roomID, startDate, endDate };
        let { account } = this.props;
        if (!account.accessToken) {
            return { state: false, message: '请先登录' };
        }
        let checkRes = await axios.get('/rtc/api/user/meetings/check/meetingTime', { params: data, headers: { "accesstoken": account.accessToken } }).then((res) => {
            if (res.status === "ERROR") {
                return { state: false, message: res.error.message }
            } else {
                return { state: true };
            }
        })
        return checkRes;
    }
    checkName(rule, value, callback) {
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
    checkRemarks(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        if(len > 64){
            callback(global.remarks.writtenWords)
        }else {
            callback();
        }
    }
    render() {
        let { roomsList, staffList } = this.props;
        const { getFieldDecorator } = this.props.form;
        let { changeMeeting, startValue, endValue, endOpen, newMeetingInfo, changeNotify } = this.state;
        return (
            <Modal
                title="新的会议"
                visible={this.props.visible}
                footer={[]}
                onCancel={this.handleCancel}
            >
                <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmitModal}>
                    <Input type="users" autoComplete="new-password" hidden />
                    <Input type="password" autoComplete="new-password" hidden />
                    <Form.Item label="会议名称">
                        {getFieldDecorator('topic', {
                            initialValue: newMeetingInfo.meetingName,
                            rules: [{ required: true, message: '请输入会议名称' },{ validator: (rule, value, callback) => { this.checkName(rule, value, callback) } }], validateTrigger: 'onBlur',
                        })(<Input placeholder="请输入会议名称" />)}
                    </Form.Item>
                    <Form.Item label="选择会议室">
                        {getFieldDecorator('roomID', {
                            initialValue: changeMeeting,
                            rules: [{ required: true, message: '选择会议室' }],
                        })(
                            // <Select dropdownStyle={{width:'100%',maxHeight:"150px",overflowY:"auto"}} onChange={this.changeMeetingRoom}>
                            <Select style={{ width: '100%', maxHeight: "170px" }} onChange={this.changeMeetingRoom}>

                                {
                                    Object.entries(roomsList).map(item => {
                                        return (<Option value={item[1].roomID} key={item[1].roomID}>{item[1].name}</Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>

                    <Form.Item label="开始时间">
                        {getFieldDecorator('startDate', {
                            initialValue: startValue || null,
                            rules: [{ required: true, message: '开始时间不能为空' }],
                        })(
                            <DatePicker locale={locale}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择会议开始"
                                onChange={this.onStartChange}
                                style={{ width: '100%' }}
                            />
                        )}

                    </Form.Item>
                    <Form.Item label="结束时间">
                        {getFieldDecorator('endDate', {
                            initialValue: endValue || null,
                            rules: [{ required: true, message: '结束时间不能为空' }],
                        })(
                            <DatePicker locale={locale}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请输入会议结束时间"
                                onChange={this.onEndChange}
                                open={endOpen}
                                onOpenChange={this.handleEndOpenChange}
                                style={{ width: '100%' }}
                            />
                        )}
                    </Form.Item>

                    <Form.Item label="到会人员">
                        {getFieldDecorator('users', {
                            initialValue: changeNotify,
                            rules: [{ required: true, message: '请选择至少一位到会人员' }],
                        })(
                            <Select style={{ width: '100%' }} mode="multiple" placeholder="请选择到会人员" showArrow={true}>
                                {
                                    Object.entries(staffList).map(item => {
                                        return (<Option key={item[1].userID}>{item[1].realName}</Option>)
                                    })
                                }
                            </Select>
                        )}

                    </Form.Item>
                    <div style={{ display: this.state.open }}>
                        <Form.Item label="会议密码">
                            {getFieldDecorator('normalPwd', {
                                rules: [{ required: false, message: '请输入会议密码' },{max:24,min:4, message:global.password.writtenWords}]
                            })(
                                <Input
                                    prefix={<Icon type="password" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    type="password"
                                    placeholder="请输入密码" autoComplete="off"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="主持人密码">
                            {getFieldDecorator('charmanPwd', {
                                rules: [{ required: false, message: '请输入主持人密码' },{max:24,min:4, message:global.password.writtenWords}]
                            })(
                                <Input
                                    prefix={<Icon type="password" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    type="password"
                                    placeholder="请输入密码" autoComplete="off"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="备注">
                            {getFieldDecorator('remarks', {
                                initialValue: newMeetingInfo.note,
                                rules: [{ required: false, message: '请输入备注信息' },{ validator: (rule, value, callback) => { this.checkRemarks(rule, value, callback) } }],validateTrigger: 'onBlur',
                            })(<Input placeholder="请输入备注信息" />)}
                        </Form.Item>
                    </div>
                    <FormItem style={{ marginLeft: '40%' }}>
                        <div style={{ display: this.state.down }}>
                            <a onClick={this.open}>展开更多信息</a>
                        </div>
                        <div style={{ display: this.state.up }}>
                            <a onClick={this.open}>收回更多信息</a>
                        </div>
                    </FormItem>
                    <FormItem style={{ paddingLeft: '20%' }}>
                        <div className="btns" style={{ margin: "0 auto" }}>
                            <Button type="button" onClick={this.handleCancel} style={{ width: "60px", marginRight: "20px" }}>取消</Button>
                            <Button type="primary" htmlType="submit" style={{ width: "60px" }}>确定</Button>
                        </div>
                    </FormItem>
                </Form>
            </Modal>

        )
    }
}
const NewMeetings = Form.create()(NewMeeting);




class CreateRoomModal extends Component {
    constructor(props, context) {
        super(props, context);
        this.createMeetingHind = this.createMeetingHind.bind(this);
        this.state = {
            newMeetingInfo: {
                meetingName: "",
                roomName: "",
                note: "",
                meetingUsers: []
            },
            changeNotify: [],
        }
    }
    componentWillMount() {
        let that = this;
        // (async () => {
        //     let { changeMeeting, newMeetingInfo } = await that.props;
        //     if (changeMeeting && newMeetingInfo) {
        //         let changeNotify = newMeetingInfo.meetingUsers;
        //         changeNotify = _.pluck(changeNotify, "userID");
        //         await that.setState({ changeMeeting, newMeetingInfo, changeNotify });
        //     }
        // })()
    }

    createMeetingHind() {
        let { createMeetingState } = this.props;
        let that = this;
        if (createMeetingState) {
            that.props.hindCreateRoomModals(false);
        }
    }
    createMeetingModal = e => {
        e.preventDefault();
        let that = this;
        let { message, staffList } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { name, desc, charmanPwd, normalPwd, users } = values;
                let { account } = that.props;
                if (!account.accessToken) {
                    return message.error('请先登录');
                }
                if (!name) return message.warning('会议室名称不能为空');
                // if (!desc) return message.warning('会议室介绍不能为空');
                // if (!normalPwd) return message.warning('会议室密码不能为空');
                if (!charmanPwd) return message.warning('会议主持人密码不能为空');
                if (normalPwd) {
                    normalPwd = md5(normalPwd);
                } else {
                    normalPwd = "";
                }
                charmanPwd = md5(charmanPwd);
                let arr = [];
                if (users) {
                    for (let i = 0; i < users.length; i++) {
                        let item = _.first(_.where(staffList, { userID: users[i] }));
                        if (item) {
                            arr.push(item);
                        }
                    }
                }
                let data = { name, desc, charmanPwd, normalPwd, users: arr };
                axios.post('/rtc/api/user/createRoom', data, { headers: { "accesstoken": account.accessToken } }).then((res) => {
                    if (res.status === "ERROR") {
                        return message.error(res.error.message);
                    } else if (res.status === "OK") {
                        message.success('会议室创建成功');
                        return that.props.hindCreateRoomModals(false);
                    }
                })
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
    render() {
        let { createMeetingState, staffList } = this.props;
        const { getFieldDecorator } = this.props.form;
        let { newMeetingInfo, changeNotify } = this.state;
        return (
            <Modal
                title="创建会议室"
                visible={createMeetingState}
                footer={[]}
                onCancel={this.createMeetingHind}
            >
                <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.createMeetingModal}>
                    <Input type="desc" autoComplete="new-password" hidden />
                    <Input type="password" autoComplete="new-password" hidden />
                    <Form.Item label="会议室名称">
                        {getFieldDecorator('name', {
                            rules: [{ required: true},{ validator: (rule, value, callback) => { this.checkNames(rule, value, callback) } }], validateTrigger: 'onBlur',
                        })(<Input placeholder="请输入会议室名称"/>)}
                    </Form.Item>
                    <Form.Item label="主持人密码">
                        {getFieldDecorator('charmanPwd', {
                            rules: [{ required: true, message: '请输入主持人密码' },{max:24,min:4, message:global.password.writtenWords}],
                        })(<Input type="password" placeholder="请输入主持人密码" autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="会议室密码">
                        {getFieldDecorator('normalPwd', {
                            rules: [{max:24,min:4, message:global.password.writtenWords}],
                        })(<Input type="password" placeholder="请输入会议室密码" autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="会议室介绍">
                        {getFieldDecorator('desc', {
                            rules: [{ validator: (rule, value, callback) => { this.checkDesc(rule, value, callback) } }], validateTrigger: 'onBlur',
                        })(
                            <TextArea placeholder="请输入会议室介绍" />
                        )}
                    </Form.Item>
                    <Form.Item label="到会人员">
                        {getFieldDecorator('users', {
                            initialValue: changeNotify,
                            rules: [],
                        })(
                            <Select style={{ width: '100%' }} mode="multiple" placeholder="请选择到会人员" showArrow={true}>
                                {
                                    Object.entries(staffList).map(item => {
                                        return (<Option key={item[1].userID}>{item[1].realName}</Option>)
                                    })
                                }
                            </Select>
                        )}

                    </Form.Item>
                    <FormItem>
                        <div className="btns" style={{textAlign:'center',marginLeft:'80px',width:'100%'}}>
                            <Button type="button" onClick={this.createMeetingHind} style={{ width: "60px", marginRight: "20px" }}>取消</Button>
                            <Button type="primary" htmlType="submit" style={{ width: "60px" }}>确定</Button>
                        </div>
                    </FormItem>
                </Form>
            </Modal>
        )
    }

}

const CreateRoomModals = Form.create()(CreateRoomModal);





class Login extends Component {
    constructor(props, context) {
        super(props, context);
        this.createMeetingShow = this.createMeetingShow.bind(this);
        this.changePage = this.changePage.bind(this);
        const columns = [
            {
                title: '会议名称',
                dataIndex: 'meetingName',
                key: 'meetingName',
                ellipsis:true,
                render: (text, record) => <a onClick={this.loginDefaultName.bind(this, record)}>{text}</a>,
            },
            {
                title: '开始时间',
                dataIndex: 'startDate',
                key: 'startDate',
            },
            {
                title: '剩余时间',
                dataIndex: 'restDate',
                key: 'restDate',
                render: (text, record) => (
                    <span className={'resDate_meeting ' + (record.isBegin === true ? "active" : "")}>{record.restDate}</span>
                ),
            },
            {
                title: '备注',
                dataIndex: 'remarks',
                key: 'remarks',
                ellipsis:true
            },
            {
                title: '',
                dataIndex: 'operation',
                key: 'operation',
                className: "table_join",
                render: (text, record) => <a onClick={this.loginDefaultRoom.bind(this, record)}>{text}</a>,
            },
        ];
        this.state = {
            loginClick: 1,
            error: "",
            errorState: false,
            columns,
            nickName: "",
            roomId: "",
            data: [],
            page: 1,
            limit: 5,
            limitRooms: 999999,
            visible: false,
            NotifyList: [],
            staffList: [],
            changeMeeting: "",
            changeNotify: [],
            startValue: moment(new Date(), "YYYY-MM-DD HH-MM-SS"),
            endValue: null,
            endOpen: false,
            newMeetingInfo: {
                meetingName: "",
                roomName: "",
                note: "",
                meetingUsers: []
            },
            kaishi: [],
            jieshu: [],
            createMeetingState: false,
            roomsList: [],
            meetingList: [],
            beginMeetingList: [],
            noBeginMeetingList: [],
            total: 0,
            noUserLogin: false,
            meetingRoomInfo: {},
            mettingName: false,
            confirmLoading: false,
            inviteLink: "",
            liveLink:"",
            CompanyInfo: {},
            meetingID: "",
            isfalse:true,
        }
    }
    
    async componentWillMount() {
        let nickName = await storageUtils.GetNickName();
        let roomId = await storageUtils.GetUserRoomID();
        // await storageUtils.SetAnonymousUserID("");
        if (nickName && roomId) {
            this.setState({ nickName, roomId });
        }
        let nowTime = new Date();
        let meetingTime = await storageUtils.GetMeetingTime();
        let endTime;
        if (meetingTime) {
            meetingTime = parseInt(meetingTime);
            endTime = nowTime.getTime() + meetingTime;
        } else {
            endTime = nowTime.getTime() + (2 * 60 * 60 * 1000);
        }
        endTime = moment(new Date(endTime), "YYYY-MM-DD HH-MM-SS");
        await this.setState({ endValue: endTime });
        let { account } = this.props;
        console.error('=================account',account)
        if (account && account.accessToken) {
            await this.getMeetingListHasUser();
        } else {
            await this.getMeetingListNoUser();
        }
        await this.getNotifyList();
        await this.getMeetngRoomList();

        await this.getCompanyInfo();
    }
   
    componentDidMount() {
        setInterval(() => {//计时器
            let data = this.state.data;
            var is = 1;
            let noTime = false;
            let that = this;

            data.map((item, index) => {
                let restDate;
                let nowTime = new Date().getTime();
                let startTime = new Date(item.startDateObj).getTime();
                let endTime = new Date(item.endDateObj).getTime();
                if (nowTime < startTime) {
                    let minutes = moment(endTime).diff(moment(startTime), 'minutes')
                    let hour = moment(endTime).diff(moment(startTime), 'hour');
                    let DD = Math.floor(minutes / 60 / 24);
                    let HH = Math.floor(hour % 24);
                    let mm = Math.floor(minutes % 60);
                    if (DD > 0) {
                        restDate = `${DD}天${HH}时${mm}分`;
                    } else {
                        if (HH > 0) {
                            restDate = `${HH}时${mm}分`;
                        } else {
                            if (mm > 0 || mm == 0) {
                                restDate = `0时${mm}分`;
                            } else {
                                noTime = true;
                            }
                        }
                    }
                    item.restDate = restDate;
                } else if (nowTime >= startTime && nowTime < endTime) {
                    let minutes = moment(endTime).diff(moment(nowTime), 'minutes')
                    let hour = moment(endTime).diff(moment(nowTime), 'hour');
                    let DD = Math.floor(minutes / 60 / 24);
                    let HH = Math.floor(hour % 24);
                    let mm = Math.floor(minutes % 60);
                    if (DD > 0) {
                        restDate = `${DD}天${HH}时${mm}分`;
                    } else {
                        if (HH > 0) {
                            restDate = `${HH}时${mm}分`;
                        } else {
                            if (mm > 0 || mm == 0) {
                                restDate = `0时${mm}分`;
                            } else {
                                noTime = true;
                            }
                        }
                    }
                    item.restDate = restDate;
                } else {
                    noTime = true;
                    item.restDate = restDate;
                }
            })
            if (noTime) {
                let { page } = that.state;
                if (data.length == 1) {
                    if (page != 1) {
                        page--;
                        that.setState({ page });
                        that.getMeetingListHasUser();
                    } else {
                        that.getMeetingListHasUser();

                    }
                } else {
                    that.getMeetingListHasUser();
                }
            } else {
                this.setState({ data });
            }
        }, 60000)
    }
    enterMeeting(meetingInfo, that) {
        let { account } = that.props;
        let userNick;
        let userID;
        if (account && account.accessToken) {
            userNick = account.userInfo.realName;
            userID = account.userInfo.userID;
        } else {
            return;
        }
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
    getStaffList() {
        let that = this;
        let { account } = this.props;
        let accountID;
        if (account && account.accessToken) {
            accountID = account.userInfo.accountID;
        } else {
            return;
        }
        (async () => {
            try {
                axios.get('/rtc/api/user/users/all', { params: { accountID }, headers: { "accesstoken": account.accessToken } }).then((res) => {
                    if (res.status === "ERROR") {
                        message.error(res.error.message);
                    } else if (res.status === "OK") {
                        let staffList = res.result.data;
                        this.setState({ staffList });
                    }
                }).catch((error) => {
                    message.error(error);
                })
            } catch (error) {
                message.error(error);
            }
        })()
    }
    getNotifyList() {
        let that = this;
        let { page } = this.state;
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
                axios.get('/rtc/api/user/notes/list', { params: { accountName: userAccount, page } }).then((res) => {
                    if (res.status === "ERROR") {
                        message.error(res.error.message);
                    } else if (res.status === "OK") {
                        let NotifyList = res.result.data;
                        this.setState({ NotifyList });
                    }
                }).catch((error) => {
                    message.error(error);
                })
            } catch (error) {
                message.error(error);
            }
        })()
    }

    getMeetngRoomList() {
        let that = this;
        let { limitRooms } = this.state;
        let { account } = this.props;
        let accountID;
        if (account && account.accessToken) {
            accountID = account.userInfo.accountID;
        } else {
            return;
        }
        (async () => {
            try {
                axios.get('/rtc/api/user/meetingsRooms/all', { params: { accountID, page: 1, limit: limitRooms }, headers: { "accesstoken": account.accessToken } }).then((res) => {
                    if (res.status === "ERROR") {
                        message.error(res.error.message);
                    } else if (res.status === "OK") {
                        let roomsList = res.result.data;
                        if (roomsList.length > 0) {
                            this.setState({ roomsList, changeMeeting: roomsList[0].roomID });
                        } else {
                            this.setState({ roomsList, changeMeeting: '' });
                        }
                    }
                })
            } catch (error) {
                message.error(error);
            }
        })()
    }
    getMeetingListHasUser() {
        let that = this;
        let { account } = this.props;
        let accountID;
        if (account && account.accessToken) {
            accountID = account.userInfo.accountID;
        } else {
            return;
        }
        (async () => {
            try {
                axios.get('/rtc/api/user/meetings/hasUser', { params: { accountID }, headers: { "accesstoken": account.accessToken } }).then((res) => {
                    console.log(res)
                    if (res.status === "ERROR") {
                        message.error(res.error.message);
                    } else if (res.status === "OK") {
                        let { meetingList, limit, page, total } = that.state;
                        let beginMeetingList = [], noBeginMeetingList = [], data = [];
                        meetingList = res.result.data;
                        total = res.result.total;
                        let nowTime = new Date().getTime();
                        meetingList.map((item, index) => {
                            if (!item.remarks) {
                                item.remarks = "全体参与，无故不得缺席！！！"
                            }
                            item.key = index;
                            item.operation = '参会';
                            if (item.topic) {
                                item.meetingName = item.topic;
                            } else {
                                item.meetingName = item.roomName;
                            }
                            let restDate = "";
                            let startTime = new Date(item.startDateObj).getTime();
                            let endTime = new Date(item.endDateObj).getTime();
                            item.startDate = moment(startTime).format("MM-DD HH:mm");
                            if (nowTime < startTime) {
                                let minutes = moment(endTime).diff(moment(startTime), 'minutes')
                                let hour = moment(endTime).diff(moment(startTime), 'hour');
                                let DD = Math.floor(minutes / 60 / 24);
                                let HH = Math.floor(hour % 24);
                                let mm = Math.floor(minutes % 60);
                                if (DD > 0) {
                                    restDate = `${DD}天${HH}时${mm}分`;
                                } else {
                                    if (HH > 0) {
                                        restDate = `${HH}时${mm}分`;
                                    } else {
                                        restDate = `0时${mm}分`;
                                    }
                                }
                                item.restDate = restDate;
                                item.state = 0;
                                item.isBegin = false;
                                noBeginMeetingList.push(item);
                            }
                            if (nowTime >= startTime && nowTime < endTime) {
                                let minutes = moment(endTime).diff(moment(nowTime), 'minutes');
                                let hour = moment(endTime).diff(moment(nowTime), 'hour');
                                let DD = Math.floor(minutes / 60 / 24);
                                let HH = Math.floor(hour % 24);
                                let mm = Math.floor(minutes % 60);
                                if (DD > 0) {
                                    restDate = `${DD}天${HH}时${mm}分`;
                                } else {
                                    if (HH > 0) {
                                        restDate = `${HH}时${mm}分`;
                                    } else {
                                        restDate = `0时${mm}分`;
                                    }
                                }
                                item.restDate = restDate;
                                item.state = 1;
                                item.isBegin = true;
                                beginMeetingList.push(item);
                            }
                            if (nowTime > endTime) {
                                item.restDate = '0时0分';
                                item.state = 2;
                                item.isBegin = false;
                            }
                        })
                        let dataLength = 0;
                        beginMeetingList.map((item, index) => {
                            if (dataLength < limit && index >= ((page - 1) * limit)) {
                                dataLength++;
                                data.push(item);
                            }
                        })
                        if (data.length < limit) {
                            if (data.length > 0) {
                                let skip = limit - data.length;
                                noBeginMeetingList.map((item, index) => {
                                    if (index < skip) {
                                        data.push(item);
                                    }
                                })
                            } else {
                                let skip = (page - 1) * limit;
                                skip = skip - data.length;
                                noBeginMeetingList.map((item, index) => {
                                    if (index >= skip && index < (skip + limit)) {
                                        data.push(item);
                                    }
                                })
                            }
                        }
                        this.setState({ meetingList, noBeginMeetingList, beginMeetingList, data, total });
                    }
                }).catch((error) => {
                    message.error(error);
                })
            } catch (error) {
                message.error(error);
            }
        })()
    }
    getMeetingListNoUser() {
        let that = this;
        let { page, limit } = this.state;
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
                if (userAccount) {
                    axios.get('/rtc/api/user/meetings/noUser', { params: { accountName: userAccount } }).then((res) => {
                        // if (res.status === "ERROR") {
                        //     message.error(res.error.message);
                        // } else 
                        if (res.status === "OK") {
                            let { meetingList, limit, page, total } = that.state;
                            let beginMeetingList = [], noBeginMeetingList = [], data = [];
                            meetingList = res.result.data;
                            total = res.result.total;
                            let nowTime = new Date().getTime();
                            meetingList.map((item, index) => {
                                if (!item.remarks) {
                                    item.remarks = "全体参与，无故不得缺席！！！"
                                }
                                item.key = index;
                                item.operation = '参会';
                                if (item.topic) {
                                    item.meetingName = item.topic;
                                } else {
                                    item.meetingName = item.roomName;
                                }
                                let restDate = "";
                                let startTime = new Date(item.startDateObj).getTime();
                                let endTime = new Date(item.endDateObj).getTime();
                                item.startDate = moment(startTime).format("MM-DD HH:mm");
                                if (nowTime < startTime) {
                                    let minutes = moment(endTime).diff(moment(startTime), 'minutes')
                                    let hour = moment(endTime).diff(moment(startTime), 'hour');
                                    let DD = Math.floor(minutes / 60 / 24);
                                    let HH = Math.floor(hour % 24);
                                    let mm = Math.floor(minutes % 60);
                                    if (DD > 0) {
                                        restDate = `${DD}天${HH}时${mm}分`;
                                    } else {
                                        if (HH > 0) {
                                            restDate = `${HH}时${mm}分`;
                                        } else {
                                            restDate = `0时${mm}分`;
                                        }
                                    }
                                    item.restDate = restDate;
                                    item.state = 0;
                                    item.isBegin = false;
                                    noBeginMeetingList.push(item);
                                }
                                if (nowTime >= startTime && nowTime < endTime) {
                                    let minutes = moment(endTime).diff(moment(nowTime), 'minutes');
                                    let hour = moment(endTime).diff(moment(nowTime), 'hour');
                                    let DD = Math.floor(minutes / 60 / 24);
                                    let HH = Math.floor(hour % 24);
                                    let mm = Math.floor(minutes % 60);
                                    if (DD > 0) {
                                        restDate = `${DD}天${HH}时${mm}分`;
                                    } else {
                                        if (HH > 0) {
                                            restDate = `${HH}时${mm}分`;
                                        } else {
                                            restDate = `0时${mm}分`;
                                        }
                                    }
                                    item.restDate = restDate;
                                    item.state = 1;
                                    item.isBegin = true;
                                    beginMeetingList.push(item);
                                }
                                if (nowTime > endTime) {
                                    item.restDate = '0时0分';
                                    item.state = 2;
                                    item.isBegin = false;
                                }
                            })
                            let dataLength = 0
                            beginMeetingList.map((item, index) => {
                                if (dataLength < limit && index >= ((page - 1) * limit)) {
                                    dataLength++;
                                    data.push(item);
                                }
                            })
                            if (data.length < limit) {
                                if (data.length > 0) {
                                    let skip = limit - data.length;
                                    noBeginMeetingList.map((item, index) => {
                                        if (index < skip) {
                                            data.push(item);
                                        }
                                    })
                                } else {
                                    let skip = (page - 1) * limit;
                                    skip = skip - data.length;
                                    noBeginMeetingList.map((item, index) => {
                                        if (index >= skip && index < (skip + limit)) {
                                            data.push(item);
                                        }
                                    })
                                }
                            }
                            this.setState({ meetingList, noBeginMeetingList, beginMeetingList, data, total });
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
    loginDefaultName(record) {
        let inviteLink = `${window.location.origin}/invite/${record.meetingID}`;
        let liveLink = `${window.location.origin}/live/${record.meetingID}`;
        this.setState({
            mettingName: true,
            meetingNames: record.meetingName,
            startDate: record.startDate,
            restDate: record.restDate,
            remarks: record.remarks,
            normalPwd: record.normalPwd,
            realName: record.users,
            inviteLink,
            liveLink,
            meetingID: record.meetingID
        });
    }
    mettingNameOk = () => {
        this.setState({
            ModalText: 'The modal will be closed after two seconds',
            confirmLoading: true,
        });
        setTimeout(() => {
            this.setState({
                mettingName: false,
                confirmLoading: false,
            });
        }, 100);
    };

    loginDefaultRoom(e) {
        let that = this;
        let { account } = this.props;
        let { CompanyInfo ,videoDevices,audioDevices} = this.props;
        let accountID;
        console.error('======videoDevices,audioDevices loginNotice',videoDevices,audioDevices)
        if (videoDevices.length < 1 || audioDevices.length < 1) {
            storageUtils.SetMeetingInfo('');
            return message.error('当前设备没有麦克风或摄像头');;
        } 
        if (account && account.accessToken) {
            (async () => {
                let meetingInfoComponentDidMount = "", companyInfo = "";
                let username = account.userInfo.realName;
                if (!username) {
                    username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
                }
                // let username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
                let  UserName = await storageUtils.GetUserName();
                await storageUtils.SetNickName(username);
                await storageUtils.SetUserRoomID(e.roomID);
                let pin = e.normalPwd;
                if (!pin) {
                    pin = "";
                }
                await that.enterMeeting(e, that);
                if (CompanyInfo) {
                    await that.props.saveCompany({ CompanyInfo })
                    companyInfo = JSON.stringify(CompanyInfo);
                }
                // if(account.user && meetingInfoComponentDidMount){
                let accountUserInfo = JSON.stringify(account.userInfo);
                meetingInfoComponentDidMount = JSON.stringify(e);

                console.log('=========accountUserInfo========', accountUserInfo)
                await storageUtils.SetAccountUserInfo(accountUserInfo);
                let a = await storageUtils.GetAccountUserInfo();
                console.log('accountUserInfo', typeof accountUserInfo);
                console.log('---------a', a)
                await storageUtils.SetMeetingInfo(meetingInfoComponentDidMount);
                await storageUtils.SetCompanyInfo(companyInfo);
                // }
                setTimeout(() => {
                    (async () => {
                        await that.props.joinMeeting({ meetingInfo: e });
                        username = username +"@^@"+UserName;
                        await that.props.connect({ username, room: e.roomID, pin, connectAnyway: true });
                    })()

                }, 500)

            })()
        } else {
            that.setState({ noUserLogin: true, meetingRoomInfo: e });
        }
    }
    async hindMeetingCharmanPwd(e) {
        await this.setState({ noUserLogin: e, meetingRoomInfo: {} });
    }
    loginDefaultRoom2(room) {
        let that = this;
        (async () => {
            let username = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
            await storageUtils.SetNickName(username);
            await storageUtils.SetUserRoomID(room);
            await that.props.connect({ username, room: md5(room), pin: '', connectAnyway: true });
        })()
    }
    showModal = () => {//发起新的会议弹出框显示
        let that = this;
        let { account } = that.props;
        if (account && !account.accessToken) {
            return message.error('请先登录');
        }
        that.getStaffList();
        setTimeout(() => {
            (async () => {
                let { newMeetingInfo, changeMeeting, staffList, roomsList } = that.state;
                let name = await storageUtils.GetNewMeetingName();
                if (name) {
                    newMeetingInfo.meetingName = name;
                } else {
                    newMeetingInfo.meetingName = "周报";
                }
                newMeetingInfo.roomName = changeMeeting;
                newMeetingInfo.note = '请各位准时参会';
                if (roomsList.length > 0) {
                    roomsList.forEach((value, index, array) => {
                        if (value.roomID === changeMeeting) {
                            if (value.users.length > 0) {
                                newMeetingInfo.meetingUsers = value.users;
                            } else {
                                if (staffList.length > 0) {
                                    newMeetingInfo.meetingUsers = [staffList[0]];
                                }
                            }
                            return;
                        }
                    })
                }
                if (staffList.length > 0 && roomsList.length > 0) {
                    that.setState({ visible: true, newMeetingInfo });
                }
            })()
        }, 500);

    };

    handleCancel = e => {//发起新的会议取消按钮的回调
        this.setState({
            visible: false,
        });
    };

    createMeetingShow() {
        let { createMeetingState } = this.state;
        let that = this;
        let { account } = that.props;
        if (account && !account.accessToken) {
            return message.error('请先登录');
        }
        if (!createMeetingState) {
            that.getStaffList();
            setTimeout(() => {
                that.setState({ createMeetingState: true });
            }, 500);
        }
    }
    async hindNewMeeting(e) {
        await this.getMeetingListHasUser();
        await this.getMeetngRoomList();
        await this.setState({ visible: e });

    }
    async hindCreateRoomModals(e) {
        await this.getMeetngRoomList();
        await this.setState({ createMeetingState: e });
    }
    changePage(page, changePage) {
        let that = this;
        let { meetingList, total, limit } = this.state;
        let beginMeetingList = [], noBeginMeetingList = [], data = [], arr = [];
        let dataLength = 0;
        let nowTime = new Date().getTime();
        meetingList.map((item, index) => {
            let startTime = new Date(item.startDateObj).getTime();
            let endTime = new Date(item.endDateObj).getTime();
            item.startDate = moment(startTime).format("MM-DD HH:mm");
            if (nowTime < startTime) {
                noBeginMeetingList.push(item);
                arr.push(item);
            }
            if (nowTime >= startTime && nowTime < endTime) {
                beginMeetingList.push(item);
                arr.push(item);
            }
        })
        beginMeetingList.map((item, index) => {
            if (dataLength < limit && index >= ((page - 1) * limit)) {
                dataLength++;
                data.push(item);

            }
        })
        if (data.length < limit) {
            if (data.length > 0) {
                let skip = limit - data.length;
                noBeginMeetingList.map((item, index) => {
                    if (index < skip) {
                        data.push(item);
                    }
                })
            } else {
                let skip = (page - 1) * limit;
                skip = skip - data.length;
                noBeginMeetingList.map((item, index) => {
                    if (index >= skip && index < (skip + limit)) {
                        data.push(item);
                    }
                })
            }
        }
        if (data.length > 0) {
            that.setState({ meetingList: arr, noBeginMeetingList, beginMeetingList, data, total: arr.length, page })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { mettingName, confirmLoading, ModalText, CompanyInfo, page } = this.state;
        let { meetingList, meetingRoomInfo, visible, createMeetingState, newMeetingInfo, error, errorState, data, roomsList, columns, nickName, roomId, NotifyList, changeMeeting, staffList, startValue, endValue, endOpen, total, limit, noUserLogin } = this.state;
        let { conNect, account } = this.props;
        let isStaffLogin = false;
        if (account && account.accessToken) {
            isStaffLogin = true;
        }
        if (conNect == "1") {
            document.getElementById('login_error_msg').style.display = "block";
            error = '房间标记错误'

        } else if (conNect == "0") {
            this.props.push('/meeting');
        } else if (conNect == "2") {
            location.reload();
        }
        if (error) {
            document.getElementById('login_error_msg').style.display = "block";
        }

        //通知公告隐藏
        // var NotifyItemShow;
        // if (NotifyList && NotifyList.length > 0) {
        //     NotifyItemShow = NotifyList.map((item, index) => {
        //         return (<div key={index}>{index + 1}. {item.title}:{item.notecontent}</div>)
        //     })
        // } else {
        //     return (<div>暂无通知</div>)
        // }
        return (
            <div className="login_meeting">
                {/* 通知公告隐藏 */}
                {/* <div className="login_notice">
                    <div className="notice_title">通知公告</div>
                    <div className="notice_box">
                        {NotifyItemShow}
                        < div className="notice_position"><a>查看所有通知</a></div>
                    </div>
                </div> */}
                <div className="login_mes" style={{ margin: '0 auto' }}>
                    <div className="mes_title">
                        <span className="mes_jin" style={{ marginRight: '20%' }}>近期会议</span>
                        <Button type="primary" style={{ width: "130px" }} className="mes_btn" onClick={this.showModal}>发起新的会议</Button>
                        {isStaffLogin &&
                            <Button type="primary" style={{ width: "40px", marginLeft: "10px" }} className="mes_btn" onClick={this.createMeetingShow}>创建会议室</Button>
                        }
                        {visible && roomsList.length > 0 && staffList.length > 0 &&
                            <NewMeetings hindNewMeeting={this.hindNewMeeting.bind(this)} account={account} visible={visible} newMeetingInfo={newMeetingInfo} changeMeeting={changeMeeting} roomsList={roomsList} staffList={staffList} />

                        }
                        {createMeetingState &&
                            <CreateRoomModals message={message} hindCreateRoomModals={this.hindCreateRoomModals.bind(this)} account={account} createMeetingState={createMeetingState} staffList={staffList} newMeetingInfo={newMeetingInfo} changeMeeting={changeMeeting} />

                        }
                        {noUserLogin &&
                            <MeetingCharmanPwd meetingRoomInfo={meetingRoomInfo} CompanyInfo={CompanyInfo} hindMeetingCharmanPwd={this.hindMeetingCharmanPwd.bind(this)} />
                        }
                    </div>
                    <div className="mes_box">
                        {
                            (data && data.length > 0) &&
                            <Table columns={columns} dataSource={data} pagination={{ defaultPageSize: limit, total, current: page, onChange: this.changePage }} />
                        }
                    </div>
                </div>
                <Modal
                    title="会议信息"
                    visible={mettingName}
                    confirmLoading={confirmLoading}
                    closable={false}
                    footer={[
                        <Button key="back" type="primary" onClick={this.mettingNameOk}>确认</Button>,
                    ]}
                >
                    <div>
                        <div>会议名称：{this.state.meetingNames}</div>
                        <div>开始时间：{this.state.startDate}</div>
                        <div>剩余时间：{this.state.restDate}</div>
                        {/* <div>会议密码：{this.state.normalPwd}</div> */}
                        <div>备注：{this.state.remarks}</div>
                        <div>邀请链接：{this.state.inviteLink}</div>
                        <div>直播链接：{this.state.liveLink}</div>
                    </div>
                </Modal>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        conNect: state.conNect,
        account: state.account.user,
        videoDevices:state.teevid.api.videoDevices,
        audioDevices:state.teevid.api.audioDevices,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        connect: (data) => {
            var action = actions.connect(data);
            dispatch(action);
        },
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