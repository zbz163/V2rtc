import React, { Component } from 'react'
import { Layout } from 'antd'
import { withRouter } from 'react-router-dom'
import menus from '../../config/menus'
import MenuCustom from './MenuCustom'

const { Sider } = Layout


class SiderCustom extends Component {
    state = {
        collapased: false,
        openKey: '',
        selectedKey: '',
        firstHide: true, 
    }

    componentDidMount() {
        this._setMenuOpen(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this._setCollapse(nextProps.collapased)
        this._setMenuOpen(nextProps)
    }

    _setMenuOpen = (props) => {
        const { pathname } = props.location
        this.setState({
            openKey: pathname.substr(0, pathname.lastIndexOf('/')),
            selectedKey: pathname,
        })
    }

    _setCollapse = (collapased) => {
        this.setState({
            collapased,
            firstHide: collapased
        })
    }

    handleMenuClick = e => {
        this.setState({
            selectedKey: e.key
        })
    }

    handleOpenMenu = e => {
        this.setState({
            openKey: e[e.length - 1],
            firstHide: false
        })
    }


    render() {
        return (
            <Sider theme='light' collapsed={this.props.collapsed} >
                <MenuCustom
                    menus={menus}
                    style={{ heigth: '100%' }}
                    mode="inline"
                    onClick={this.handleMenuClick}
                    selectedKeys={[this.state.selectedKey]}
                    openKeys={this.state.firstHide ? null : [this.state.openKey]}
                    onOpenChange={this.handleOpenMenu}
                />
            </Sider>
        )
    }
}



export default withRouter(SiderCustom);





// class SiderCustom extends Component {
//     state = {
//         collapsed: false,
//         menuList: [],
//         defaultOpenKeys: [],       // 默认展开
//         defaultSelectedKeys: ['/'],   // 默认选中
//     }

//     componentWillMount() {
//         console.log(this.props.location.pathname)
//         this.setState({
//             defaultSelectedKeys: this.props.location.pathname
//         })
//     }

//     componentDidMount() {
//         console.log(this.props.location.pathname)
//         const menuList = this.setMenu(menus);
//         this.setState({
//             menuList,
//         });
//     }

//     setMenu = (menu, pItem) => {
//         return menu.map((item) => {
//             if (item.children) {
//                 return (
//                     <SubMenu key={item.key}
//                         title={<span><Icon type={item.icon} /><span>{item.title}</span></span>}>
//                         {this.setMenu(item.children, item)}
//                     </SubMenu>
//                 )
//             }
//             return (
//                 <Menu.Item title={item.title} key={item.key} pitem={pItem}>
//                     <NavLink to={item.key} >
//                         {item.icon && <Icon type={item.icon} />}
//                         <span>{item.title}</span>
//                     </NavLink>
//                 </Menu.Item>
//             )
//         });
//     };

//     onCollapse = collapsed => {
//         this.setState({ collapsed });
//     };

//     render() {
//         return (
//             <Sider theme="light" collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
//                 <Menu 
//                     theme="light"
//                     defaultOpenKeys={this.state.defaultOpenKeys}
//                     defaultSelectedKeys={this.state.defaultSelectedKeys}
//                     mode="inline">
//                     {this.state.menuList}
//                 </Menu>
//             </Sider>
//         );
//     }
// }