import React, { Component } from 'react'
import './Orders.css';
import { Button , Input , Table, Divider, Tag , DatePicker} from 'antd';
import 'antd/dist/antd.css';

const { Search } = Input;

const columns = [
    {
        title: '订单ID',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '充值金额(元)',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: '支付方式',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: '订单状态',
        key: 'tags',
        dataIndex: 'tags',
    },
    {
        title: '创建日期',
        key: 'date',
        dataIndex: 'date',
    },
    {
        title: '操作',
        key: 'operation',
        dataIndex: 'operation',
    },
  ];
  
  const data = [
    {
      key: '20190001',
      name: 'John Brown',
      age: 32,
      address: '支付宝',
      tags: '已支付',
      date:'2019-10-1',
    },
    {
      key: '20190002',
      name: 'Jim Green',
      age: 42,
      address: '微信',
      tags: '待支付',
      date:'2019-11-1',
    },
    {
      key: '20190003',
      name: 'Joe Black',
      age: 32,
      address: '支付宝',
      tags: '已支付',
      date:'2019-10-10',
    },
  ];


class Orders extends Component {
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

export default Orders