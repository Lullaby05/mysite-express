const blogTypeModel = require("./model/blogTypeModel");

module.exports.addBlogTypeDao = async function(newBlogTypeInfo) {
  return await blogTypeModel.create(newBlogTypeInfo);
}

// 获取所有博客分类
module.exports.findAllBlogTypeDao = async function() {
  return await blogTypeModel.findAll();
}

// 获取单个博客分类
module.exports.findOneBlogTypeDao = async function(id) {
  return await blogTypeModel.findByPk(id);
}

// 修改单个博客分类
module.exports.updateBlogTypeDao = async function(id, blogTypeInfo) {
  await blogTypeModel.update(blogTypeInfo, {
    where: {
      id
    }
  });
  return await blogTypeModel.findByPk(id);
}

// 删除单个博客分类
module.exports.deleteBlogTypeDao = async function(id) {
  return await blogTypeModel.destroy({
    where: {
      id
    }
  });
}

// 根据id新增对应博客分类的文章数量
module.exports.addBlogToType = async function(id) {
  const data = await blogTypeModel.findByPk(id);
  data.articleCount++;
  await data.save();
  return ;
}