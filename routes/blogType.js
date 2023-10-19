var express = require("express");
var router = express.Router();
const { UploadError } = require("../utils/errors");
const { addBlogTypeService, findAllBlogTypeService, findOneBlogTypeService, updateBlogTypeService, deleteBlogTypeService } = require("../service/blogTypeService");

// 添加博客分类
router.post('/', async function(req, res, next) {
  res.send(await addBlogTypeService(req.body));
})

// 获取所有博客分类
router.get('/', async function(req, res, next) {
  res.send(await findAllBlogTypeService());
})

// 获取某一个博客分类
router.get('/:id', async function(req, res, next) {
  res.send(await findOneBlogTypeService(req.params.id));
})

// 修改某个博客分类
router.put('/:id', async function(req, res, next) {
  res.send(await updateBlogTypeService(req.params.id, req.body));
})

// 删除某个博客分类
router.delete('/:id', async function(req, res, next) {
  res.send(await deleteBlogTypeService(req.params.id));
})



module.exports = router;