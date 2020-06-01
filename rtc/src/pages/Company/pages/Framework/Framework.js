import React, { Component } from 'react';
import { Tree } from 'antd';
import { Table, Input, Button, Form, Icon, Modal, message } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import _ from 'underscore';
// import EditDepartment from './EditDepartment';
const { TreeNode } = Tree;
const { confirm } = Modal;

const columns = [
  {
    title: '部门顺序',
    dataIndex: 'deptOrder',
    render: text => <a>{text}</a>,
  },
  {
    title: '名称',
    dataIndex: 'title',
  },
  {
    title: '简介',
    dataIndex: 'desc',
  },
];
const dataTable = [];
class Framework extends Component {

  state = {
    departmentInfo: {},
    visible: false,
    deptID: "",
    pDeptID: "",
    total: 0,
    page: 1,
    limit: 10,
    departmentsShow: [],
    selectDepart: {},
    treeData: [],
    modify: false,
    add: false,
    CanEdit: false,
  };
  componentWillMount() {
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
    let treeData = [];
    let data = { deptID: "root" };
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
              if (item.cMaxID > 0) {
                departmentInfoItem.isLeaf = false;
              } else {
                departmentInfoItem.isLeaf = true;
              }
              treeData.push(departmentInfoItem);
            }
            let selectOrder = treeData.length + 1;
            let selectDepart = { ID: 'root', pDeptID: 'root' };
            treeData = _.sortBy(treeData, 'deptOrder');
            that.setState({ CanEdit: false, selectDepart, departmentInfo: res.result.data, treeData, departmentsShow: treeData, total: treeData.length });
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }

  rowSelection = {
    type: 'radio',
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      let item = selectedRows[0];
      let key = item.key;
      let pDeptID = "";
      let CanEdit;

      let arr = key[0].split("_");
      //保留
      // console.log('=======rowSelection arr',arr)
      if (key === 'root') {
        CanEdit = false;
      } else {
        CanEdit = true;
      }
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
      let selectDepart = { pDeptID, deptID: key, deptName: item.title, deptDesc: item.desc, deptOrder: item.deptOrder };
      this.setState({ selectDepart, CanEdit });
    }
  };
  onSelect = (keys, event) => {
    let that = this;
    let { selectDepart, CanEdit } = this.state;
    let selectItem;
    let pDeptID = "";
    if (keys.length > 0) {
      selectItem = event.selectedNodes[0].props;
      let arr = keys[0].split("_");
      console.log('========arr select', arr);
      if (arr[0] === 'root') {
        CanEdit = false;
      } else {
        CanEdit = true;
      }
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
      CanEdit = false;
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
            let departmentInfo;
            // if (deptID === "root") {
            //   departmentInfo = [res.result.data];
            // } else {
            departmentInfo = res.result.data.cDepartments;
            // }
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
            if (selectItem.ID) {
              selectDepart = { pDeptID: selectItem.ID, deptID: 'root', deptDesc: null, deptOrder: null }

            } else {
              selectDepart = { deptName: selectItem.title, deptID: keys[0], pDeptID, deptDesc: selectItem.desc, deptOrder: selectItem.deptOrder }
            }
            departmentsShow = _.sortBy(departmentsShow, 'deptOrder');
            that.setState({ CanEdit, deptID: keys[0], pDeptID, departmentsShow, selectDepart, total: departmentsShow.length });
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }
  showLoadData = (departmentsShow) => {
    new Promise(resolve => {
      setTimeout(() => {
        treeNode.props.dataRef.children = departmentsShow;
        this.setState({
          treeData: [...this.state.treeData],
          departmentsShow
        });
        resolve();
      });
    })
  }
  getDepartmentByRootID = (that) => {
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
    let deptID = "root";
    let data = { deptID: "root" };
    axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
      .then(res => {
        if (res.status === "OK") {
          if (res.result.error) {
            message.error(res.result.error.message);
          } else {
            let departmentInfo;
            if (deptID === "root") {
              departmentInfo = [res.result.data];
            } else {
              departmentInfo = res.result.data.cDepartments;
            }
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
            departmentsShow = _.sortBy(departmentsShow, 'deptOrder');

            that.setState({ CanEdit: false, treeData: departmentsShow, departmentsShow, total: departmentsShow.length });
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }
  getDepartmentByID = (keys, pDeptID, that) => {
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
    let deptID = keys;
    let data = { deptID: keys };
    axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
      .then(res => {
        if (res.status === "OK") {
          if (res.result.error) {
            message.error(res.result.error.message);
          } else {
            let departmentInfo;
            let CanEdit;
            if (deptID === "root") {
              departmentInfo = [res.result.data];
              CanEdit = false;
            } else {
              departmentInfo = res.result.data.cDepartments;
              CanEdit = true;
            }
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
            departmentsShow = _.sortBy(departmentsShow, 'deptOrder');
            that.setState({ CanEdit, deptID: keys[0], pDeptID, departmentsShow, total: departmentsShow.length });
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }
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


  add = () => {
    this.setState({
      add: true,
    });
  };
  onExpand = (expandedKeys, treeNode) => {
    let a = treeNode;
    this.setState({
      expandedKeys,
    });
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
    if (expandedKeys.length > 0) {
      let departmentsShow = [];
      let deptID = expandedKeys[expandedKeys.length - 1];
      let data = { deptID };
      axios.get('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
        .then(res => {
          if (res.status === "OK") {
            if (res.result.error) {
              message.error(res.result.error.message);
            } else {
              let departmentInfo;
              // if (deptID === "root") {
              //   departmentInfo = [res.result.data];
              // } else {
              departmentInfo = res.result.data.cDepartments;
              // }
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
                treeNode.node.props.dataRef.children = departmentsShow;
                that.setState({
                  treeData: [...this.state.treeData],
                  departmentsShow
                });
              });
            }
          } else if (res.status === "ERROR") {
            message.error(res.error.message);
          }
        }).catch(error => {
          message.error(error);
          return push('/login');
        })
    }

  };
  handleSubmitAdd = (e) => {
    let that = this;
    let { selectDepart, departmentsShow } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { deptName, deptDesc } = values;
        console.log('=======departmentsShow', departmentsShow)
        console.log('=======deptName', deptName)
        if (!deptName) return message.error('部门名称不能为空');
        let objSameTitle = _.first(_.where(departmentsShow, { title: deptName }));
        if (objSameTitle) {
          return message.error('已存在此部门');
        }

        let pDeptID;
        if (selectDepart.ID) {
          pDeptID = selectDepart.ID;
        } else {
          if (selectDepart.deptID) {
            pDeptID = selectDepart.deptID;
          }
        }
        if (!pDeptID) return message.error("上级部门不存在");
        if (!deptName) return message.error("部门名称不能为空");
        let data = { pDeptID, deptName, deptDesc, deptOrder: 0 };
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
          companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
          message.error("请先登录");
          return push('/login');
        }
        axios.post('/rtc/api/account/dept', data, { headers: { "accesstoken": account.accountToken } })
          .then(res => {
            if (res.status === "OK") {
              message.success('添加成功');
              (async () => {
                await that.getDepartmentByRootID(that);
                await that.setState({ add: false });
              })()
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
  hideAdd = () => {
    this.setState({
      add: false,
    });
  };

  modify = () => {
    let that = this;
    let { selectDepart } = this.state;
    if (selectDepart.ID) {
      return message.error('请先选中一个部门');
    } else {
      that.setState({ modify: true });
    }
  };
  handleSubmitEdit = (e) => {
    let that = this;
    let { selectDepart } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { deptName, deptDesc } = values;
        if (!deptName) return message.error('部门名称不能为空');
        let deptID;
        let pDeptID;
        if (selectDepart.ID) {
          return message.error('请先选中一个部门');
        } else {
          if (selectDepart.deptID) {
            pDeptID = selectDepart.pDeptID;
            deptID = selectDepart.deptID;
          }
        }
        if (!deptID) return message.error("部门不存在");
        if (!deptName) return message.error("部门名称不能为空");
        let data = { deptID, deptName, deptDesc, deptOrder: 0 };
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
          companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
          message.error("请先登录");
          return push('/login');
        }
        axios.patch('/rtc/api/account/dept', data, { headers: { "accesstoken": account.accountToken } })
          .then(res => {
            if (res.status === "OK") {
              message.success('修改成功');
              (async () => {
                await that.getDepartmentByID(selectDepart.deptID, pDeptID, that);
                await that.setState({ modify: false });
              })()
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
  hideModify = () => {
    this.setState({
      modify: false,
    });
  };
  delete = e => {
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
    let { selectDepart } = that.state;
    let deptID;
    let pDeptID;
    if (selectDepart.ID) {
      return message.error('请先选中一个部门');
    } else {
      if (selectDepart.deptID) {
        deptID = selectDepart.deptID;
      }
      if (selectDepart.pDeptID) {
        pDeptID = selectDepart.pDeptID;
      }
    }
    confirm({
      title: '确认删除当前部门?',
      okText: '确认',
      cancelText: '取消',
      onOk() {

        if (!deptID) return message.error('当前部门不存在');
        if (!pDeptID) return message.error('当前部门不存在');
        let data = { pDeptID, deptID };
        axios.delete('/rtc/api/account/dept', { params: data, headers: { "accesstoken": account.accountToken } })
          .then(res => {
            if (res.status === "OK") {
              if (res.result.error) {
                message.error(res.result.error.message);
              } else {
                (async () => {
                  await message.success('删除成功');
                  await that.getDepartmentByRootID(that);
                })()
              }
            } else if (res.status === "ERROR") {
              message.error(res.error.message);
            }
          }).catch(error => {
            message.error(error);
            return push('/login');
          })
      }
    });
  }
  up = (e) => {
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
    let { selectDepart } = this.state;
    let deptID;
    let pDeptID;
    if (selectDepart.ID) {
      return message.error('请先选中一个部门');
    } else {
      if (selectDepart.deptID) {
        deptID = selectDepart.deptID;
      }
      if (selectDepart.pDeptID) {
        pDeptID = selectDepart.pDeptID;
      }
    }
    if (!deptID) return message.error('当前部门不存在');
    if (!pDeptID) return message.error('当前部门不存在');
    let data = { pDeptID, deptID, operate: "up" };
    axios.patch('/rtc/api/account/deptOrder', data, { headers: { "accesstoken": account.accountToken } })
      .then(res => {
        if (res.status === "OK") {
          if (res.result.error) {
            message.error(res.result.error.message);
          } else {
            message.success('操作成功');
            that.getDepartmentByRootID(that);
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }
  down = (e) => {
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
    let { selectDepart } = this.state;
    let deptID;
    let pDeptID;
    if (selectDepart.ID) {
      return message.error('请先选中一个部门');
    } else {
      if (selectDepart.deptID) {
        deptID = selectDepart.deptID;
      }
      if (selectDepart.pDeptID) {
        pDeptID = selectDepart.pDeptID;
      }
    }
    if (!deptID) return message.error('当前部门不存在');
    if (!pDeptID) return message.error('当前部门不存在');
    let data = { pDeptID, deptID, operate: "down" };
    axios.patch('/rtc/api/account/deptOrder', data, { headers: { "accesstoken": account.accountToken } })
      .then(res => {
        if (res.status === "OK") {
          if (res.result.error) {
            message.error(res.result.error.message);
          } else {
            message.success('操作成功');
            that.getDepartmentByRootID(that);
          }
        } else if (res.status === "ERROR") {
          message.error(res.error.message);
        }
      }).catch(error => {
        message.error(error);
        return push('/login');
      })
  }
  checkDeptName(rule, value, callback) {
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
        callback(global.deptName.writtenWords)
    }else {
        callback();
    }
  }
  checkDeptDesc(rule, value, callback) {
    var len = 0;
    for (var i = 0; i < value.length; i++) {
        var a = value.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null){
            len += 2;
        }else{
            len += 1;
        }
    }
    if(len > 256){
        callback(global.deptDesc.writtenWords)
    }else {
        callback();
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let { CanEdit, treeData, departmentsShow, page, limit, total, add, modify, selectDepart } = this.state;
    return (
      <div style={{ padding: '0 30px', overflow: 'hidden' }}>
        {add &&
          <Modal
            title="添加部门"
            visible={this.state.add}
            onOk={this.handleSubmitAdd}
            onCancel={this.hideAdd}
            okText="确认"
            cancelText="取消"
          >
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
              <Form.Item label="部门名称">
                {getFieldDecorator('deptName', {
                  rules: [{ required: true, message: '请输入部门名称' },{ validator: (rule, value, callback) => { this.checkDeptName(rule, value, callback) } }], validateTrigger: 'onBlur',
                })(<Input placeholder="请输入部门名称"/>)}
              </Form.Item>
              <Form.Item label="简介">
                {getFieldDecorator('deptDesc', {
                  rules: [{ validator: (rule, value, callback) => { this.checkDeptDesc(rule, value, callback) } }], validateTrigger: 'onBlur',
                })(<Input placeholder="请输入部门简介"/>)}
              </Form.Item>
            </Form>
          </Modal>
        }
        {modify &&
          <Modal
            title="修改部门"
            visible={this.state.modify}
            onOk={this.handleSubmitEdit}
            onCancel={this.hideModify}
            okText="确认"
            cancelText="取消"
          >
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
              <Form.Item label="部门名称">
                {getFieldDecorator('deptName', {
                  initialValue: selectDepart.deptName,
                  rules: [{ required: true, message: '请输入部门名称!' },{ validator: (rule, value, callback) => { this.checkDeptName(rule, value, callback) } }], validateTrigger: 'onBlur',
                })(<Input />)}
              </Form.Item>
              <Form.Item label="简介">
                {getFieldDecorator('deptDesc', {
                  rules: [{ validator: (rule, value, callback) => { this.checkDeptDesc(rule, value, callback) } }], validateTrigger: 'onBlur',
                })(<Input />)}
              </Form.Item>
            </Form>
          </Modal>
        }
        <div style={{ display: 'flex', whiteSpace: 'nowrap', paddingTop: '30px' }}>
          <div style={{ textAlign: 'center', width: '25%' }}>
            <div style={{ textAlign: 'center', width: '100%', height: '40px', lineHeight: '40px', background: '#eaeaea', marginBottom: '2px' }}>
              部门导航
            </div>
            <div style={{ width: '100%', height: '60vh', border: '2px solid #eaeaea', borderRadius: '4px', overflowY: 'auto' }}>
              <Tree onExpand={this.onExpand} onSelect={this.onSelect} loadData={this.onLoadData}>{this.renderTreeNodes(this.state.treeData)}</Tree>
            </div>
          </div>

          <div style={{ paddingLeft: '30px', width: '100%' }}>
            {!selectDepart.ID ?
              <Button type="primary" style={{ margin: '0 10px' }} onClick={this.add}>添加</Button>
              :
              <Button type="primary" style={{ margin: '0 10px' }} disabled>添加</Button>
            }
            {!selectDepart.ID ?
              <Button type="primary" style={{ margin: '0 10px' }} onClick={this.modify}>修改</Button>
              :
              <Button type="primary" style={{ margin: '0 10px' }} disabled>修改</Button>
            }
            {CanEdit ?
              <Button type="primary" style={{ margin: '0 10px' }} onClick={this.delete}>删除</Button>
              :
              <Button type="primary" style={{ margin: '0 10px' }} disabled>删除</Button>
            }
            {CanEdit ?
              <Button type="primary" style={{ margin: '0 10px' }} onClick={this.up}>上移</Button>
              :
              <Button type="primary" style={{ margin: '0 10px' }} disabled>上移</Button>
            }
            {CanEdit ?
              <Button type="primary" style={{ margin: '0 10px' }} onClick={this.down}>下移</Button>
              :
              <Button type="primary" style={{ margin: '0 10px' }} disabled>下移</Button>
            }
            <div style={{ textAlign: 'center', width: '100%', height: '40px', lineHeight: '40px', background: '#eaeaea', margin: '5px 0 0 0' }}>
              部门管理
            </div>
            <Table rowSelection={this.rowSelection} columns={columns} dataSource={departmentsShow} style={{ paddingTop: '10px' }} pagination={{ defaultPageSize: limit, total }} />
          </div>
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    account: state.account
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Framework));

// export default Form.create()(Framework);

