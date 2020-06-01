import * as ActionType from './actionType';

export const sendMessage = (data) => {
    const currTimer = new Date().toUTCString();
    return {
        type: ActionType.SEND_MESSAGE,
        author: {
            id: data.id,
            name: data.name
        },
        message: data.message,
        time: currTimer
    }
}
export const translator = (data) => {
    return {
        type: ActionType.TRANSLATOR,
        from: data.from,
        to: data.to,
        text: data.text,
        _id: data._id
    }
}
