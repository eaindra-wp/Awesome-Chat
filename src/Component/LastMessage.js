
import React, { Component } from 'react'
import { AppString } from './Const'
import { myFirebase, myFirestore } from './../Config/MyFirebase'
class LastMessage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tempLastMsg: null,
            sender: null,
        }
        this.groupChatId = "";
        this.currentUserId = this.props.currentUserId;
        this.peerUserId = this.props.peerUserId;
        this.peerUserName =  this.props.peerUserName;
    }

    componentDidMount() {
        this.getGroupChatId();
        this.finallyGetLastMsg();
        this.getLastMsgSender();
    }

    hashString = str => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash += Math.pow(str.charCodeAt(i) * 31, str.length - i)
            hash = hash & hash // Convert to 32bit integer
        }
        return hash
    }

    getGroupChatId = () => {
        var groupChatId = null;
        // console.log(this.peerUserId);
        if (this.hashString(this.currentUserId) <= this.hashString(this.peerUserId)) {
            groupChatId = `${this.currentUserId}-${this.peerUserId}`;
        }
        else {
            groupChatId = `${this.peerUserId}-${this.currentUserId}`;
        }
        console.log(groupChatId);
        this.groupChatId = groupChatId;
    }

    checkListMessage = async () => {
        let listMessage = [];
        await myFirestore
            .collection(AppString.NODE_MESSAGES)
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .onSnapshot(
                snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === AppString.DOC_ADDED) {
                            // this.tempListMsgs.push(change.doc.data())
                            listMessage.push(change.doc.data())
                        }
                    })

                },
                err => {
                    this.props.showToast(0, err.toString())
                }
            );
        return listMessage;
    }
    printLastMsg = async () => {
        return await this.checkListMessage().then(function (result) {
            // console.log(result); // "initResolve"
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    // console.log(result[result.length - 1]);
                    let msgType = result[result.length - 1].type;
                    let str;
                    if (msgType === 0) {
                        str = result[result.length - 1].content;
                    }
                    else if (msgType === 1) {
                        str = "Sent an image";
                    }
                    else if (msgType === 2) {
                        str = "Sent a sticker";
                    }
                    resolve(str);
                }, 1000)
            })
        });
    }

    lastMsgSender = async () => {
        return await this.checkListMessage().then(function (result) {
            // console.log(result); // "initResolve"
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    let str = result[result.length - 1].idFrom;
                    resolve(str);
                }, 1000)
            })
        });
    }

    getLastMsgSender = async () => {
        let message = await this.lastMsgSender();
        console.log(message);
        let sender;
        if (message === this.currentUserId) {
            sender = "You";
        }
        else {
            sender = this.peerUserName;
        }
        this.setState({ sender: sender });
    }

    finallyGetLastMsg = async () => {
        let message = await this.printLastMsg();
        this.setState({ tempLastMsg: message });
    }
    render() {
        return (
            <span className="textItem">
                {`${this.state.sender} : ${this.state.tempLastMsg}`}
            </span>
        )
    }
}
export default LastMessage