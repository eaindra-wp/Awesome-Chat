import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import {myFirebase, myFirestore} from './../Config/MyFirebase'
import images from './Images'
import './styles.css'
import ChatBoard from './ChatBoard'
import {AppString} from './Const'

class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null
        }
        this.currentUserId = localStorage.getItem(AppString.ID)
        this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL)
        this.currentUserUserName = localStorage.getItem(AppString.USERNAME)
        this.listUser = []
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.props.history.push('/')
            })
        } else {
            this.getListUser()
        }
    }

    getListUser = async () => {
        const result = await myFirestore.collection(AppString.NODE_USERS).get()
        if (result.docs.length > 0) {
            this.listUser = [...result.docs]
            this.setState({isLoading: false})
        }
    }

    onLogoutClick = () => {
        this.setState({
            isOpenDialogConfirmLogout: true
        })
    }

    doLogout = () => {
        this.setState({isLoading: true})
        myFirebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({isLoading: false}, () => {
                    localStorage.clear()
                    this.props.showToast(1, 'Logout success')
                    this.props.history.push('/')
                })
            })
            .catch(function (err) {
                this.setState({isLoading: false})
                this.props.showToast(0, err.message)
            })
    }

    hideDialogConfirmLogout = () => {
        this.setState({
            isOpenDialogConfirmLogout: false
        })
    }

    onProfileClick = () => {
        this.props.history.push('/profile')
    }

    renderListUser = () => {
        if (this.listUser.length > 0) {
            let viewListUser = []
            this.listUser.forEach((item, index) => {
                if (item.data().id !== this.currentUserId) {
                    viewListUser.push(
                        <button
                            key={index}
                            className={
                                this.state.currentPeerUser &&
                                this.state.currentPeerUser.id === item.data().id
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            onClick={() => {
                                this.setState({currentPeerUser: item.data()})
                            }}
                        >
                            <img
                                className="viewAvatarItem"
                                src={item.data().photoUrl}
                                alt="icon avatar"
                            />
                            <div className="viewWrapContentItem">
                <span className="textItem">{`${
                    item.data().username
                    }`}</span>
                                <span className="textItem">{`${
                                    item.data().id
                                    }`}</span>
                            </div>
                        </button>
                    )
                }
            })
            return viewListUser
        } else {
            return null
        }
    }

    render() {
        return (
            <div className="root">
                {/* Header */}
                <div className="header">
                    <span>Awesome Chat</span>
                    <img
                        className="icProfile"
                        alt="An icon default avatar"
                        src={images.ic_default_avatar}
                        onClick={this.onProfileClick}
                    />
                    <img
                        className="icLogout"
                        alt="An icon logout"
                        src={images.ic_logout}
                        onClick={this.onLogoutClick}
                    />
                </div>

                {/* Body */}
                <div className="body">
                    <div className="viewListUser"> {this.renderListUser()}</div>
                    <div className="viewBoard">
                        {this.state.currentPeerUser ? (
                            <ChatBoard
                                currentPeerUser={this.state.currentPeerUser}
                                showToast={this.props.showToast}
                            />
                        ) : (
                            <div className="viewWelcomeBoard">
                            <span className="textTitleWelcome">{`Welcome, ${
                                this.currentUserUserName
                                }`}</span>
                            <img
                                className="avatarWelcome"
                                src={this.currentUserAvatar}
                                alt={this.currentUserUserName}
                            />
                            <span className="textDesciptionWelcome">
                                Let's start chatting with your friends!
                            </span>
                        </div>
                        )}
                    </div>
                </div>

                {/* Dialog confirm */}
                {this.state.isOpenDialogConfirmLogout ? (
                    <div className="viewCoverScreen">
                        {this.renderDialogConfirmLogout()}
                    </div>
                ) : null}

                {/* Loading */}
                {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }

    renderDialogConfirmLogout = () => {
        return (
            <div>
                <div className="viewWrapTextDialogConfirmLogout">
                    <span className="titleDialogConfirmLogout">Are you sure to logout?</span>
                </div>
                <div className="viewWrapButtonDialogConfirmLogout">
                    <button className="btnYes" onClick={this.doLogout}>
                        YES
                    </button>
                    <button className="btnNo" onClick={this.hideDialogConfirmLogout}>
                        CANCEL
                    </button>
                </div>
            </div>
        )
    }
}

export default withRouter(Main)
