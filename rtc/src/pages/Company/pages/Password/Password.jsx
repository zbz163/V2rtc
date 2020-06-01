import React, { Component } from 'react'
import { Drawer, Form, Button, Col, Row, Input, message, Icon } from 'antd';
import { connect } from 'react-redux';
import md5 from 'md5';
import axios from 'axios';
import './Password.css';
import Tips from '../../../../config/Tips';


class Password extends Component {
    constructor(props, context) {
        super(props, context);
        this.reloadSvgCode = this.reloadSvgCode.bind(this);
        this.handleValidateSvgCode = this.handleValidateSvgCode.bind(this);
        this.state = {
            visible: false,
            svgCode: {},
            svgVerifyCode: "",
        }
    }
    componentWillMount() {
        axios.get('/rtc/api/misc/svgCode?&')
            .then(res => {
                this.setState({ svgCode: res.result })
            }).catch(error => {
                message.error('图片加载失败');
            })
    }
    reloadSvgCode() {
        axios.get('/rtc/api/misc/svgCode?&')
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
    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    handleSubmit = (e) => {
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
        let { svgVerifyCode, svgCode } = this.state;
        if (svgVerifyCode.length != 4) {
            return message.error("验证码错误，请重新输入")
        }
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { oldPassword, newPassword, newPwd, svgVerifyCode } = values;
                if (oldPassword === newPassword) return message.error('新密码与旧密码一致');
                if (newPassword !== newPwd) return message.error('两次密码不一致');
                svgVerifyCode = values.svgVerifyCode;
                let svgCodeID = svgCode.svgCodeID;
                let data = { oldPassword: md5(oldPassword), newPassword: md5(newPassword), svgVerifyCode, svgCodeID };
                axios.put('/rtc/api/account/password', data, { headers: { "accesstoken": account.accountToken } })
                    .then(res => {
                        if (res.status === "OK") {
                            message.success('修改成功');
                            that.onClose();
                        } else if (res.status === "ERROR") {
                            message.error(res.error.message);
                        }
                    }).catch(error => {
                        message.error(error);
                        return push('/login');
                    })
            }
        })
    }
    // newPassword(rule, value, callback) {
    //     let pwd = this.props.form.getFieldValue('pwd');
    //     let passwordLength = value.length;
    //     if(passwordLength < 4 || passwordLength > 24){
    //         callback(global.password.writtenWords)
    //     }else if (value && pwd !== value) {
    //         callback('两次密码输入不一致')
    //     }
    //      else {
    //         callback();
    //     }
    // }
    render() {
        const { getFieldDecorator } = this.props.form;
        let { svgCode } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showDrawer}>修改密码</Button>
                <Drawer title="修改密码" width={720} onClose={this.onClose} visible={this.state.visible}>
                    <Form onSubmit={this.handleSubmit} className="password_box">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="旧密码">
                                    {getFieldDecorator('oldPassword', {
                                        rules: [{ required: true, message: '请输入旧密码' }],
                                    })(<Input placeholder="请输入旧密码" />)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                            {/* ,{ validator: (rule, value, callback) => { this.newPassword(rule, value, callback) } } */}
                                <Form.Item label="新密码">
                                    {getFieldDecorator('newPassword', {
                                        rules: [{ required: true, message: '请输入新密码' },{min:4,max:24,message:global.password.writtenWords}],
                                    })(<Input style={{ width: '100%' }} placeholder="请输入新密码" />)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="确认新密码">
                                    {getFieldDecorator('newPwd', {
                                        rules: [{ required: true, message: '请再输入一次新密码' },{min:4,max:24,message:global.password.writtenWords}],
                                    })(<Input placeholder="请再输入一次新密码" />)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="验证码">
                                    {getFieldDecorator('svgVerifyCode', {
                                        rules: [{ required: true, message: '重新输入验证码' }, { validator: this.handleValidateSvgCode }]
                                    })(
                                        <Input
                                            prefix={<Icon type="svgVerifyCode" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                            placeholder="验证码"  autoComplete="off"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* 验证图片 begin*/}
                        {svgCode && svgCode.svgData &&
                            <div className="svgCode" onClick={this.reloadSvgCode}> <div dangerouslySetInnerHTML={{ __html: svgCode.svgData }}></div></div>
                        }
                        {/* 验证图片 over */}
                        <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                            <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </div>
                    </Form>

                </Drawer>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        account: state.account
    };
}

export default connect(mapStateToProps, null)(Form.create()(Password));