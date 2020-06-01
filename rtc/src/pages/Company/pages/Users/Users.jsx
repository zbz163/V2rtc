import React, { Component } from 'react';
import { Button, Input, Table, Drawer, Form, Col, Row, message, Modal } from 'antd';
import { Tree } from 'antd';
import { connect } from 'react-redux';
import md5 from 'md5';
import axios from 'axios';
import './Users.css';
import moment from 'moment';
import _ from "underscore";
import { thisExpression } from '@babel/types';
import Tips from '../../../../config/Tips';

const { Search } = Input;
const { confirm } = Modal;
const data = [];
const { TreeNode } = Tree;

class Users extends Component {

    constructor(props, context) {
        super(props, context);
        this.searchUser = this.searchUser.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.changePage = this.changePage.bind(this);
        const columns = [
            {
                title: '登录名',
                dataIndex: 'loginName',
                key: 'loginName',
            },
            {
                title: '姓名',
                dataIndex: 'realName',
                key: 'realName',
            },
            {
                title: '登录次数',
                dataIndex: 'loginTimes',
                key: 'loginTimes',
            },
            {
                title: '创建时间',
                key: 'createDate',
                dataIndex: 'createDate',
            },
            {
                title: '操作',
                key: 'operation',
                dataIndex: 'operation',
                render: (text, record) => (
                    <span>
                        <Button type="primary" onClick={() => this.EditUser(record)}>编辑</Button>
                        <Button type="primary" onClick={() => this.resetPwdShow(record)} style={{ margin: '0 10px' }}>重置密码</Button>
                        <Button type="danger" onClick={() => this.removeUser(record.userID)}>删除</Button>
                    </span>
                ),
            },
        ];
        this.state = {
            visible: false,
            users: [],
            showUsers: [],
            total: 0,
            limit: 10,
            getLimit: 9999,
            page: 1,
            columns,
            userData: {},
            edit: false,
            resetPwdShow: false,
            resetPwdData: {},
            treeData: [],
            departmentInfo: {},
            selectDepart: {},
            isGetUsersList: false,
            searchName:"",
            isSearch:false,
        };
    }
    async componentWillMount() {
        let that = this;
        // this.setState({});
        await this.getUsersList();
        setTimeout(function () {
            that.getDepartByRootId(that);
        }, 500)

    }
    async changePage(page, changePage) {
        await this.setState({ page });
        await this.getUsersList();
    }
    async reloadData(){
        let that = this;
        this.refs.searchBar.input.state.value='';
        await this.setState({page:1,searchName:"",isSearch:false,isGetUsersList:false,});
        await this.getUsersList();
        setTimeout(function () {
            that.getDepartByRootId(that);
        }, 500)
    }
    getDepartByRootId(that) {
        // let that = this;
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let treeData = [];
        let { users } = that.state;
        let data = { deptID: "root" };
        axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
            .then(res => {
                console.error('============res',res)
                if (res.status === "OK") {
                    if (res.result.error) {
                        message.error(res.result.error.message);
                    } else {
                        // let departmentInfo = res.result.data.cDepartments;
                        let departmentInfo = [res.result.data];
                        for (let i = 0; i < departmentInfo.length; i++) {
                            let item = departmentInfo[i];
                            let departmentInfoItem = {};
                            departmentInfoItem.title = item.name;
                            departmentInfoItem.key = item.ID;
                            departmentInfoItem.deptOrder = item.order;
                            departmentInfoItem.desc = item.desc;
                            departmentInfoItem.users = item.users;
                            if (item.cMaxID > 0) {
                                departmentInfoItem.isLeaf = false;
                            } else {
                                departmentInfoItem.isLeaf = true;
                            }
                            treeData.push(departmentInfoItem);
                        }
                        // let selectOrder = treeData.length + 1;
                        let selectDepart = { ID: 'root', pDeptID: 'root', deptID: "root" };
                        let selectItemUsers = treeData[0].users;
                        let arr = [];
                        if (selectItemUsers && selectItemUsers.length > 0) {
                            for (let i = 0; i < selectItemUsers.length; i++) {
                                let userItem = _.first(_.where(users, { userID: selectItemUsers[i].userID }))
                                if (userItem) {
                                    arr.push(userItem);
                                }
                            }
                        }
                        arr = _.sortBy(arr, "createDate");
                        console.error('============treeData',treeData)
                        that.setState({ showUsers: arr, isGetUsersList: true, selectDepart, departmentInfo: res.result.data, treeData, departmentsShow: arr, total: arr.length });
                    }
                } else if (res.status === "ERROR") {
                    message.error(res.error.message);
                }
            }).catch(error => {
                message.error(error);
                return push('/login');
            })
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
        let { page, limit, getLimit, isGetUsersList } = this.state;
        // let data = { q: "", sort: "userId", desc: true, from: 0, count: 10 };
        let data = { q: "", sort: "userID", desc: true, from: 0, count: getLimit };
        axios.get('/rtc/api/account/users/pageData', { params: data, headers: { "accesstoken": account.accountToken } })
            .then(res => {
                if (res.status === "OK") {
                    let users = res.result.data;
                    users.map((item) => {
                        item.createDate = moment(item.createDate).format("YYYY-MM-DD HH:mm:ss");
                        item.key = item.mediaServerID;
                        item.loginName = item.userName + "@" + accountInfo.accountName;
                        item.operation = "暂无";
                    })
                    if (isGetUsersList) {
                        that.setState({
                            users: users,
                            // showUsers: users
                        })
                    } else {
                        that.setState({
                            users: users,
                            showUsers: users
                        })
                    }

                    // return true;
                } else if (res.status === "ERROR") {
                    message.error(res.error.message);
                }
            }).catch((error) => {
                message.error(error);
                return push('/login');
            })
    }

    showDrawer = () => {
        let { account, push } = this.props;
        let { selectDepart } = this.state;
        if (selectDepart.ID) {
            return message.error('请先选择一个部门');
        }
        let accountInfo = {};
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        if (accountInfo && accountInfo.companyName) {
            this.props.form.resetFields();
            this.setState({
                userData: {},
                edit: false,
                resetPwdShow: false,
                resetPwdData: {},
                editUserData: {},
            });
            this.setState({
                visible: true,
            });
        } else {
            message.error("请先登录")
            return push('/login');
        }

    };
    onClose = () => {
        this.props.form.resetFields();
        this.setState({
            userData: {},
            edit: false,
            resetPwdShow: false,
            resetPwdData: {},
            editUserData: {},
        })
        this.setState({
            visible: false,
        });

    };
    handleSubmit = (e) => {
        e.preventDefault();
        let that = this;
        let { edit, selectDepart } = this.state;
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
                let { password, realName, userName } = values;
                if (!userName) return message.error("用户名不能为空");
                if (!realName) return message.error("真实姓名不能为空");
                if (!edit) {
                    //创建
                    if (!password) return mesasge.error('密码不能为空');
                    password = md5(password);
                    let deptID;
                    if (selectDepart.ID) {
                        deptID = selectDepart.ID
                    } else {
                        deptID = selectDepart.deptID
                    }
                    let data = { userName, realName, password, deptID, userOrder: 0 };
                    axios.post('/rtc/api/account/users', data, { headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                message.success('添加成功');
                                (async () => {
                                    try {
                                        await that.getUsersList();
                                        setTimeout(function () {
                                            that.getDepartByOtherId(that);
                                            that.onClose();
                                            that.setState({
                                                userData: {},
                                                edit: false,
                                                resetPwdShow: false,
                                                resetPwdData: {},
                                                editUserData: {},
                                            })
                                            // document.getElementById('userName').
                                            that.setState({
                                                visible: false,
                                            });
                                            that.props.form.resetFields();
                                        }, 500)
                                    } catch (error) {
                                        message.error(error);
                                    }
                                })()

                            } else if (res.status === "ERROR") {
                                message.error(res.error.message);
                            }
                        }).catch(error => {
                            message.error(error);
                            return push('/login');
                        })
                } else {
                    //修改
                    let { editUserData } = this.state;
                    let data = { userIDs: [editUserData.userID], params: { realName } };
                    axios.put('/rtc/api/account/users', data, { headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            if (res.status === "OK") {
                                message.success('编辑成功');
                                (async () => {
                                    try {
                                        await that.getUsersList();
                                        setTimeout(function () {
                                            that.getDepartByOtherId(that);
                                            that.onClose();
                                            that.props.form.resetFields();
                                        }, 500)
                                    } catch (error) {
                                        message.error(error);
                                    }
                                })()
                            } else if (res.status === "ERROR") {
                                message.error(res.error.message);
                            }
                        }).catch(error => {
                            message.error(error);
                            return push('/login');
                        })
                }

            }
        })
    }
    resetPwdShow(e) {
        this.setState({ resetPwdData: e });
        this.setState({
            visible: true,
            resetPwdShow: true,
        });
    }
    submitResetPwd = (e) => {
        e.preventDefault();
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
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { newPassword } = values;
                if (!newPassword) return message.error('新密码不能为空');
                let { resetPwdData } = this.state;
                let data = { userIDs: [resetPwdData.userID], newPassword: md5(newPassword) };
                axios.put('/rtc/api/account/users/password', data, { headers: { "accesstoken": account.accountToken } }).then((res) => {
                    if (res.status === "OK") {
                        if (res.result === true) {
                            message.success('成功');
                            that.getUsersList();
                            that.onClose();
                        } else {
                            message.success('失败');
                        }
                    } else if (res.status === "ERROR") {
                        message.error(res.error.message);
                    }
                }).catch((error) => {
                    message.error(error);
                    // return push('/login');
                })
            }
        })
    }
    removeUser(userIDs) {
        let { selectDepart } = this.state;
        let deptID;
        if (selectDepart.ID) {
            deptID = selectDepart.ID;
        } else {
            deptID = selectDepart.deptID;
        }
        let DeptsAndIDs = `${deptID}_${userIDs}`;
        let param = { DeptsAndIDs: [DeptsAndIDs] };
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
        confirm({
            title: '确认删除此用户吗?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                axios.delete('/rtc/api/account/users', { params: param, headers: { "accesstoken": account.accountToken } })
                    .then(res => {
                        if (res.status === "OK") {
                            message.success('删除成功');
                            (async () => {
                                try {
                                    await that.getUsersList();
                                    setTimeout(function () {
                                        that.getDepartByOtherId(that);
                                        that.onClose();
                                    }, 500)
                                } catch (error) {
                                    message.error(error);
                                }
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
    EditUser(e) {
        this.setState({ editUserData: e });
        this.setState({
            visible: true,
            edit: true,
        });
    }
    onLoadData = treeNode =>
        new Promise(resolve => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            let deptID = treeNode.props.eventKey;
            let that = this;
            let { account, push } = this.props;
            let companyInfo = {};
            if (account && account.accountInfo) {
                companyInfo = account.accountInfo;
            }
            if (!companyInfo.companyName) {
                message.error("请先登录");
                return push('/login');
            }
            let departmentsShow = [];
            let data = { deptID };
            axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
                .then(res => {
                    if (res.status === "OK") {
                        if (res.result.error) {
                            message.error(res.result.error.message);
                        } else {
                            let departmentInfo = res.result.data.cDepartments;
                            for (let i = 0; i < departmentInfo.length; i++) {
                                let item = departmentInfo[i];
                                let departmentInfoItem = {};
                                departmentInfoItem.title = item.name;
                                departmentInfoItem.key = item.ID;
                                departmentInfoItem.deptOrder = item.order;
                                departmentInfoItem.desc = item.desc;
                                if (item.cMaxID > 0) {
                                    departmentInfoItem.isLeaf = false;
                                } else {
                                    departmentInfoItem.isLeaf = true;
                                }
                                departmentsShow.push(departmentInfoItem);
                            }
                            setTimeout(() => {
                                treeNode.props.dataRef.children = departmentsShow;
                                this.setState({
                                    treeData: [...this.state.treeData],
                                    departmentsShow
                                });
                                resolve();
                            });
                        }
                    } else if (res.status === "ERROR") {
                        message.error(res.error.message);
                    }
                }).catch(error => {
                    message.error(error);
                    return push('/login');
                })
        });
    renderTreeNodes = data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.key} {...item} dataRef={item} />;
        });
    onSelect = (keys, event) => {
        alert(1)
        let that = this;
        let { selectDepart, users } = this.state;
        let selectItem;
        let pDeptID = "";
        if (keys.length > 0) {
            selectItem = event.node.props.dataRef;
            let arr = keys[0].split("_");
            if (arr.length == 1) {
                pDeptID = "root";
            } else if (arr.length == 2) {
                pDeptID = arr[0];
            } else if (arr.length > 2) {
                arr.slice(0, arr.length - 1);
                let str = "";
                for (let i = 0; i < arr.length; i++) {
                    str = `${str}_${arr[i]}`;
                }
                pDeptID = str;
            }
        } else {
            pDeptID = "";
            selectItem = { ID: 'root', deptID: 'root' };
            keys = "root";

        }
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let departmentsShow = [];
        let data = { deptID: keys };
        axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
            .then(res => {
                if (res.status === "OK") {
                    if (res.result.error) {
                        message.error(res.result.error.message);
                    } else {
                        let departmentInfo = [res.result.data];
                        for (let i = 0; i < departmentInfo.length; i++) {
                            let item = departmentInfo[i];
                            let departmentInfoItem = {};
                            departmentInfoItem.title = item.name;
                            departmentInfoItem.key = item.ID;
                            departmentInfoItem.deptOrder = item.order;
                            departmentInfoItem.desc = item.desc;
                            departmentInfoItem.users = item.users;
                            if (item.cMaxID > 0) {
                                departmentInfoItem.isLeaf = false;
                            } else {
                                departmentInfoItem.isLeaf = true;
                            }
                            departmentsShow.push(departmentInfoItem);
                        }
                        let selectItemUsers = departmentsShow[0].users;
                        let arr = [];
                        if (selectItemUsers && selectItemUsers.length > 0) {
                            for (let i = 0; i < selectItemUsers.length; i++) {
                                let userItem = _.first(_.where(users, { userID: selectItemUsers[i].userID }))
                                if (userItem) {
                                    arr.push(userItem);
                                }
                            }
                        }
                        arr = _.sortBy(arr, "createDate");
                        if (selectItem.ID) {
                            selectDepart = { ID: selectItem.ID, pDeptID: selectItem.ID, deptID: 'root', deptDesc: departmentsShow[0].desc, deptOrder: departmentsShow[0].deptOrder, users: departmentsShow[0].users, deptName: departmentsShow[0].title, }

                        } else {
                            selectDepart = { users: selectItemUsers, deptName: selectItem.title, deptID: keys[0], pDeptID, deptDesc: selectItem.desc, deptOrder: selectItem.deptOrder }
                        }
                        that.setState({ page: 1, showUsers: arr, total: arr.length, deptID: keys[0], pDeptID, departmentsShow, selectDepart });
                        document.getElementById('user_secrch_name').value = '';
                    }
                } else if (res.status === "ERROR") {
                    message.error(res.error.message);
                }
            }).catch(error => {
                message.error(error);
                return push('/login');
            })
    }
    getDepartByOtherId(that) {
        // let that = this;
        let { selectDepart, users } = that.state;
        let selectItem;
        let pDeptID = "";
        let keys = selectDepart.deptID;
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        let departmentsShow = [];
        let data = { deptID: keys };
        axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
            .then(res => {
                if (res.status === "OK") {
                    if (res.result.error) {
                        message.error(res.result.error.message);
                    } else {
                        let departmentInfo = [res.result.data];
                        for (let i = 0; i < departmentInfo.length; i++) {
                            let item = departmentInfo[i];
                            let departmentInfoItem = {};
                            departmentInfoItem.title = item.name;
                            departmentInfoItem.key = item.ID;
                            departmentInfoItem.deptOrder = item.order;
                            departmentInfoItem.desc = item.desc;
                            departmentInfoItem.users = item.users;
                            if (item.cMaxID > 0) {
                                departmentInfoItem.isLeaf = false;
                            } else {
                                departmentInfoItem.isLeaf = true;
                            }
                            departmentsShow.push(departmentInfoItem);
                        }
                        let selectItemUsers = departmentsShow[0].users;
                        let arr = [];
                        if (selectItemUsers && selectItemUsers.length > 0) {
                            for (let i = 0; i < selectItemUsers.length; i++) {
                                let userItem = _.first(_.where(users, { userID: selectItemUsers[i].userID }))
                                if (userItem) {
                                    arr.push(userItem);
                                }
                            }
                        }
                        if (selectDepart.deptID === "root") {
                            selectDepart = { pDeptID: selectDepart.deptID, deptID: 'root', deptDesc: departmentsShow[0].desc, deptOrder: departmentsShow[0].deptOrder, users: departmentsShow[0].users, deptName: departmentsShow[0].title, }

                        } else {
                            selectDepart = { users: selectItemUsers, deptName: selectDepart.title, deptID: selectDepart.deptID, pDeptID: selectDepart.pDeptID, deptDesc: selectDepart.desc, deptOrder: selectDepart.deptOrder }
                        }
                        that.setState({ showUsers: arr, total: arr.length, deptID: selectDepart.deptID, pDeptID: selectDepart.deptID, departmentsShow, selectDepart });
                    }
                } else if (res.status === "ERROR") {
                    message.error(res.error.message);
                }
            }).catch(error => {
                message.error(error);
                return push('/login');
            })
    }
    searchUser(value) {
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
        if(!value){
            (async () => {
                try {
                    await that.getDepartByOtherId(that);
                    await that.setState({ searchName: "", page: 1, isSearch: false });
                } catch (error) {
                    message.error(error);
                }
            })()
        }else{
            let { page, limit, getLimit, selectDepart ,isSearch} = this.state;
            if (!isSearch) {
                page = 1;
            }
            // let data = { q: "", sort: "userId", desc: true, from: 0, count: 10 };
            let data = { q: value, sort: "userID", desc: true, from: ((page - 1) * getLimit), count: getLimit };
            axios.get('/rtc/api/account/users/pageData', { params: data, headers: { "accesstoken": account.accountToken } })
                .then(res => {
                    if (res.status === "OK") {
                        let users = res.result.data;
                        let dataNmae = true;
                        users.map((item) => {
                            item.createDate = moment(item.createDate).format("YYYY-MM-DD HH:mm:ss");
                            item.key = item.mediaServerID;
                            item.loginName = item.userName + "@" + accountInfo.accountName;
                            item.operation = "暂无";
                        })
                        let arr = [];
                        if (selectDepart.ID) {
                            arr = users;
                        } else if(dataNmae == false){
                            return dataNmae = '搜索失败，请重试！'
                        }else {
                            if (selectDepart.users && selectDepart.users.length > 0) {
                                let selectDepartUsers = selectDepart.users;
                                if (users.length > 0) {
                                    for (let i = 0; i < selectDepartUsers.length; i++) {
                                        let userItem = _.first(_.where(users, { userID: selectDepartUsers[i].userID }))
                                        if (userItem) {
                                            arr.push(userItem);
                                        }
                                    }
                                }
                            }
                        }
    
                        that.setState({
                            showUsers: arr,
                            total: arr.total,
                            page,
                        })
                    } else if (res.status === "ERROR") {
                        message.error(res.error.message);
                    }
                }).catch((error) => {
                    message.error(error);
                    return push('/login');
                })
        }
        
    }
    checkUserName(rule, value, callback) {
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
            callback(global.personal.writtenWords)
        }else {
            callback();
        }
    }
    checkPassword(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        var regEn = /['’]/im;
        if(regEn.test(value)){
            callback("不允许输入单引号")
        }else if(len == 0){
            callback()
        }else if(len < 4 || len > 24){
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
        let { editUserData, treeData, showUsers, users, columns, userData, edit, resetPwdShow, page, limit, total } = this.state;
        return (
            <div style={{ padding: '20px', display: 'flex', whiteSpace: 'nowrap' }}>
                <div style={{ textAlign: 'center', width: '25%' }}>
                    <div style={{ textAlign: 'center', width: '100%', height: '40px', lineHeight: '40px', background: '#eaeaea', marginBottom: '2px' }}>
                        用户导航
                    </div>
                    <div style={{ width: '100%', height: '60vh', border: '2px solid #eaeaea', borderRadius: '4px', overflowY: 'auto' }}>
                        <Tree onSelect={this.onSelect} loadData={this.onLoadData}>{this.renderTreeNodes(this.state.treeData)}</Tree>
                    </div>
                </div>
                <div style={{ width: '100%', paddingLeft: '10px' }}>
                    <div className="users_header">
                        <div>
                            <div>
                                <Button type="primary" onClick={this.showDrawer}>添加</Button>
                                <Button type="primary" onClick={this.reloadData} style={{marginLeft:"5px"}}>刷新</Button>
                            </div>
                            {!resetPwdShow ?
                                <div>
                                    {edit &&
                                        <Drawer title={edit ? '编辑用户' : '创建用户'} width={720} onClose={this.onClose
                                        } visible={this.state.visible}>

                                            <Form onSubmit={this.handleSubmit} className="password_box">
                                                <Input type="userName" autoComplete="new-password" hidden />
                                                <Input type="password" autoComplete="new-password" hidden />
                                                <Row gutter={24}>
                                                    <Col span={24}>
                                                        <Form.Item label="登录名">
                                                            {getFieldDecorator('userName', {
                                                                initialValue: editUserData.userName,
                                                                rules: [{ required: true, message: '请输入登录名' }]
                                                            })(<Input placeholder="请输入登录名" addonAfter={"@" + accountInfo.accountName} disabled={true} />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row gutter={24}>
                                                    <Col span={24}>
                                                        <Form.Item label="姓名">
                                                            {getFieldDecorator('realName', {
                                                                initialValue: editUserData.realName,
                                                                rules: [{ required: true, message: '请输入姓名' },{ validator: (rule, value, callback) => { this.checkUserName(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                            })(<Input style={{ width: '100%' }} placeholder="请输入姓名" />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                                                    <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                                                    <Button type="primary" htmlType="submit" >提交</Button>
                                                </div>
                                            </Form>
                                        </Drawer>
                                    }
                                    {!edit &&
                                        <Drawer title='创建用户' width={720} onClose={this.onClose} visible={this.state.visible}>

                                            <Form onSubmit={this.handleSubmit} className="password_box">
                                                <Input type="userName" autoComplete="new-password" hidden />
                                                <Input type="password" autoComplete="new-password" hidden />

                                                <Row gutter={24}>
                                                    <Col span={24}>
                                                        <Form.Item label="登录名">
                                                            {getFieldDecorator('userName', {
                                                                rules: [{ required: true, message: '请输入登录名' },{ validator: (rule, value, callback) => { this.checkUserName(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                            })(<Input placeholder="请输入登录名" addonAfter={"@" + accountInfo.accountName} />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={24}>
                                                    <Col span={24}>
                                                        <Form.Item label="姓名">
                                                            {getFieldDecorator('realName', {
                                                                rules: [{ required: true, message: '请输入姓名' },{ validator: (rule, value, callback) => { this.checkUserName(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                            })(<Input style={{ width: '100%' }} placeholder="请输入姓名" />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row gutter={24}>
                                                    <Col span={24}>
                                                        <Form.Item label="密码">
                                                            {getFieldDecorator('password', {
                                                                rules: [{ required: true,whitespace:true, message: '请输入密码'},{ validator: (rule, value, callback) => { this.checkPassword(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                            })(<Input type="password" placeholder="请输入密码" autoComplete="off" />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                                                    <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                                                    <Button type="primary" htmlType="submit" >提交</Button>
                                                </div>
                                            </Form>
                                        </Drawer>
                                    }
                                </div>

                                :
                                <div>
                                    <Drawer title="重置密码" width={720} onClose={this.onClose} visible={this.state.visible}>
                                        <Form onSubmit={this.submitResetPwd} className="password_box">
                                            <Row gutter={24}>
                                                <Col span={24}>
                                                    <Form.Item label="密码">
                                                        {getFieldDecorator('newPassword', {
                                                            rules: [{ required: true,whitespace:true, message: '请输入密码'},{ validator: (rule, value, callback) => { this.checkPassword(rule, value, callback) } }], validateTrigger: 'onBlur',
                                                        })(<Input placeholder="请输入密码" />)}
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                                                <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                                                <Button type="primary" htmlType="submit" >提交</Button>
                                            </div>
                                        </Form>
                                    </Drawer>
                                </div>

                            }

                            <div className="users_search"><Search ref= "searchBar" id="user_secrch_name" placeholder="请输入用户名" onSearch={this.searchUser} enterButton /></div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%', height: '40px', lineHeight: '40px', background: '#eaeaea', margin: '5px 0 0 0' }}>
                        用户管理
                    </div>
                    <Table columns={columns} dataSource={showUsers} pagination={{ defaultPageSize: limit, total, current: page, onChange: this.changePage }} />
                </div>
            </div >
        )
    }
}


const mapStateToProps = (state) => {
    return {
        account: state.account
    };
}

export default connect(mapStateToProps, null)(Form.create()(Users));