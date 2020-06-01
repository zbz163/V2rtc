import React, { Component } from 'react';
import { Tree } from 'antd';
import { Table, Input, Button, Form, Icon, Modal, message } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import _ from 'underscore';
import EditDepartment from './EditDepartment';
const { TreeNode } = Tree;
const { confirm } = Modal;
class EditDepartment extends Component {
    state = {
        visible: false,
        loading: false,
        companyInfo: {},
        imageUrl:"",
        headers:{}
    };

    showDrawer = () => {
        let that = this;
        let { account } = this.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            if (!account.accountInfo.companyName) {
                return message.error("请先登录");
            } else {
                companyInfo = account.accountInfo;
                that.setState({
                    visible: true,
                    companyInfo,
                    headers:{"accesstoken": account.accountToken}
                });
            }
        }
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    handleChange = info => {
        console.log('=========info====',info)
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            console.log('=========info',info)
            // Get this url from response in real world.
            // getBase64(info.file.originFileObj, imageUrl =>
            //     this.setState({
            //         imageUrl,
            //         loading: false,
            //     }),
            // );
        }
    };
    getCompanyInfo(){
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
        axios.get('/rtc/api/account/baseInfo', { headers: { "accesstoken": account.accountToken } })
        .then(res => {
            console.log('======res getCompanyInfo',res)
            if (res.status === "OK") {
                // message.success('修改成功');
                that.props.loginAccount({ accountToken: account.accountToken, accountInfo: res.result });
            } else if (res.status === "ERROR") {
                message.error(res.error.message);
            }
        }).catch(error => {
            message.error(error);
            return push('/login');
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
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
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let {companyName} = values;
                if(!companyName)return message.error('公司名称不能为空');
                let data = {params:{companyName}};
                axios.put('/rtc/api/account/baseInfo', data, { headers: { "accesstoken": account.accountToken } })
                        .then(res => {
                            console.log('======res handleSubmit',res)
                            if (res.status === "OK") {
                                message.success('修改成功');
                                that.getCompanyInfo();
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
    customRequest = (option)=> {
        let { account, push } = this.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        const formData = new FormData();
        // const fileUrl = AjaxUrl+"data/fileUpload.svt";
        formData.append('files[]',option.file);
       console.log('===option',option)
       console.log('formData',formData)

        // axios.get('/rtc/api/account/uploadFileUrl',{params:{}, headers:{"accesstoken": account.accountToken}}).then((res)=>{
        //     console.log('====res upload',res)
        // }).catch((err)=>{   
        //     console.log('===err',err)
        // })
        axios.post('/rtc/api/account/uploadLogo',{},{headers:{"accesstoken": account.accountToken}}).then((res)=>{
            console.log('====res upload',res)
        }).catch((err)=>{   
            console.log('===err',err)
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const { imageUrl,companyInfo,headers } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showDrawer}>修改资料</Button>
                <Drawer title="修改资料" width={720} onClose={this.onClose} visible={this.state.visible}>
                    <Form layout="vertical"  onSubmit={this.handleSubmit}>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="公司名称">
                                    {getFieldDecorator('companyName', {initialValue: companyInfo.companyName,
                                        rules: [{ required: true, message: '请输入公司名称' }],
                                    })(<Input placeholder="请输入公司名称" />)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="logo">
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        action="/rtc/api/account/uploadLogo"
                                        // method="GET"
                                        headers={headers}
                                        beforeUpload={beforeUpload}
                                        onChange={this.handleChange}
                                        // customRequest={this.customRequest}
                                    >
                                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                        <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                            <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                            <Button htmlType="submit" type="primary">提交</Button>
                        </div>
                    </Form>

                </Drawer>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
      
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditDepartment));