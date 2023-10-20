const { ValidationError, UnknownError } = require("../utils/errors");
const validate = require("validate.js");
const fs = require("fs");
const { formatResponse, handleDataPattern } = require("../utils/tool");
const { addMessageDao, findMessageByPageDao, deleteMessageDao } = require("../dao/messageDao");
const { findBlogByIdDao } = require("../dao/blogDao");
const dir = './public/static/avatar';

/**
 * 读取一个目录下有多少个文件
 * @param {*} dir 目录地址
 */
async function readDirLength(dir) {
  return new Promise((resolve) => {
    fs.readdir(dir, (err, files) => {
      if(err) throw new UnknownError();
      resolve(files);
    })
  })
}

// 新增评论或留言
module.exports.addMessageService = async function(newMessage) {
  // 数据验证规则
  const messageRules = {
    nickname: {
      presence: {
        allowEmpty: false
      },
      type: 'string'
    },
    content: {
      presence: {
        allowEmpty: false
      },
      type: 'string'
    },
    blogId: {
      type: 'string'
    }
  }
  // 数据验证
  const validateResult = validate.validate(newMessage, messageRules);
  if(!validateResult) {
    newMessage.blogId = newMessage.blogId || null
    newMessage.createDate = Date.now();
    // 头像是随机生成的
    // 随机读取static下面的avatar目录
    const files = await readDirLength(dir);
    const randomIndex = Math.floor(Math.random() * files.length);
    newMessage.avatar = '/static/avatar/' + files[randomIndex];
    // 新增
    const data = await addMessageDao(newMessage);
    // 如果是文章评论，对应文章评论数自增
    if(newMessage.blogId) {
      const blogData = await findBlogByIdDao(newMessage.blogId);
      blogData.commentNumber++;
      await blogData.save();
    }
    return formatResponse(200, "", data);
  } else {
    throw new ValidationError("数据验证失败");
  }
}

// 分页获取评论或者留言
module.exports.findMessageByPageService = async function(pageInfo) {
  const data = await findMessageByPageDao(pageInfo);
  const rows = handleDataPattern(data.rows);
  return formatResponse(200, "", {
    "total": data.count,
    rows
  })
}

// 删除留言或评论
module.exports.deleteMessageService = async function(id) {
  await deleteMessageDao(id);
  return formatResponse(200, "", true);
}