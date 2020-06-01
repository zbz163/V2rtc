import Recharge from "../pages/Recharge/Recharge"
import Profile from "../pages/Profile/Profile"
import Orders from "../pages/Orders/Orders"
import Dosages from "../pages/Dosages/Dosages"
import Users from "../pages/Users/Users"
import Meetings from "../pages/Meetings/Meetings"
import Exit from '../pages/Exit/Exit'

const routers = [
    {
        path: '/company/profile',
        exact: true,
        title: '账户信息',
        component: Profile
    },
    {
        path: '/company/recharge',
        exact: true,
        title: '充值中心',
        component: Recharge
    },
    {
        path: '/company/orders',
        exact: true,
        title: '订单管理',
        component: Orders
    },
    {
        path: '/company/dosages',
        exact: true,
        title: '消费记录',
        component: Dosages
    },
    {
        path: '/company/users',
        exact: true,
        title: '用户管理',
        component: Users
    },
    {
        path: '/company/meetings',
        exact: true,
        title: '会议管理',
        component: Meetings
    },
    {
        path: '/company/exit',
        exact: true,
        title: '退出登陆',
        component: Exit
    },
]

export default routers;