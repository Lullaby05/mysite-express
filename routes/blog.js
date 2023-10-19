var express = require("express");
var router = express.Router();
const { formatResponse } = require("../utils/tool");
const { addBlogService, findBlogByPageService, findBlogByIdService, updateBlogService, deleteBlogService } = require("../service/blogService");

// 发布文章
router.post('/', async function(req, res,next) {
  res.send(await addBlogService(req.body));
});

// 分页获取文章
router.get('/', async function(req, res,next) {
  res.send(await findBlogByPageService(req.query))
});

// 获取一个文章
router.get('/:id', async function(req, res,next) {
  const reqHeaders = req.headers;
  res.send(await findBlogByIdService(req.params.id, reqHeaders.authorization))
});

// 修改文章
router.put('/:id', async function(req, res,next) {
  res.send(await updateBlogService(req.params.id, req.body));
});

// 删除文章
router.delete('/:id', async function(req, res,next) {
  res.send(await deleteBlogService(req.params.id));
});

module.exports = router;