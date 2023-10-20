const validate = require("validate.js");
const { ValidationError } = require("../utils/errors");
const { addBlogTypeDao, findAllBlogTypeDao, findOneBlogTypeDao, updateBlogTypeDao, deleteBlogTypeDao } = require("../dao/blogTypeDao");
const { formatResponse, handleDataPattern } = require("../utils/tool");
const { blogCountByBlogType } = require("../dao/blogDao");

// 新增博客分类
module.exports.addBlogTypeService = async function(newBlogTypeInfo) {
  // 数据验证规则
  const blogTypeRule = {
    name: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
    order: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    }
  }
  // 进行数据验证
  const validateResult = validate.validate(newBlogTypeInfo, blogTypeRule);
  if(!validateResult) {
    // 验证通过
    newBlogTypeInfo.articleCount = 0; // 新增文章数据量为0
    const data = await addBlogTypeDao(newBlogTypeInfo);
    return formatResponse(200, "", data);
  } else {
    throw new ValidationError("数据验证失败");
  }
}

// 查询所有博客分类
module.exports.findAllBlogTypeService = async function() {
  const data = await findAllBlogTypeDao();
  const obj = handleDataPattern(data).sort((a, b) => a.order - b.order);
  return formatResponse(200, "", obj);
}

// 获取单个博客分类
module.exports.findOneBlogTypeService = async function(id) {
  return formatResponse(200, "",await findOneBlogTypeDao(id));
}

// 修改单个博客分类
module.exports.updateBlogTypeService = async function(id, newBlogTypeInfo) {
  return formatResponse(200, "", await updateBlogTypeDao(id, newBlogTypeInfo));
}

// 删除其中一个博客分类
module.exports.deleteBlogTypeService = async function(id) {
  const count = await blogCountByBlogType(id);
  await deleteBlogTypeDao(id);
  // 返回值需要返回受到影响的文章数量
  return formatResponse(200, "", count)
}