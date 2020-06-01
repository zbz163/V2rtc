import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, message } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import axios from 'axios';
import md5 from 'md5';
import { storageUtils } from '../../../../utils';
import { throwStatement, thisTypeAnnotation } from '@babel/types';

const FormItem = Form.Item

class LoginAccount extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.reloadSvgCode = this.reloadSvgCode.bind(this);
        this.handleValidateSvgCode = this.handleValidateSvgCode.bind(this);
        this.register = this.register.bind(this);
        this.state = {
            svgCode: {},
            svgVerifyCode: "",
            userInfo: { userName: '', userPwd: '' },
            isSvg:false,
        }
    }
     componentWillMount() {
        let that = this;
        (async()=>{
            let { push } = that.props;
            // that.props.form.resetFields();
            that.setState({svgCode: {},
                svgVerifyCode: "",
                userInfo: { userName: '', userPwd: '' },
                isSvg:false})
            let userInfo;
            let userAccount = await storageUtils.GetUserAccount();
            let userAccountPwd = await storageUtils.GetUserAccountPwd();
            userInfo = { userName: userAccount, userPwd: userAccountPwd }
            if (userAccount) {
                that.setState({ userInfo });
            } else {
                let userName = await storageUtils.GetUserName();
                let userPwd = await storageUtils.GetUserPwd();
                userInfo = { userName, userPwd };
                if (userName) {
                    that.setState({ userInfo });
                }
            }
            if (userAccount && userAccountPwd) {
                that.setState({ userInfo: { userName: userAccount, userPwd: userAccountPwd } });
            }
            console.error('=====userInfo',userInfo)
            await axios.get('/rtc/api/misc/svgCode')
                .then(res => {
                    console.log('====res aaaa',res)
                    that.setState({ svgCode: res.result ,isSvg:true});
                }).catch(error => {
                    message.error('图片加载失败');
                })
        })()
       
    }
    componentWillUnmount() {
        // 销毁拦截判断是否离开当前页面
       console.log('================componentWillUnmount')
       this.setState({  svgCode: {},
        svgVerifyCode: "",
        userInfo: { userName: '', userPwd: '' },
        isSvg:false})
    }
    reloadSvgCode() {
        axios.get('/rtc/api/misc/svgCode')
            .then(res => {
                this.setState({ svgCode: res.result })
            }).catch(error => {
                message.error('图片加载失败');
            })
    }
    handleValidateSvgCode(rule, val, callback) {
        if (!val) {
            callback("验证码不能为空");
        }
        this.setState({ svgVerifyCode: val });
        let validateResult = rule;  // 自定义规则
        if (!validateResult) {
            return message.error('')
        }
        if (val.length == 4) {
            let { svgCode } = this.state;
            console.log('======svgCode',svgCode,'====val',val)
            axios.get('/rtc/api/misc/svgCode/check', { params: { svgCodeID: svgCode.svgCodeID, svgVerifyCode: val } })
                .then(res => {
                    console.log('=====handleValidateSvgCode',res)
                    if (res.result === false) {
                        callback("验证码错误");
                    } else {
                        callback();
                    }
                }).catch(error => {
                    callback("验证码错误");
                })
        } else if (val.length > 4) {
            callback("验证码错误");
        }
    }
    handleSubmit1 = (e) => {
        e.preventDefault();
        console.error('=====accountName',"点击了")
        let { svgVerifyCode, svgCode ,isSvg} = this.state;
        console.log('svgVerifyCode, svgCode',svgVerifyCode, svgCode,'======isSvg',isSvg)
        if (svgVerifyCode.length != 4) {
            return message.error("验证码错误，请重新输入")
        }
        if(!isSvg){
            return;
        }
        let that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { push } = that.props;
                let { accountName, password } = values;
                console.error('=====accountName',accountName,'password',password)
                let pwd = password;
                svgVerifyCode = values.svgVerifyCode;
                let svgCodeID = svgCode.svgCodeID;
                let expireMMSeconds = 1000 * 3600 * 24;
                password = md5(password);
                console.error('login account handsub ' ,password,'-----',accountName)
                if (accountName.indexOf("@") >= 0) {
                    var nameBox = accountName.split('@');
                    let data = { userName: nameBox[0], accountName: nameBox[1], svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: true };
                    axios.post('/rtc/api/misc/user/login', data)
                        .then(res => {
                            console.log('===res login', res)
                            if (res.status === "ERROR") {
                                message.error(res.error.message);
                                that.reloadSvgCode();
                            } else if (res.status === "OK") {
                                (async () => {
                                    that.setState({userInfo:{userName: '', userPwd: ''} ,isSvg:false});
                                    await storageUtils.SetUserName(accountName);
                                    await storageUtils.SetUserPwd(password);
                                    await storageUtils.SetUserAccount('');
                                    await storageUtils.SetUserAccountPwd('');
                                    console.log('=== login sdk', { name: md5(accountName), password })
                                    that.props.login({ name: md5(accountName), password });
                                    that.props.loginUser({ accessToken: res.result.accessToken, companyLogoUrl: res.result.companyLogoUrl, companyName: res.result.companyName, userInfo: res.result.userInfo });
                                    that.props.form.resetFields();
                                    push('/user/info');
                                })()
                            }
                        }).catch(error => {
                            message.error(error);
                            that.reloadSvgCode();
                        })
                } else {
                    let data = { accountName, svgVerifyCode, password, expireMMSeconds, svgCodeID, hasVerifyCode: true };
                    axios.post('/rtc/api/misc/account/login', data)
                        .then(res => {
                            if (res.status === "ERROR") {
                                message.error(res.error.message);
                                that.reloadSvgCode();
                            } else if (res.status === "OK") {
                                (async () => {
                                    that.setState({userInfo:{userName: '', userPwd: ''} ,isSvg:false});
                                    await storageUtils.SetUserAccount(accountName);
                                    await storageUtils.SetUserAccountPwd(password);
                                    await storageUtils.SetUserName('');
                                    await storageUtils.SetUserPwd('');
                                    await that.props.login({ name: md5(accountName), password });
                                    await that.props.loginAccount({ accountToken: res.result.accessToken, accountInfo: res.result.accountInfo });
                                    that.props.form.resetFields();
                                    push('/company/profile');
                                })()

                            }
                        }).catch(error => {
                            message.error(error);
                            that.reloadSvgCode();
                        })
                }
            }
        })
    }
    register() {
        let { push } = this.props;
        push('/company/register');
    }
    clickLogin(){

    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { svgCode, userInfo } = this.state;
        return (
            <Card className="card login_admin">
                <Form onSubmit={this.handleSubmit1} className="logina-form" style={{ justifyContent: 'flex-end' }}>
                    <Input type="accountName" autoComplete="new-password" hidden />
                    <Input type="password" autoComplete="new-password" hidden />
                    <FormItem>
                        {getFieldDecorator('accountName', {
                            initialValue: userInfo.userName,
                            rules: [{ required: true, message: '重新输入用户名' }]
                        })(
                            <Input
                                prefix={<Icon type="accountName" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                placeholder="用户名" autoComplete="off"
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            initialValue: userInfo.userPwd,
                            rules: [{ required: true, message: '重新输入密码' }]
                        })(
                            <Input
                                prefix={<Icon type="password" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                type="password"
                                placeholder="密码" autoComplete="off"
                            />
                        )}
                    </FormItem>
                    <div className="item_display" style={{ display: 'flex' }}>
                        <FormItem>
                            {getFieldDecorator('svgVerifyCode', {
                                rules: [{ required: true, message: '重新输入验证码' }, { validator: this.handleValidateSvgCode }]
                            })(
                                <Input
                                    prefix={<Icon type="svgVerifyCode" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    placeholder="验证码"
                                />
                            )}
                        </FormItem>
                        {/* 验证图片 begin*/}
                        {svgCode && svgCode.svgData &&
                            <div className="svgCode" onClick={this.reloadSvgCode}> <div dangerouslySetInnerHTML={{ __html: svgCode.svgData }}></div></div>
                        }
                        {/* 验证图片 over */}
                    </div>
                    <FormItem className="item_float">
                        <div className="btns" style={{ margin: "0 auto" }}>
                            {/* <Button  style={{ width: "100px" }} onClick={this.clickLogin.bind(this)}>登录</Button> */}

                            <Button type="primary" htmlType="submit" style={{ width: "100px" }} >登录</Button>
                        </div>
                    </FormItem>
                    <FormItem className="item_float">
                        <div className="btns" style={{ margin: "0 auto" }} onClick={this.register}>
                            <Button type="button" style={{ width: "100px" }} >注册</Button>
                        </div>
                    </FormItem>
                </Form>
            </Card>
        )
    }
}
const mapStateToProps = (state) => {
    console.log('===================state********', state)
    return {
        conNect: state.conNect,
        account: state.account
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        loginAccount: (data) => {
            var action = actions.loginAccount(data);
            dispatch(action);
        },
        loginUser: (data) => {
            var action = actions.loginUser(data);
            dispatch(action);
        },
        login: (data) => {
            var action = actions.login(data);
            console.log('=== login sdk action', action)
            dispatch(action);
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(LoginAccount));