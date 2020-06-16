export class Chatbox {
    id:string;
    eventId:number;
    senderId:number;
    senderName:string;
    user_type:string;
    timeStamp:number;
    message:string;
    isSeen:Boolean=false; // currently not using 
    isApproved:Boolean=false;
    }