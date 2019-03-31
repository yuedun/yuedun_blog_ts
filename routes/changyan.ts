/**
 * Created by huopanpan on 2017/6/10.
 */
import * as Promise from 'bluebird';
import { Request } from 'express';
import { default as Comment, IComment as CommentInstance } from '../models/comment-model';
import { route } from '../utils/route';

export default class Routes {
    /**
     * 畅言评论同步到本地
     * @param params
     * @param callback
     */
    @route({
        method: "post",
        json: true
    })
    static changyanCallback(req: Request) {
        let commentObj: CommentInstance = JSON.parse(req.body.data);
        let comment = new Comment({
            sourceid: commentObj.sourceid,
            title: commentObj.title,
            url: commentObj.url,
            ttime: commentObj.ttime,
            metadata: commentObj.metadata,
            comments: [{
                apptype: commentObj.comments[0].apptype,
                attachment: commentObj.comments[0].attachment,
                channelid: commentObj.comments[0].channelid,
                channeltype: commentObj.comments[0].channeltype,
                cmtid: commentObj.comments[0].cmtid,
                content: commentObj.comments[0].content,
                ctime: commentObj.comments[0].ctime,
                from: commentObj.comments[0].from,
                ip: commentObj.comments[0].ip,
                opcount: commentObj.comments[0].opcount,
                referid: commentObj.comments[0].referid,
                replyid: commentObj.comments[0].replyid,
                score: commentObj.comments[0].score,
                spcount: commentObj.comments[0].spcount,
                status: commentObj.comments[0].status,
                user: {
                    nickname: commentObj.comments[0].user.nickname,
                    sohuPlusId: commentObj.comments[0].user.sohuPlusId,
                    usericon: commentObj.comments[0].user.usericon
                },
                useragent: commentObj.comments[0].useragent
            }]
        });
        return Promise.resolve(comment.save())
    };
}

