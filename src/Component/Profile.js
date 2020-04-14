import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirestore, myStorage} from './../Config/MyFirebase'
import images from './Images'
import './styles.css'
import {AppString} from './Const'

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            id: localStorage.getItem(AppString.ID),
            username: localStorage.getItem(AppString.USERNAME),
            aboutMe: localStorage.getItem(AppString.ABOUT_ME),
            photoUrl: localStorage.getItem(AppString.PHOTO_URL),
            email: localStorage.getItem(AppString.EMAIL)
        }
        this.newAvatar = null
        this.newPhotoUrl = ''
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.props.history.push('/')
        }
    }

    onChangeusername = e => {
        this.setState({username: e.target.value})
    }

    onChangeAboutMe = e => {
        this.setState({aboutMe: e.target.value})
    }

    onChangeAvatar = e => {
        if (e.target.files && e.target.files[0]) {
            // Check this file is an image?
            const prefixFiletype = e.target.files[0].type.toString()
            if (prefixFiletype.indexOf(AppString.PREFIX_IMAGE) !== 0) {
                this.props.showToast(0, 'This file is not an image')
                return
            }
            this.newAvatar = e.target.files[0]
            this.setState({photoUrl: URL.createObjectURL(e.target.files[0])})
        } else {
            this.props.showToast(0, 'Something wrong with input file')
        }
    }

    uploadAvatar = () => {
        this.setState({isLoading: true})
        if (this.newAvatar) {
            const uploadTask = myStorage
                .ref()
                .child(this.state.id)
                .put(this.newAvatar)
            uploadTask.on(
                AppString.UPLOAD_CHANGED,
                null,
                err => {
                    this.props.showToast(0, err.message)
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        this.updateUserInfo(true, downloadURL)
                    })
                }
            )
        } else {
            this.updateUserInfo(false, null)
        }
    }

    updateUserInfo = (isUpdatePhotoUrl, downloadURL) => {
        let newInfo
        if (isUpdatePhotoUrl) {
            newInfo = {
                username: this.state.username,
                aboutMe: this.state.aboutMe,
                photoUrl: downloadURL
            }
        } else {
            newInfo = {
                username: this.state.username,
                aboutMe: this.state.aboutMe
            }
        }
        myFirestore
            .collection(AppString.NODE_USERS)
            .doc(this.state.id)
            .update(newInfo)
            .then(data => {
                localStorage.setItem(AppString.USERNAME, this.state.username)
                localStorage.setItem(AppString.ABOUT_ME, this.state.aboutMe)
                if (isUpdatePhotoUrl) {
                    localStorage.setItem(AppString.PHOTO_URL, downloadURL)
                }
                this.setState({isLoading: false})
                this.props.showToast(1, 'Successfully updated info!')
                this.props.history.push('/main')
            })
    }

    render() {
        return (
            <div className="root">
                <div className="header">
                    <span>PROFILE</span>
                </div>

                <img className="avatar" alt="Avatar" src={this.state.photoUrl}/>

                <div className="viewWrapInputFile">
                    <img
                        className="imgInputFile"
                        alt="icon gallery"
                        src={images.ic_input_file}
                        onClick={() => this.refInput.click()}
                    />
                    <input
                        ref={el => {
                            this.refInput = el
                        }}
                        accept="image/*"
                        className="viewInputFile"
                        type="file"
                        onChange={this.onChangeAvatar}
                    />
                </div>

                <span className="textLabel">Username:</span>
                <input
                    className="textInput"
                    value={this.state.username ? this.state.username : ''}
                    placeholder="Your username..."
                    onChange={this.onChangeusername}
                />
                <span className="textLabel">About me:</span>
                <input
                    className="textInput"
                    value={this.state.aboutMe ? this.state.aboutMe : ''}
                    placeholder="Tell about yourself..."
                    onChange={this.onChangeAboutMe}
                />
                <span className="textLabel">Login Email:</span>
                 <input
                    className="textInput"
                    input={this.state.email ? this.state.email : ''}
                    disabled={true}
                />

                <button className="btnUpdate" onClick={this.uploadAvatar}>
                    UPDATE
                </button>

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

export default withRouter(Profile)
