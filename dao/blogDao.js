const blogModel = require("./model/blogModel");
const blogTypeModel = require("./model/blogTypeModel");

module.exports.addBlogDao = async function(newBlogInfo) {
  return await blogModel.create(newBlogInfo);
}

// 根据分页查询博客
module.exports.findBlogByPageDao = async function(pageInfo) {
  if(pageInfo.categoryId && pageInfo.categoryId !== '-1') {
    // 根据分类信息查询
    return await blogModel.findAndCountAll({
      include: [
        {
          model: blogTypeModel,
          as: "category",
          where: {
            id: pageInfo.categoryId
          }
        }
      ],
      offset: (pageInfo.page * 1 - 1) * pageInfo.limit,
      limit: pageInfo.limit * 1
    })
  } else {
    // 根据所有文章查询
    return await blogModel.findAndCountAll({
      include: [
        {
          model: blogTypeModel,
          as: "category"
        }
      ],
      offset: (pageInfo.page * 1 - 1) * pageInfo.limit,
      limit: pageInfo.limit * 1
    })
  }
}

// 根据id获取其中一篇文章
module.exports.findBlogByIdDao = async function(id) {
  return await blogModel.findByPk(id, {
    include: [
      {
        model: blogTypeModel,
        as: "category"
      }
    ]
  })
}

// 根据id获取其中一篇文章
module.exports.updateBlogDao = async function(id, newBlogInfo) {
  await blogModel.update(newBlogInfo, {
    where: {
      id
    }
  });
  return await blogModel.findByPk(id);
}

// 根据id删除一篇文章
module.exports.deleteBlogDao = async function(id) {
  return await blogModel.destroy({
    where: {
      id
    }
  })
}

// 该方法根据博客类别id，统计对应博客类型id的数量
module.exports.blogCountByBlogType = async function(categoryId) {
  return await blogModel.count({
    where: {
      categoryId
    }
  })
}