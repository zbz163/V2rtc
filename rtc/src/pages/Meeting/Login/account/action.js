import * as ActionType from './actionType';
export const loginAccount = (data) => {
    return {
        type: ActionType.LOGIN_ACCOUNT,
        accountToken:data.accountToken,
        accountInfo:data.accountInfo
    }
}
export const loginUser = (data) => {
    return {
        type: ActionType.LOGIN_USER,
        accessToken:data.accessToken,
        userInfo:data.userInfo,
        companyName:data.companyName,
        companyLogoUrl:data.companyLogoUrl,
    }
}
export const login = (data) => {
    return {
        type: ActionType.LOGIN,
        name: data.name,
        password: data.password
    }
}