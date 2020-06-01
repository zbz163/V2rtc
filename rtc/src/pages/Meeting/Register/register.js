import React, { Component } from 'react';
import { Form, Input, Button, Icon, message, Modal } from 'antd';
import axios from 'axios';
import './register.css';
import { thisExpression } from '@babel/types';
import md5 from 'md5';
import { storageUtils } from '../../../utils';
import Tips from '../../../config/Tips';
const FormItem = Form.Item;
class Register extends Component {
    constructor(props, context) {
        super(props, context);
        this.reloadSvgCode = this.reloadSvgCode.bind(this);
        this.login = this.login.bind(this);
        this.handleValidateSvgCode = this.handleValidateSvgCode.bind(this);
        this.registerSubmit = this.registerSubmit.bind(this);
        this.state = {
            svgCode: {},
            svgVerifyCode: "",
        }
    }
    componentWillMount() {
        axios.get('/rtc/api/misc/svgCode')
            .then(res => {
                this.setState({ svgCode: res.result })
            }).catch(error => {
                message.error('图片加载失败');
            })
    }
    login() {
        this.props.history.push('/login');
    }
    reloadSvgCode() {
        axios.get('/rtc/api/misc/svgCode')
            .then(res => {
                this.setState({ svgCode: res.result })
            }).catch(error => {
                message.error('图片加载失败');
            })
    }
    checkPassword(rule, value, callback) {
        let pwd = this.props.form.getFieldValue('pwd');
        let passwordLength = value.length;
        if(passwordLength == 0){
            callback();
        }else if(passwordLength < 4 || passwordLength > 24){
            callback(global.password.writtenWords)
        }else if (value && pwd !== value) {
            // callback('两次密码输入不一致')
        }
         else {
            callback();
        }
    }
    checkPwd(rule, value, callback) {
        let password = this.props.form.getFieldValue('password');
        let passwordLength = value.length;
        if(passwordLength == 0){
            callback();
        }else if(passwordLength < 4 || passwordLength > 24){
            callback(global.password.writtenWords)
        }else if (value && password !== value) {
            callback('两次密码输入不一致')
        } else {
            callback();
        }
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
            axios.get('/rtc/api/misc/svgCode/check', { params: { svgCodeID: svgCode.svgCodeID, svgVerifyCode: val } })
                .then(res => {
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
    registerSubmit(e) {
        e.preventDefault();
        let { svgVerifyCode, svgCode } = this.state;
        if (svgVerifyCode.length != 4) {
            return message.error("验证码错误，请重新输入")
        }
        let that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { accountName, companyName, password, svgVerifyCode, pwd } = values;
                let svgCodeID = svgCode.svgCodeID;
                // let expireMMSeconds = 1000 * 3600 * 24;
                if (pwd !== password) return message.error('两次密码不一样');
                password = md5(password);
                let data = { accountName, companyName, svgVerifyCode, password, svgCodeID };
                axios.post('/rtc/api/misc/registerAccount', data)
                    .then(res => {
                        if (res.status === "ERROR") {
                            message.error(res.error.message);
                            that.reloadSvgCode();
                        } else if (res.status === "OK") {
                            message.success('注册成功');
                            (async () => {
                                await storageUtils.SetUserAccount(accountName);
                                await storageUtils.SetUserAccountPwd(password);
                                await storageUtils.SetUserName("");
                                await storageUtils.SetUserPwd("");
                                return that.props.history.push('/login');
                            })()
                        }
                    }).catch(error => {
                        message.error(error);
                        that.reloadSvgCode();
                    })
            }
        })
    }
    checkAccountName(rule, value, callback) {
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
            callback(global.accountName.writtenWords)
        }else {
            callback();
        }
    }
    checkCompanyName(rule, value, callback) {
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
            callback(global.companyName.writtenWords)
        }else {
            callback();
        }
    }
    render() {
        let { svgCode } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="register">
                <div className="register_box">
                    <Form onSubmit={this.registerSubmit}>
                        <div className="register_list">
                            <div>公司登录名</div>
                            <FormItem>
                                {getFieldDecorator('accountName', {
                                    rules: [{ required: true, message: '请输入公司登录名' },{ validator: (rule, value, callback) => { this.checkAccountName(rule, value, callback) } }], validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        prefix={<Icon type="accountName" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                        placeholder="请输入公司登录名"
                                    />
                                )}
                            </FormItem>
                        </div>
                        <div className="register_list">
                            <div>公司名称</div>
                            <FormItem>
                                {getFieldDecorator('companyName', {
                                    rules: [{ required: true, message: '请输入公司名称' },{ validator: (rule, value, callback) => { this.checkCompanyName(rule, value, callback) } }], validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        prefix={<Icon type="companyName" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                        placeholder="请输入公司名称"
                                    />
                                )}
                            </FormItem>
                        </div>
                        <div className="register_list">
                            <div>密码</div>
                            <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码' },{ validator: (rule, value, callback) => { this.checkPassword(rule, value, callback) } }], validateTrigger: 'onBlur'
                            })(
                                <Input
                                    prefix={<Icon type="password" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    type="password"
                                    placeholder="请输入密码"
                                />
                            )}
                            </FormItem>
                        </div>
                        <div className="register_list">
                            <div>确认密码</div>
                            <FormItem>
                            {getFieldDecorator('pwd', {
                                rules: [{ required: true, message: '请输入确认密码' },{ validator: (rule, value, callback) => { this.checkPwd(rule, value, callback) } }], validateTrigger: 'onBlur'
                            })(
                                <Input
                                    prefix={<Icon type="pwd" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    type="password"
                                    placeholder="请输入确认密码"
                                />
                            )}
                            </FormItem>
                        </div>
                        <div className="register_list">
                            <div>验证码</div>
                            <div className="register_svg">
                                {getFieldDecorator('svgVerifyCode', {
                                    rules: [{ required: true, message: '请输入验证码' }, { validator: this.handleValidateSvgCode }]
                                })(
                                    <Input
                                        prefix={<Icon type="svgVerifyCode" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                        placeholder="请输入验证码"
                                    />
                                )}
                                {svgCode && svgCode.svgData &&
                                    <div className="svgCode" onClick={this.reloadSvgCode}> <div dangerouslySetInnerHTML={{ __html: svgCode.svgData }}></div></div>
                                }
                            </div>
                        </div>
                        <FormItem style={{marginBottom:'0'}}>
                            <Button type="primary" htmlType="submit" style={{ width: '100%', marginBottom: '10px' }}>确定</Button>
                        </FormItem>
                        <div className="register_login" onClick={this.login}>已有账号？马上登录></div>
                    </Form>
                    
                </div>
            </div>
        )
    }
}

export default Form.create()(Register);

