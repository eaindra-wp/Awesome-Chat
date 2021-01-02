
import React, { Component } from 'react'
import { AppString } from './Const'
import { myFirebase, myFirestore } from './../Config/MyFirebase'
class LastMessage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tempLastMsg: null,
            // groupChatId: null,
        }
        this.groupChatId = this.props.groupChatId;
    }

    componentDidMount() {
        this.finallyGetLastMsg()
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
        // console.log(listMessage.length);
        return listMessage;
    }
    printLastMsg = async () => {
        return await this.checkListMessage().then(function (result) {
            // console.log(result); // "initResolve"
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(result[result.length - 1]);
                    let msgType = result[result.length - 1].type;
                    let str;
                    if(msgType === 0){
                        str = result[result.length - 1].content;
                    }
                    else if(msgType === 1){
                        str = "Sent an image";
                    }
                    else if(msgType === 2){
                        str = "Sent a sticker";
                    }
                    resolve(str);
                }, 1000)
            })
        });
        // this.setState({tempLastMsg: result});
    }

    finallyGetLastMsg = async () => {
        let message = await this.printLastMsg();
        // console.log(message);
        this.setState({ tempLastMsg: message });
    }
    render() {
        return (
            <span className="textItem">
                {`${this.state.tempLastMsg}`}
            </span>
        )
    }
}
export default LastMessage