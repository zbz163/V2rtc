import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actions from './action.js';


class SendChat extends Component {
    constructor(props, context){
        super(props, context);
        this.onInputChange = this.onInputChange.bind(this);
        this.sendMessage_S = this.sendMessage_S.bind(this);
        this.state = {
            value : ''
        }
    }
    componentDidMount(){
        document.addEventListener("keydown", this.onKeyDown)
    }
    onKeyDown = (e) => {
        if(e.keyCode == 13){
            this.sendMessage_S();
        }
      }
    sendMessage_S(event){
        
        const inputValue = this.state.value;
        const {participant} = this.props;
        if(!inputValue.trim()){
            return;
        }
        let name = '';
        let realName = "";
        if(this.props.participant && this.props.participant.name){
            name = this.props.participant.name;
            let nameArr = name.split('@^@');
            realName = nameArr[0];
        }
        if(!realName){
            return;
        }
        let id = participant.id
        this.props.sendMessage_S({id,name:realName,message:inputValue});
        this.setState({value : ''});
    }


    onInputChange(event){
        this.setState({
            value: event.target.value
        });
    }

    render(){
        return (
            <div className="comment_input">
            <input onChange={this.onInputChange} value={this.state.value} type="text" placeholder="在此输入信息"/>
            <img onClick={this.sendMessage_S}  src={require('../../../images/enter.png')} alt=""/>
        </div>
        )
        
    }
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        sendMessage_S : (data)=> {
            var action = actions.sendMessage(data);
            dispatch(action);
        }
    }
}
const mapStateToProps = (state) => {
    return {
        participant:state.teevid.meeting.participant
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendChat);