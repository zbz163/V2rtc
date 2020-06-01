import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import StoryBoardsItem from './StoryBoardsItem';

const StoryBoards = ({storyboards}) => {
    var storyboardsList =[];
    if(storyboards.length > 0){
        storyboardsList = storyboards
    }
    return (
        <ul>
        {
            storyboardsList.map((item) => (
                <StoryBoardsItem
                    key    = {item._id}
                    title   = {item.title}
                    completed= {item.completed}
                    scenes   = {item.scenes}
                    thumbnail = {item.thumbnail}
                    _id     ={item._id}
                />
             ))
            }
        </ul>
    )
}

const mapStateToProps = (state) => {
    return {
        storyboards: state.teevid.api.storyboards
    };
  }

export default connect(mapStateToProps)(StoryBoards);