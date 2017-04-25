exports.mongodb = {
    cookieSecret: 'node-demo',
    db: 'blogs',
    port: '8908',
    uid: 'admin' || process.env.BAE_ENV_AK,
    pwd: 'admin' || process.env.BAE_ENV_SK,
    host: 'localhost:27017'
};
exports.SMS_ACCOUNT = {
    account: 'xxx',
    password: 'xxx',
    signature: '【hp】',
    code: 9382
};
exports.weather_key = "sdf==";
exports.host = "localhost:3000";
exports.blog_config = {
    nickname: '月盾',
    job: 'NodeJs',
    addr: '上海',
    tel: '1870****527',
    email: 'huo.win.n@gmail.com',
    resume: '本博客即由nodejs开发。虽然很多人对js这么语言表现出不屑的态度，但它的确是一门优秀的语言，不论在前端还是服务端都有它的身影，并且有不俗的表现。有些技术渐渐被遗忘，有些新技术却充满了我的生活。',
    current_job: '掌门1对1，nodejs。'
};
exports.qiniuKey = {
    bucketName: 'xxx',
    accessKey: '6CG6fskhgireugiuerhg-RdfntNFqFEuhTMil-3vy',
    secretKey: 'NxeiNiysdogjsoidxxxxxxx8GxVREalSHZi7hSzJ9'
};
<<<<<<< HEAD
=======
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3Mtc2FtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc2V0dGluZ3Mtc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sQ0FBQyxPQUFPLEdBQUc7SUFDZCxZQUFZLEVBQUUsV0FBVztJQUN6QixFQUFFLEVBQUUsT0FBTztJQUNYLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7SUFDdEMsR0FBRyxFQUFFLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7SUFDdEMsSUFBSSxFQUFFLGlCQUFpQjtDQUMxQixDQUFDO0FBR0YsT0FBTyxDQUFDLFdBQVcsR0FBRztJQUNsQixPQUFPLEVBQUUsS0FBSztJQUNkLFFBQVEsRUFBRSxLQUFLO0lBQ2YsU0FBUyxFQUFFLE1BQU07SUFDakIsSUFBSSxFQUFFLElBQUk7Q0FDYixDQUFDO0FBR0YsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFHOUIsT0FBTyxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQUdoQyxPQUFPLENBQUMsV0FBVyxHQUFHO0lBQ2xCLFFBQVEsRUFBQyxJQUFJO0lBQ2IsR0FBRyxFQUFDLFFBQVE7SUFDWixJQUFJLEVBQUMsSUFBSTtJQUNULEdBQUcsRUFBQyxhQUFhO0lBQ2pCLEtBQUssRUFBQyxxQkFBcUI7SUFFM0IsTUFBTSxFQUFDLG9HQUFvRztJQUMzRyxXQUFXLEVBQUMsZUFBZTtDQUM5QixDQUFDO0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRztJQUNmLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFNBQVMsRUFBRSwyQ0FBMkM7SUFDdEQsU0FBUyxFQUFFLDJDQUEyQztDQUN6RCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENyZWF0ZWQgYnkgaHVvcGFucGFuIG9uIDIwMTQvNS8yNi5cclxuICovXHJcbmV4cG9ydHMubW9uZ29kYiA9IHtcclxuICAgIGNvb2tpZVNlY3JldDogJ25vZGUtZGVtbycsXHJcbiAgICBkYjogJ2Jsb2dzJyxcclxuICAgIHBvcnQ6ICc4OTA4JyxcclxuICAgIHVpZDogJ2FkbWluJyB8fCBwcm9jZXNzLmVudi5CQUVfRU5WX0FLLFxyXG4gICAgcHdkOiAnYWRtaW4nIHx8IHByb2Nlc3MuZW52LkJBRV9FTlZfU0ssXHJcbiAgICBob3N0OiAnbG9jYWxob3N0OjI3MDE3J1xyXG59O1xyXG5cclxuLy/lu7rlkajnn63kv6HotKbmiLdcclxuZXhwb3J0cy5TTVNfQUNDT1VOVCA9IHtcclxuICAgIGFjY291bnQ6ICd4eHgnLFxyXG4gICAgcGFzc3dvcmQ6ICd4eHgnLFxyXG4gICAgc2lnbmF0dXJlOiAn44CQaHDjgJEnLFxyXG4gICAgY29kZTogOTM4MlxyXG59O1xyXG5cclxuLy/njq/looPkupFrZXkgaHR0cDovL3d3dy5lbnZpY2xvdWQuY24vXHJcbmV4cG9ydHMud2VhdGhlcl9rZXkgPSBcInNkZj09XCI7XHJcblxyXG4vL+S4u+acuumFjee9rlxyXG5leHBvcnRzLmhvc3QgPSBcImxvY2FsaG9zdDozMDAwXCI7XHJcblxyXG4vL+WNmuWuouS/oeaBr++8jOS4quS6uuWfuuacrOS/oeaBr+mFjee9rlxyXG5leHBvcnRzLmJsb2dfY29uZmlnID0ge1xyXG4gICAgbmlja25hbWU6J+aciOebvicsXHJcbiAgICBqb2I6J05vZGVKcycsXHJcbiAgICBhZGRyOifkuIrmtbcnLFxyXG4gICAgdGVsOicxODcwKioqKjUyNycsXHJcbiAgICBlbWFpbDonaHVvLndpbi5uQGdtYWlsLmNvbScsXHJcblxyXG4gICAgcmVzdW1lOifmnKzljZrlrqLljbPnlLFub2RlanPlvIDlj5HjgILomb3nhLblvojlpJrkurrlr7lqc+i/meS5iOivreiogOihqOeOsOWHuuS4jeWxkeeahOaAgeW6pu+8jOS9huWug+eahOehruaYr+S4gOmXqOS8mOengOeahOivreiogO+8jOS4jeiuuuWcqOWJjeerr+i/mOaYr+acjeWKoeerr+mDveacieWug+eahOi6q+W9se+8jOW5tuS4lOacieS4jeS/l+eahOihqOeOsOOAguacieS6m+aKgOacr+a4kOa4kOiiq+mBl+W/mO+8jOacieS6m+aWsOaKgOacr+WNtOWFhea7oeS6huaIkeeahOeUn+a0u+OAgicsXHJcbiAgICBjdXJyZW50X2pvYjon5o6M6ZeoMeWvuTHvvIxub2RlanPjgIInXHJcbn07XHJcbi8v5LiD54mba2V5XHJcbmV4cG9ydHMucWluaXVLZXkgPSB7XHJcbiAgICBidWNrZXROYW1lOiAneHh4JyxcclxuICAgIGFjY2Vzc0tleTogJzZDRzZmc2toZ2lyZXVnaXVlcmhnLVJkZm50TkZxRkV1aFRNaWwtM3Z5JyxcclxuICAgIHNlY3JldEtleTogJ054ZWlOaXlzZG9nanNvaWR4eHh4eHh4OEd4VlJFYWxTSFppN2hTeko5J1xyXG59XHJcbiJdfQ==
>>>>>>> develop
