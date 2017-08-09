import { Document, model, Model, Schema } from 'mongoose';

export var CommentSchema: Schema = new Schema({
    sourceid: String,
    title: String,
    url: String,
    ttime: Number,
    metadata: String,
    comments: [{
        apptype: Number,
        attachment: Array,
        channelid: Number,
        channeltype: Number,
        cmtid: String,
        content: String,
        ctime: Number,
        from: Number,
        ip: String,
        opcount: Number,
        referid: String,
        replyid: String,
        score: Number,
        spcount: Number,
        status: Number,
        user: {
            nickname: String,
            sohuPlusId: Number,
            usericon: String
        },
        useragent: String
    }]
}, { timestamps: true });
// 设置timestamps选项会自动创建createdAt和updatedAt两个属性
export interface IComment extends Document {
    sourceid: string,
    title: string,
    url: string,
    ttime: number,
    metadata: string,
    comments: [{
        apptype: number,
        attachment: any[],
        channelid: number,
        channeltype: number,
        cmtid: string,
        content: string,
        ctime: number,
        from: number,
        ip: string,
        opcount: number,
        referid: string,
        replyid: string,
        score: number,
        spcount: number,
        status: number,
        user: {
            nickname: string,
            sohuPlusId: number,
            usericon: string
        },
        useragent: string
    }]
    createdAt: Date;
    updatedAt: Date;
}
var CommentModel: Model<IComment> = model<IComment>('Comment', CommentSchema);

export default CommentModel;

// {
//     "title":"123",                      //文章标题
//     "url":"http://localhost/?p=9",      //文章url
//     "ttime":1401327899094,      //文章创建时间
//     "sourceid":"9",                     //文章Id
//     "parentid":"0",                     //文章所属专辑的ID,多个的话以,号分隔
//     "categoryid":"",                    //文章所属频道ID（可留空）
//     "ownerid":"",                       //文章发布者ID（可留空）
//     "metadata":"",                      //文章其他信息（可留空）
//     "comments":[
//         {
//             "cmtid":"358",                                  //评论唯一ID
//             "ctime":1401327899094,                          //评论时间
//             "content":"2013年8月1日18:36:29 O(∩_∩)O~",      //评论内容        
//             "replyid":"0",                                  //回复的评论ID，没有为0
//             "user":{
//                 "userid":"1",                               //发布者ID
//                 "nickname":"admin",                         //发布者昵称
//                 "usericon":"",                              //发布者头像（留空使用默认头像）
//                 "userurl":"",                                //发布者主页地址（可留空）
//                 "usermetadata":{                            //其它用户相关信息，例如性别，头衔等数据
//                     "area": "北京市",
//                     "gender": "1",
//                     "kk": "",
//                     "level": 1
//                 }
//             },
//             "ip":"127.0.0.1",                                                                       //发布ip
//             "useragent":"Mozilla/5.0 (Windows NT 6.1; rv:22.0) Gecko/20100101 Firefox/22.0",        //浏览器信息
//             "channeltype":"1",                                      //1为评论框直接发表的评论，2为第三方回流的评论
//             "from":"",                                                                              //评论来源
//             "spcount":"",                                                                           //评论被顶次数
//             "opcount":"",                                                                           //评论被踩次数
//             "attachment":[                                          //附件列表
//                 {
//                     "type":1，                                        //1为图片、2为语音、3为视频
//                     "desc":""，                                      //描述，
//                     "url":"http://img.sohu.itc/xxxx"               //附件地址
//                 }
//             ]
//         }
//     ]
// }