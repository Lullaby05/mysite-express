var express = require("express");
var router = express.Router();
const { addMessageService, findMessageByPageService, deleteMessageService } = require("../service/messageService");

// 添加评论、留言
router.post('/', async function(req, res,next) {
  res.send(await addMessageService(req.body));
});

// 分页获取评论
router.get('/', async function(req, res,next) {
  res.send(await findMessageByPageService(req.query))
});

// 删除评论
router.delete('/:id', async function(req, res,next) {
  res.send(await deleteMessageService(req.params.id));
});

module.exports = router;