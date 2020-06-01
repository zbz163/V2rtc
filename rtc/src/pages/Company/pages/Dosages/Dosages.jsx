import React, { Component } from 'react'
import './Dosages.css';
import { Button , Input , Table, Divider, Tag , DatePicker} from 'antd';
import 'antd/dist/antd.css';

const { Search } = Input;

const columns = [
    {
        title: '创建人',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '视频ID',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: '开始时间',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: '结束时间',
        key: 'tags',
        dataIndex: 'tags',
    },
    {
        title: '时长(分)',
        key: 'minute',
        dataIndex: 'minute',
    },
    {
        title: '消费金额(元)',
        key: 'money',
        dataIndex: 'money',
    },
    {
        title: '操作',
        key: 'operation',
        dataIndex: 'operation',
    },
  ];
  
  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: '2019-10-1',
      tags: '2019-10-21',
      minute:'60',
      money:'9000'
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: '2019-11-1',
      tags: '2019-11-20',
      minute:'60',
      money:'10000'
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: '2019-10-10',
      tags: '2019-10-28',
      minute:'60',
      money:'101000'
    },
  ];

   
class Dosages extends Component {
    state = {
        startValue: null,
        endValue: null,
        endOpen: false,
      };
    
      disabledStartDate = startValue => {
        const { endValue } = this.state;
        if (!startValue || !endValue) {
          return false;
        }
        return startValue.valueOf() > endValue.valueOf();
      };
    
      disabledEndDate = endValue => {
        const { startValue } = this.state;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
      };
    
      onChange = (field, value) => {
        this.setState({
          [field]: value,
        });
      };
    
      onStartChange = value => {
        this.onChange('startValue', value);
      };
    
      onEndChange = value => {
        this.onChange('endValue', value);
      };
    
      handleStartOpenChange = open => {
        if (!open) {
          this.setState({ endOpen: true });
        }
      };
    
      handleEndOpenChange = open => {
        this.setState({ endOpen: open });
      };
    render() {
        const { startValue, endValue, endOpen } = this.state;
        return (
            <div>
                <div className="dosages_header">
                    <div>
                        <DatePicker
                            disabledDate={this.disabledStartDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={startValue}
                            placeholder="开始时间"
                            onChange={this.onStartChange}
                            onOpenChange={this.handleStartOpenChange}
                        />
                        &nbsp;&nbsp;
                        <DatePicker
                            disabledDate={this.disabledEndDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={endValue}
                            placeholder="结束时间"
                            onChange={this.onEndChange}
                            open={endOpen}
                            onOpenChange={this.handleEndOpenChange}
                        />
                        &nbsp;&nbsp;
                        <Button type="primary">查询</Button>
                    </div>
                </div>
                <Table columns={columns} dataSource={data} />
            </div>
        )
    }
}

export default Dosages