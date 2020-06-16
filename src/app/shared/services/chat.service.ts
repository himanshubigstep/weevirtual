import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Chatbox } from '../models/chatInbox';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatList: Observable<Chatbox[]>;
  private inboxCollection: AngularFirestoreCollection<Chatbox>;
  chatInboxes: Observable<Chatbox[]>;

  constructor(
    private firestore: AngularFirestore,
    private afs: AngularFirestore
  ) {
    this.inboxCollection = this.firestore.collection<Chatbox>('chatinbox');
    this.chatInboxes = this.inboxCollection.valueChanges();
  }

  // Add to Meeting Function

  addToMeeting(chat: Chatbox) {
    chat.id = this.afs.createId();
    const param = JSON.parse(JSON.stringify(chat));
    this.inboxCollection.doc(chat.id).set(param);
  }

  // Get webinar chat
  getWebinarChat(eventId) {
    return this.firestore.collection<Chatbox>('chatinbox', ref =>
      ref.where('eventId', '==', eventId)).valueChanges();
  }

  // Approve chat
  aproveChat(id) {
    return this.firestore
      .collection("chatinbox")
      .doc(id)
      .set({ isApproved: true, timeStamp: Date.now() }, { merge: true });
  }

}
