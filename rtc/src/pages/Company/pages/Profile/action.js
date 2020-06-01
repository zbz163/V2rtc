import * as ActionType from './actionType';
export const loginAccount = (data) => {
    return {
        type: ActionType.LOGIN_ACCOUNT,
        accountToken:data.accountToken,
        accountInfo:data.accountInfo
    }
}