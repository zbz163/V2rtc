import { LocalStorage } from "node-localstorage";

const userAccount = "userName@companyAccount";
const userPwd = "userPassword";
const nickName = "userNick";
const roomID = "currentRoomID";
const userAccountpwd = "userAccountpwd";
const username = "username";
const newMeetingName = "malong";
const meetingTime = "meetingTime";
const MeetingPin = "MeetingPin";
const LiveID = "LiveID";
const UserID = "UserID";
const AnonymousUserID = "AnonymousUserID";
const LogID = "LogID";
const AccountUserInfo="AccountUserInfo";
const MeetingInfo = "MeetingInfo";
const AnonymousUserName = "anonymousUserName";
const CompanyInfo = "CompanyInfo";
const RoomNormalPwd = "roomNormalPwd";
const LeaveMeetingTime = "LeaveMeetingTime";
export function SetLeaveMeetingTime(leaveMeetingTime) {
    SetItem(LeaveMeetingTime, leaveMeetingTime);
}
export function GetLeaveMeetingTime () {
    return GetItem(LeaveMeetingTime);
}
export function SetRoomNormalPwd(roomNormalPwd) {
    SetItem(RoomNormalPwd, roomNormalPwd);
}
export function GetRoomNormalPwd () {
    return GetItem(RoomNormalPwd);
}
export function SetCompanyInfo(companyInfo) {
    SetItem(CompanyInfo, companyInfo);
}
export function GetCompanyInfo () {
    return GetItem(CompanyInfo);
}
export function SetAnonymousUserName(anonymousUserName) {
    SetItem(AnonymousUserName, anonymousUserName);
}
export function GetAnonymousUserName () {
    return GetItem(AnonymousUserName);
}
export function SetMeetingInfo(meetingInfo) {
    SetItem(MeetingInfo, meetingInfo);
}
export function GetMeetingInfo () {
    return GetItem(MeetingInfo);
}

export function SetAccountUserInfo(accountUserInfo) {
    SetItem(AccountUserInfo, accountUserInfo);
}
export function GetAccountUserInfo () {
    return GetItem(AccountUserInfo);
}
export function SetLogID(logID) {
    SetItem(LogID, logID);
}
export function GetLogID () {
    return GetItem(LogID);
}
export function SetAnonymousUserID(anonymousUserID) {
    SetItem(AnonymousUserID, anonymousUserID);
}
export function GetAnonymousUserID () {
    return GetItem(AnonymousUserID);
}
export function SetUserID(userID) {
    SetItem(UserID, userID);
}
export function GetUserID () {
    return GetItem(UserID);
}
export function SetMeetingPin(pin) {
    SetItem(MeetingPin, pin);
}
export function GetMeetingPin () {
    return GetItem(MeetingPin);
}
export function SetLiveID(liveID) {
    SetItem(LiveID, liveID);
}
export function GetLiveID () {
    return GetItem(LiveID);
}
export function SetUserAccount (account) {
    SetItem(userAccount, account);
}
export function GetUserAccount () {
    return GetItem(userAccount);
}
export function SetNewMeetingName (meetingName) {
    SetItem(newMeetingName, meetingName);
}
export function GetNewMeetingName () {
    return GetItem(newMeetingName);
}
export function SetMeetingTime (time) {
    SetItem(meetingTime, time);
}
export function GetMeetingTime () {
    return GetItem(meetingTime);
}
export function SetUserAccountPwd (pwd) {
    SetItem(userAccountpwd, pwd);
}
export function GetUserAccountPwd () {
    return GetItem(userAccountpwd);
}
export function SetUserName (account) {
    SetItem(username, account);
}
export function GetUserName () {
    return GetItem(username);
}
export function SetUserPwd (pwd) {
    SetItem(userPwd, pwd);
}
export function GetUserPwd () {
    return GetItem(userPwd);
}

export function SetNickName (nick) {
    SetItem(nickName, nick);
}
export function GetNickName () {
    return GetItem(nickName);
}


export function SetUserRoomID (id) {
    SetItem(roomID, id);
}
export function GetUserRoomID () {
    return GetItem(roomID);
}

export function clearData() {
    localStorage.clear();
}


function GetItem (key) {
    if (localStorage){
        return localStorage.getItem(key);
    } else {
        console.error("myStorage. getItem error. localStorage not init.");
        return "";
    }
}
function SetItem (key, value){
    if (localStorage) {
        localStorage.setItem(key, value);
    } else {
        console.error("myStorage. SetItem error. localStorage not init.");
    }
}