import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let ChatService = /** @class */ (() => {
    let ChatService = class ChatService {
        constructor(firestore, afs) {
            this.firestore = firestore;
            this.afs = afs;
            this.inboxCollection = this.firestore.collection('chatinbox');
            this.chatInboxes = this.inboxCollection.valueChanges();
        }
        // Add to Meeting Function
        addToMeeting(chat) {
            chat.id = this.afs.createId();
            const param = JSON.parse(JSON.stringify(chat));
            this.inboxCollection.doc(chat.id).set(param);
        }
        // Get webinar chat
        getWebinarChat(eventId) {
            return this.firestore.collection('chatinbox', ref => ref.where('eventId', '==', eventId)).valueChanges();
        }
        // Approve chat
        aproveChat(id) {
            return this.firestore
                .collection("chatinbox")
                .doc(id)
                .set({ isApproved: true, timeStamp: Date.now() }, { merge: true });
        }
    };
    ChatService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], ChatService);
    return ChatService;
})();
export { ChatService };
//# sourceMappingURL=chat.service.js.map