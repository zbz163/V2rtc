import * as types from './actionType';

export default (state = [], action) => {
    switch (action.type) {
        case types.TRANSLATOR_RESPONSE: {
            console.log('====TRANSLATOR_RESPONSE', action)
            return [
                ...state,
                {
                    _id: action.data._id,
                    translations: action.data.translations
                }
            ]
        }
        default: {
            return state;
        }
    }
}