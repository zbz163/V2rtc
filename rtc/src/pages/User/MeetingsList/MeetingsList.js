import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form, Icon, message, Modal, Drawer, Col, Row, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import md5 from 'md5';
import { connect } from 'react-redux';
import './MeetingsList.css';
import Tips from '../../../config/Tips';

const { confirm } = Modal;
const { Search } = Input;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);



class MeetingsList extends Component {
  constructor(props) {
    super(props);
    this.back = this.back.bind(this);
    this.changeType = this.changeType.bind(this);
    this.changePage = this.changePage.bind(this);
    this.searchMeetingByName = this.searchMeetingByName.bind(this);
    this.editMeeting = this.editMeeting.bind(this);
    this.removeMeeting = this.removeMeeting.bind(this);

    const columns = [
      {
        title: '会议名称',
        dataIndex: 'meetingName',
        key: 'meetingName',
        width: '30%',
        // editable: true,
      },
      {
        title: '开始时间',
        dataIndex: 'stateDate',
        key: 'stateDate',
      },
      {
        title: '结束时间',
        dataIndex: 'endDate',
        key: 'endDate',
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) =>
          <span className="operate_meeting">
            <a className="operate_meeting_item" onClick={this.editMeeting.bind(this, record)}>编辑</a>
            <a className="operate_meeting_item" onClick={this.resetPwd.bind(this, record)}>重置密码</a>
            <a className="operate_meeting_item" href={record.recordsLink} >录制文件</a>
            {/* <a className="operate_meeting_item" target="_blank" href={{}} onClick={this.linkToRecord.bind(this, record)}>录制文件</a> */}
            <a className="operate_meeting_item" onClick={this.removeMeeting.bind(this, record)}>删除</a>
          </span>
      },
    ];

    this.state = {
      columns,
      page: 1,
      limit: 10,
      total: null,
      name: '',
      type: 'all',
      dataSource: [],
      count: 2,
      meetInfo: {},
      visible: false,
      edit: false,
      reset: false,
      endValue: null,
      startValue: null,
    };
  }
  async componentWillMount() {
    await this.getMeetingsList();
  }
  // linkToRecord(e) {
  //   console.log('=======linkToRecord', e);
  //   let recordsLink = `${window.location.origin}/liveRecord/${e.meetingID}`;
  //   window.href = recordsLink;
  //   console.log('--------------recordsLink', recordsLink);
  //   // that.props.history.push('/login');
  // }
  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };
  editMeeting(e) {
    let startValue = moment(new Date(e.startDateObj), "YYYY-MM-DD HH-MM-SS");
    let endValue = moment(new Date(e.endDateObj), "YYYY-MM-DD HH-MM-SS");
    this.setState({ meetInfo: e });
    this.setState({
      visible: true,
      edit: true,
      startValue,
      endValue,
    });
  }
  resetPwd(e) {
    this.setState({ meetInfo: e });
    this.setState({
      visible: true,
      reset: true,
    });
  }
  onClose = () => {
    this.setState({
      visible: false,
      meetInfo: {},
      edit: false,
      reset: false,
      endValue: null,
      startValue: null,
      endOpen: false,
    });
  };
  async searchMeetingByName(val) {
    let that = this;
    await that.setState({ name: val, page: 1 });
    await that.getMeetingsList();
  }
  removeMeeting(e) {
    let that = this;
    let { user } = this.props;
    if (!user) {
      message.error('请先登录');
      return that.props.history.push('/login');
    } else {
      if (!user.accessToken) {
        message.error('请先登录');
        return that.props.history.push('/login');
      } else {
        confirm({
          title: '确认删除此会议吗?',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            axios.post('/rtc/api/user/meetings/deleteMeeting', { meetingID: e.meetingID }, { headers: { "accesstoken": user.accessToken } })
              .then(res => {
                if (res.status === "OK") {
                  message.success('删除成功');
                  // that.getUsersList();
                  let { page, dataSource } = that.state;
                  if (dataSource.length == 1) {
                    if (page == 1) {
                      that.getMeetingsList();
                    } else {
                      (async () => {
                        page--;
                        await that.setState({ page });
                        await that.getMeetingsList();
                      })()
                    }
                  } else {
                    that.getMeetingsList();
                  }
                } else if (res.status === "ERROR") {
                  message.error(res.error.message);
                  return that.props.history.push('/login');
                }
              }).catch(error => {
                message.error(error);
                return that.props.history.push('/login');
              })
          }
        });
      }
    }
  }
  back() {
    this.props.history.push('/user/info')
  }
  getMeetingsList() {
    let that = this;
    let { page, limit, name, type } = this.state;
    let { user } = this.props;
    if (!user) {
      // message.error('请先登录');
      return that.props.history.push('/login');
    } else {
      if (!user.accessToken) {
        // message.error('请先登录');
        return that.props.history.push('/login');
      } else {
        let data = { page, limit, name, type, userID: user.userInfo.userID };
        axios.post('/rtc/api/user/meetings/getList', data, { headers: { "accesstoken": user.accessToken } }).then((res) => {
          if (res.status === "OK") {
            let meetingList = res.result.data;
            meetingList.map((item, index) => {
              item.key = index;
              item.stateDate = moment(item.startDateObj).format("YYYY-MM-DD HH:mm");
              item.endDate = moment(item.endDateObj).format("YYYY-MM-DD HH:mm");
              item.recordsLink = `${window.location.origin}/liveRecordList/${item.meetingID}`;
              if (item.topic) {
                item.meetingName = item.topic;
              } else {
                item.meetingName = item.roomName;
              }
            })
            that.setState({ dataSource: res.result.data, total: res.result.total });
          } else if (res.status === "ERROR") {
            message.error(res.error.message);
            return that.props.history.push('/login');
          }
        }).catch((error) => {
          message.error(error);
          return that.props.history.push('/login');
        })
      }
    }
  }
  async changeType(e) {
    let type = e.target.getAttribute("data-type");
    // console.log('-----------changeType', type);
    await this.setState({ type, page: 1, name: "" });
    await this.getMeetingsList();
  }
  async changePage(page, changePage) {
    await this.setState({ page });
    await this.getMeetingsList();
  }
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
  handleSubmit = e => {
    e.preventDefault();
    let that = this;
    let { edit, meetInfo } = that.state;
    let { user } = this.props;
    if (!user) {
      message.error('请先登录');
      return that.props.history.push('/login');
    } else {
      if (!user.accessToken) {
        message.error('请先登录');
        return that.props.history.push('/login');
      } else {
        that.props.form.validateFields((err, values) => {
          if (!err) {
            (async () => {
              if (edit) {
                //编辑
                let { topic, startDate, endDate, remarks } = values;
                if (!topic) return message.error("会议名称不能为空");
                // if (!startDate) return message.error('开始时间不能为空');
                // startDate = new Date(startDate).getTime();
                // if (!endDate) return message.error('结束时间不能为空');
                // endDate = new Date(endDate).getTime();
                // if (endDate < startDate) return message.error('结束时间不能大于开始时间');
                if (!remarks) {
                  remarks = "";
                }
                // let roomID = meetInfo.roomID;
                // let checkMeetingTime = await that.checkMeetingTime(roomID, startDate, endDate);
                // if (!checkMeetingTime.state) return message.error(checkMeetingTime.message);
                // let data = { meetingID: meetInfo.meetingID, topic, startDate, endDate, remarks, state: 1 };
                let data = { meetingID: meetInfo.meetingID, topic, remarks, state: 1 };

                axios.post('/rtc/api/user/meetings/edit', data, { headers: { "accesstoken": user.accessToken } })
                  .then(res => {
                    if (res.status === "OK") {
                      if (res.result) {
                        message.success('编辑成功');
                        that.getMeetingsList();
                        that.onClose();
                      } else {
                        message.error('编辑失败');
                      }
                    } else if (res.status === "ERROR") {
                      message.error(res.error.message);
                    }
                  }).catch((error) => {
                    message.error(error);
                    return that.props.history.push('/login');
                  })
              } else {
                //重置密码
                let { charmanPwd, normalPwd } = values;
                if (!charmanPwd) return message.error("主持人密码不能为空");
                // if (!roomInfo.roomID) return message.error('会议室不存在');
                if (!normalPwd) {
                  normalPwd = "";
                } else {
                  normalPwd = md5(normalPwd);
                }
                charmanPwd = md5(charmanPwd);
                let data = { meetingID: meetInfo.meetingID, charmanPwd, normalPwd, state: 2 };
                axios.post('/rtc/api/user/meetings/edit', data, { headers: { "accesstoken": user.accessToken } })
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
                    return that.props.history.push('/login');
                  })
              }
            })()
          }
        })
      }
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    const { endOpen, dataSource, limit, total, columns, meetInfo, visible, reset, edit, startValue, endValue } = this.state;
    console.log('============meetInfo', meetInfo);
    return (
      <div>
        <div className="user_meeting_box_title" onClick={this.back}><span><Icon type="arrow-left" /></span>返回</div>
        <div className="user_meeting_box">
          <div className="user_meeting_left">
            <Button data-type='all' onClick={this.changeType} type="primary" style={{ margin: '0 20px 16px 0' }}>
              全部
                    </Button>
            <Button data-type='begin' onClick={this.changeType} type="primary" style={{ margin: '0 20px 16px 0' }}>
              已开始
                    </Button>
            <Button data-type='noBegin' onClick={this.changeType} type="primary" style={{ margin: '0 20px 16px 0' }}>
              未开始
                    </Button>
            <Button data-type='end' onClick={this.changeType} type="primary" style={{ margin: '0 20px 16px 0' }}>
              已结束
                    </Button>
          </div>
          <div className="user_meeting_right">
            <Search placeholder="请输入会议名称" onSearch={this.searchMeetingByName} enterButton />
          </div>
        </div>
        <div className="user_meeting_list">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ defaultPageSize: limit, total, onChange: this.changePage }}
          />
        </div>
        {meetInfo.meetingID &&
          <Drawer title={edit ? "编辑会议" : "重置密码"} width={720} onClose={this.onClose} visible={this.state.visible}>
            <Form onSubmit={this.handleSubmit} className="password_box">
              <Input type="userName" autoComplete="new-password" hidden />
              <Input type="password" autoComplete="new-password" hidden />
              {edit ?
                <div>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="会议名称">
                        {getFieldDecorator('topic', {
                          initialValue: meetInfo.topic,
                          rules: [{ required: true, message: '请输入会议室名称' },{max:24,message:global.username.writtenWords}],
                        })(<Input style={{ width: '100%' }} placeholder="请输入会议室名称" />)}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="会议室介绍">
                        {getFieldDecorator('remarks', {
                          initialValue: meetInfo.remarks,
                          rules: [],
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
                          rules: [{ required: true, message: '请输入主持人密码' },{max:24,min:4, message:global.password.writtenWords}],
                        })(<Input type="password" placeholder="请输入主持人密码" autoComplete="off" />)}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="会议室密码">
                        {getFieldDecorator('normalPwd', {
                          rules: [{max:24,min:4, message:global.password.writtenWords}],
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
    )
  }
}
const mapStateToProps = (state) => {
  console.log('===state', state)
  return {
    user: state.account.user,
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(MeetingsList));

