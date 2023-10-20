const validate = require("validate.js");
const blogTypeModel = require("../dao/model/blogTypeModel");
const { ValidationError } = require("../utils/errors");
const { addBlogDao, findBlogByPageDao, findBlogByIdDao, updateBlogDao, deleteBlogDao } = require("../dao/blogDao");
const { formatResponse, handleDataPattern, handleTOC } = require("../utils/tool");
const { addBlogToType, findOneBlogTypeDao } = require("../dao/blogTypeDao");
const { deleteMessageByBlogIdDao } = require("../dao/messageDao");

// 扩展验证规则
validate.validators.categoryIdIsExist = async function(value) {
  const blogTypeInfo = await blogTypeModel.findByPk(value);
  if(blogTypeInfo) return ;
  return "CategoryId Is Not Exist";
}

module.exports.addBlogService = async function(newBlogInfo) {
  // 首先处理 TOC 目录
  newBlogInfo = handleTOC(newBlogInfo);
  // 将数据转化为字符串
  newBlogInfo.toc = JSON.stringify(newBlogInfo.toc);

  // 初始化新文章的其他信息
  newBlogInfo.scanNumber = 0; // 阅读量
  newBlogInfo.commentNumber = 0; // 评论数

  // 定义验证规则
  const blogRule = {
    title: {
      presence: {
        allowEmpty: false,
      },
      type: "string",
    },
    description: {
      presence: {
        allowEmpty: true,
      },
      type: "string",
    },
    toc: {
      presence: {
        allowEmpty: true,
      },
      type: "string",
    },
    htmlContent: {
      presence: {
        allowEmpty: false,
      },
      type: "string",
    },
    thumb: {
      presence: {
        allowEmpty: true,
      },
      type: "string",
    },
    scanNumber: {
      presence: {
        allowEmpty: false,
      },
      type: "integer",
    },
    commentNumber: {
      presence: {
        allowEmpty: false,
      },
      type: "integer",
    },
    createDate: {
      presence: {
        allowEmpty: false,
      },
      type: "integer",
    },
    categoryId: { // 验证分类是否存在
      presence: true,
      type: "integer",
      categoryIdIsExist: true,
    },
  };

  // 进行数据验证
  try { // 异步验证，使用异步验证方式
    await validate.async(newBlogInfo, blogRule);
    const data = await addBlogDao(newBlogInfo);
    // 文章新增了，对应的文章分类也要新增
    await addBlogToType(newBlogInfo.categoryId);
    return formatResponse(200, "", data);
  } catch(e) {
    // 验证未通过
    throw new ValidationError("数据验证失败");
  }
};

module.exports.findBlogByPageService = async function(pageInfo) {
  const data = await findBlogByPageDao(pageInfo);
  const rows = handleDataPattern(data.rows);
  // 针对TOC要还原
  rows.forEach(it => {
    it.toc = JSON.parse(it.toc)
  });
  return formatResponse(200, "", {
    total: data.count,
    rows
  });
}

// 根据id获取某一篇文章
module.exports.findBlogByIdService = async function(id, auth) {
  const data = await findBlogByIdDao(id);
  // 重新处理TOC,还原成数组
  data.dataValues.toc = JSON.parse(data.dataValues.toc);
  // 根据auth是否有值决定浏览数是否自增,有token自增
  if(!auth) {
    data.scanNumber++;
    await data.save();
  }
  return formatResponse(200, "", data.dataValues);
}

// 修改一篇博客
module.exports.updateBlogService = async function(id, newBlogInfo) {
  // 判断正文是否改变，正文改变会修改toc
  if(newBlogInfo.htmlContent) {
    // 说明正文内容修改了，需要重新处理toc
    newBlogInfo = handleTOC(newBlogInfo);
    // 将数据转化为字符串
    newBlogInfo.toc = JSON.stringify(newBlogInfo.toc);

    newBlogInfo.toc = JSON.stringify('["a": "b"]');
  }
  // 修改了文章分类需要将之前的文章分类自减然后新的文章分类自增
  const { dataValues: oldBlogInfo } = await findBlogByIdDao(id);
  if(newBlogInfo.categoryId !== oldBlogInfo.categoryId) {
    // 分类信息被修改了
    // 旧的自减
    const oldBlogType = await findOneBlogTypeDao(oldBlogInfo.categoryId)
    oldBlogType.articleCount--;
    oldBlogType.save();

    // 新的自增
    const newBlogType = await findOneBlogTypeDao(newBlogInfo.categoryId)
    newBlogType.articleCount++;
    newBlogType.save();
  }

  const { dataValues } = await updateBlogDao(id, newBlogInfo);
  return formatResponse(200, "", dataValues);
}

// 删除一篇博客
module.exports.deleteBlogService = async function(id) {
  // 查询id文章信息
  const data = await findBlogByIdDao(id);
  // 需要根据该文章对应的分类，分类中的文章数量自减
  const categoryInfo = await findOneBlogTypeDao(data.dataValues.categoryId);
  categoryInfo.articleCount--;
  await categoryInfo.save();
  // 删除文章下面的评论
  await deleteMessageByBlogIdDao(id)

  // 删除文章
  await deleteBlogDao(id);
  return formatResponse(200, "", true);
}

