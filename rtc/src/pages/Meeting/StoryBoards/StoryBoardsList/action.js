import * as ActionType from './actionType';

export const removeStoryBoard = (data) => {
    console.log('====type',data)
    return {
        type: ActionType.REMOVE_STORY_BOARD,
        stbId: data.stbId
    }
}