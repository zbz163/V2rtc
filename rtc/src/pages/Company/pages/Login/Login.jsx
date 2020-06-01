import React, { Component } from 'react'
import { Card, Form, Icon, Input, Button } from 'antd'

import './Login.css'

const FormItem = Form.Item

class Login extends Component {

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { username, password } = values
                if (username === 'test' && password === '123456') {
                    this.props.history.push('/company/profile')
                }
            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div className="login">
                <Card className="card">
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <FormItem>
                            <div className="title">
                                后台管理系统
                            </div>
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: '请输入用户名!' }]
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    placeholder="Username"
                                />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }]
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                                    type="password"
                                    placeholder="Password"
                                />
                            )}
                        </FormItem>
                        <FormItem>
                            <div className="btns">
                                <Button type="primary" htmlType="submit" >登录</Button>
                                <Button type="primary" >注册</Button>
                            </div>
                        </FormItem>
                    </Form>
                </Card>
            </div>
        )
    }
}

export default Form.create()(Login)