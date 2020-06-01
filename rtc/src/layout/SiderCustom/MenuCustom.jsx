import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, Icon } from 'antd'

const { SubMenu } = Menu
const MenuItem = Menu.Item

const MenuItemCustom = ({ key, title, icon }) => (
    <MenuItem
        key={key}
    >
        <Link to={key}>
            {icon && <Icon type={icon} />}
            <span>{title}</span>
        </Link>
    </MenuItem>
)

const SubMenuCustom = ({ key, title, icon, children }) => (
    <SubMenu
        key={key}
        title={
            <span>
                {icon && <Icon type={icon} />}
                <span>{title}</span>
            </span>
        }
    >
        {children && children.map(item => MenuItemCustom(item))}
    </SubMenu>
)

export default ({ menus, ...props }) => (
    <Menu {...props}>
        {
            menus && menus.map(item => item.children && item.children.length ? SubMenuCustom(item) : MenuItemCustom(item))
        }
    </Menu>
)