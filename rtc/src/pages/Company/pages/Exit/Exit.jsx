import React, { Component } from 'react'
import { Form, Button, message } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';

class Exit extends Component {
    constructor(props, context) {
        super(props, context);
        this.exit = this.exit.bind(this);
    }
    exit() {
        let that = this;
        axios.get('/rtc/api/account/logout')
            .then(res => {
                if (res.status === "OK") {
                    // that.props.history.push('/login');
                    let history = that.props;
                    console.log('====let history = that.props;',history)
                    history.push('/')
                }
            }).catch(error => {
                console.log('error layout', error)
                message.error('layout');
            })
    }
    render() {
        return (
            <div>
                <button onClick={this.exit}>退出</button>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('*******account exit', state)
    return {
        account: state.account
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        // login: (data) => {
        //     var action = actions.login(data);
        //     dispatch(action);
        // },
        // connect: (data) => {
        //     var action = actions.connect(data);
        //     dispatch(action);
        // }
    }
}

export default connect(mapStateToProps, null)(Form.create()(Exit));