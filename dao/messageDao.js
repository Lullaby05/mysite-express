const blogModel = require("./model/blogModel");
const messageModel = require("./model/messageModel");
const { Op } = require("sequelize");

module.exports.addMessageDao = async function(newMessage) {
  const data = await messageModel.create(newMessage);
  return data;
}

module.exports.findMessageByPageDao = async function(pageInfo) {
  // 根据blogId区分查询的是评论还是留言
  // 有blogId说明是对应文章的评论
  if(pageInfo.blogId) {
    // 分为两种情况
    // 获取所有的文章评论
    if(pageInfo.blogId === "all") {
      return await messageModel.findAndCountAll({
        offset: (pageInfo.page * 1 - 1) * pageInfo.limit,
        limit: pageInfo.limit * 1,
        where: {
          blogId: {
            [Op.ne]: null
          }
        },
        include: [
          {
            model: blogModel,
            as: 'blog'
          }
        ]
      })
    } else {
      return await messageModel.findAndCountAll({
        offset: (pageInfo.page * 1 - 1) * pageInfo.limit,
        limit: pageInfo.limit * 1,
        where: {
          blogId: pageInfo.blogId * 1
        },
        order: [
          ["createDate", "DESC"]
        ]
      })
    }
    // 获取对应的文章评论
  } else {
    return await messageModel.findAndCountAll({
      offset: (pageInfo.page * 1 - 1) * pageInfo.limit,
      limit: pageInfo.limit * 1,
      where: {
        blogId: null
      },
      order: [
        ["createDate", "DESC"]
      ]
    })
  }
}

// 删除留言或评论
module.exports.deleteMessageDao = async function(id) {
  return await messageModel.destroy({
    where: {
      id
    }
  })
}

// 使用blogId删除评论
module.exports.deleteMessageByBlogIdDao = async function(blogId) {
  return await messageModel.destroy({
    where: {
      blogId
    }
  })
}