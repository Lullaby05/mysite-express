// 负责对数据库进行初始化
const sequelize = require("./dbConnect"); // 连接实例

const adminModel = require("./model/adminModel"); // admin模型

const bannerModel = require("./model/bannerModel"); // banner模型

const blogTypeModel = require("./model/blogTypeModel");

const blogModel = require("./model/blogModel");

const demoModel = require("./model/demoModel");

const messageModel = require("./model/messageModel");

const md5 = require("md5");

(async function () {
  // 定义模型之间的关联关系

  // 博客和文章分类之间的关系
  blogTypeModel.hasMany(blogModel, {
    foreignKey: 'categoryId',
    targetKey: 'id'
  });
  blogModel.belongsTo(blogTypeModel, {
    foreignKey: 'categoryId',
    targetKey: 'id',
    as: 'category'
  });

  // 评论和文章之间的关联关系
  blogModel.hasMany(messageModel, {
    foreignKey: "blogId",
    targetKey: 'id'
  });
  messageModel.belongsTo(blogModel, {
    foreignKey: 'blogId',
    targetKey: 'id',
    as: 'blog'
  });

  // 将数据模型和表进行同步
  await sequelize.sync({
    alter: true,
  });

  // 同步后，初始化某些表的数据
  // 查询表中是否有内容
  const adminCount = await adminModel.count();
  if (!adminCount) {
    // 无数据，初始化数据
    await adminModel.create({
      loginId: "admin",
      name: "超级管理员",
      loginPwd: md5("123456"),
    });
    console.log("初始化管理员数据完毕");
  }

  // banner初始化
  const bannerCount = await bannerModel.count();
  if(!bannerCount) {
    await bannerModel.bulkCreate([
      {
        midImg: "/static/images/bg1_mid.jpg",
        bigImg: "/static/images/bg1_big.jpg",
        title: "塞尔达旷野之息",
        description: "2017年年度游戏，期待续作",
      },
      {
        midImg: "/static/images/bg2_mid.jpg",
        bigImg: "/static/images/bg2_big.jpg",
        title: "塞尔达四英杰",
        description: "四英杰里面你最喜欢的又是谁呢",
      },
      {
        midImg: "/static/images/bg3_mid.jpg",
        bigImg: "/static/images/bg3_big.jpeg",
        title: "日本街道",
        description: "动漫中经常出现的日本农村街道，一份独特的恬静",
      },
    ]);
  }


  console.log("初始化数据完毕");
})();
