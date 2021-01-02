import firebase from 'firebase'
import React, { Component } from 'react'
import ReactLoading from 'react-loading'
import { withRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'  // For side success notificatiton
import { myFirebase, myFirestore } from './../Config/MyFirebase'
import './styles.css'
import { AppString } from './Const'
import GoogleButton from 'react-google-button'

class Login extends Component {
    constructor(props) {
        super(props)
        this.provider = new firebase.auth.GoogleAuthProvider()
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (localStorage.getItem(AppString.ID)) {
            this.setState({ isLoading: false }, () => {
                this.setState({ isLoading: false })
                this.props.showToast(1, 'Login success') // For side success notificatiton
                this.props.history.push('/main')
            })
        } else {
            this.setState({ isLoading: false })
        }
    }

    onLoginPress = () => {
        this.setState({ isLoading: true })
        myFirebase
            .auth()
            .signInWithPopup(this.provider)
            .then(async result => {
                let user = result.user
                if (user) {
                    const result = await myFirestore
                        .collection(AppString.NODE_USERS)
                        .where(AppString.ID, '==', user.uid)
                        .get()

                    if (result.docs.length === 0) {
                        // Set new data since this is a new user
                        myFirestore
                            .collection('users')
                            .doc(user.uid)
                            .set({
                                id: user.uid,
                                nickname: user.displayName,
                                aboutMe: '',
                                photoUrl: user.photoURL,
                                email: user.email
                            })
                            .then(data => {
                                // Write user info to local
                                localStorage.setItem(AppString.ID, user.uid)
                                localStorage.setItem(AppString.USERNAME, user.displayName)
                                localStorage.setItem(AppString.PHOTO_URL, user.photoURL)
                                localStorage.setItem(AppString.EMAIL, user.email)
                                this.setState({ isLoading: false }, () => {
                                    this.props.showToast(1, 'Login success')
                                    this.props.history.push('/main')
                                })
                            })
                    } 
                    else {
                        // Write user info to local
                        localStorage.setItem(AppString.ID, result.docs[0].data().id)
                        localStorage.setItem(
                            AppString.USERNAME,
                            result.docs[0].data().username
                        )
                        localStorage.setItem(
                            AppString.PHOTO_URL,
                            result.docs[0].data().photoUrl
                        )
                        localStorage.setItem(
                            AppString.ABOUT_ME,
                            result.docs[0].data().aboutMe
                        )
                        localStorage.setItem(
                            AppString.EMAIL,
                            result.docs[0].data().email
                        )
                        this.setState({ isLoading: false }, () => {
                            this.props.showToast(1, 'Login success')
                            this.props.history.push('/main')
                        })
                    }
                } else {
                    this.props.showToast(0, 'User info not available')
                }
            })
            .catch(err => {
                this.props.showToast(0, err.message)
                this.setState({ isLoading: false })
            })
    }

    render() {
        return (
            <div className="viewRoot">
                <div className="header">AWESOME CHAT</div>
                <div className="login-body">Sign in with Google to continue!</div>
                <GoogleButton className="btnLogin"
                    onClick={this.onLoginPress}
                />

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
}

export default withRouter(Login)
