import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form, Icon, message, Modal, Drawer, Col, Row, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import md5 from 'md5';
import { connect } from 'react-redux';
import './LiveRecordList.css';
const { confirm } = Modal;
const { Search } = Input;

class LiveRecordList extends Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
        this.changePage = this.changePage.bind(this);
        const columns = [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key',
                width: '30%',
            },
            {
                title: '文件名称',
                dataIndex: 'fileName',
                key: 'fileName',
                width: '30%',
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
                title: '文件时长',
                dataIndex: 'durationTime',
                key: 'durationTime',
            },
            {
                title: '播放次数',
                dataIndex: 'palytimes',
                key: 'palytimes',
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) =>
                    <span className="operate_meeting">
                        <a className="operate_meeting_item" href={record.recordsLink} target="_blank" >播放</a>
                    </span>
            },
        ];

        this.state = {
            columns,
            page: 1,
            limit: 10,
            total: null,
            name: '',
            dataSource: [],
        };
    }
    async componentWillMount() {
        await this.getLiveRecordList();
    }
    back() {
        this.props.history.push('/user/meetingsList');
    }
    // playFile(){

    // }
    getLiveRecordList() {
        let that = this;
        let mID = this.props.match.params.meetingID;
        if (mID) {
            axios.get('/rtc/api/videos', { params: { mID } }).then((res) => {
                console.log('========videos', res)
                if (res.status === "ERROR") {
                    message.error(res.error.message);
                } else if (res.status === "OK") {
                    if (res.result.success) {
                        let liveRecordList = res.result.fileList;
                        liveRecordList.map((item, index) => {
                            item.key = index + 1;
                            item.stateDate = moment.unix(item.starttime).format("YYYY-MM-DD HH:mm");
                            if (item.stoptime) {
                                item.endDate = moment.unix(item.stoptime).format("YYYY-MM-DD HH:mm");
                            }
                            let second = item.duration;
                            let DD = Math.floor(second / 60 / 60/24);
                            let HH = Math.floor(second / 60 / 60);
                            let mm = Math.floor(second / 60);
                            let restDate;
                            if (DD > 0) {
                                restDate = `${DD}天${HH}时${mm}分`;
                            } else {
                                if (HH > 0) {
                                    restDate = `${HH}时${mm}分`;
                                } else {
                                    if (mm > 0 || mm == 0) {
                                        restDate = `0时${mm}分`;
                                    } else {
                                    }
                                }
                            }
                            item.durationTime = restDate;
                            item.recordsLink = `${window.location.origin}/liveRecord/${mID}/${item.fileID}`;
                        })
                        that.setState({ dataSource: liveRecordList, total: liveRecordList.length });
                    }
                }
            }).catch((error) => {
                message.error(error);
            })
        }
    }
    async changePage(page, changePage) {
        await this.setState({ page });
        await this.getMeetingsList();
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { dataSource, limit, total, page, columns, visible } = this.state;
        return (
            <div>
                <div className="user_meeting_box_title" onClick={this.back}><span><Icon type="arrow-left" /></span>返回</div>
                <div className="user_meeting_box">
                    {/* <div className="user_meeting_right">
            <Search placeholder="请输入会议日志名称" onSearch={this.searchMeetingByName} enterButton />
          </div> */}
                </div>
                <div className="user_meeting_list">
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={{ defaultPageSize: limit, current: page, total, onChange: this.changePage }}
                    />
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(LiveRecordList));

