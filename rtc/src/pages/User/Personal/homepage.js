import React, { Component } from 'react';
import { Button, Modal, message } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import md5 from 'md5';
import './homepage.css';
import * as actions from './action.js';
import LoginNotice from '../LoginNotice/LoginNotice';
import Header from '../Header/Header';

import { storageUtils } from '../../../utils';

const { confirm } = Modal;


class CompanyUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        return (
            <div>
                <Header push={this.props.history.push} />
                <LoginNotice push={this.props.history.push} />
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

export default connect(mapStateToProps, mapDispatchToProps)(CompanyUser);

