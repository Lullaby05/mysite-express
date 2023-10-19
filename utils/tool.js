const jwt = require("jsonwebtoken");
const md5 = require("md5");
const multer = require("multer");
const path = require("path");
const toc = require("markdown-toc");


// 格式化响应数据
/* 
  {
    "code": code,
    "msg": "",
    "data": data
  }
*/
module.exports.formatResponse = function(code, msg, data) {
  return {
    "code": code,
    "msg": msg,
    "data": data
  }
}

module.exports.analysisToken = function(token) {
  return jwt.verify(token.split(" ")[1], md5(process.env.JWT_SECRET))
}

// 处理数组类型的响应数据
module.exports.handleDataPattern = function(data) {
  const arr = [];
  for (const i of data) {
    arr.push(i.dataValues);
  }
  return arr;
}

// 设置上传文件引擎
const storage = multer.diskStorage({
  // 文件存储的位置
  destination: function(req, file, cb) {
    cb(null, __dirname + '/../public/static/uploads');
  },
  // 上传到服务器的文件，单独处理文件名
  filename: function(req, file, cb) {
    // 获取文件名
    const basename = path.basename(file.originalname, path.extname(file.originalname));
    // 后缀名
    const extname = path.extname(file.originalname);
    // 构建新的名字
    const newName = basename + new Date().getTime() + Math.floor(Math.random() * 9000 + 1000) + extname;
    cb(null, newName)
  }
})

module.exports.uploading = multer({
  storage: storage,
  limits: {
    fileSize: 2000000,
    files: 1
  }
})

// 处理TOC
module.exports.handleTOC = function(info) {
  let result = toc(info.markdownContent).json;
  // 提取markdown标题和等级
  function transfer(flatArr) {
    const stack = []; // 模拟栈的结构（先进后出）
    const result = []; // 存放结果

    /**
     * 创建TOC对象
     * @param {*} item 
     * @returns 
     */
    function createTOCItem(item) {
      return {
        name: item.content,
        anchor: item.slug,
        level: item.lvl,
        children: []
      }
    }

    function handleItem(item) {
      const top = stack[stack.length - 1]; // 获取栈顶元素，数组的最后一个元素
      if(!top) {
        stack.push(item);
      } else if(item.level > top.level) {
        // 说明当前toc对象的等级比栈顶等级要高
        // 说明当前toc对象为上一个toc对象的children成员
        top.children.push(item);
        stack.push(item);
      } else {
        stack.pop();
        handleItem(item);
      }
    }

    let min = 6; // 最小标题级别
    // 该for循环用于寻找标题中最小的等级
    for(const i of flatArr) {
      if(i.lvl < min) {
        min = i.lvl
      }
    }
    for(const item of flatArr) {
      const tocItem = createTOCItem(item);
      if(tocItem.level === min) {
        // 说明当前TOC对象已经是最低等级(也就是最高的标题等级)
        result.push(tocItem)
      }
      // 没有进入if说明可能是某个TOC对象的children成员
      handleItem(tocItem);
    }

    return result;
  }
  info.toc = transfer(result);

  delete info.markdownContent;

  // 给每个级别的标题添加id
  for(const i of result) {
    switch(i.lvl) {
      case 1: {
        const newStr = `<h1 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h1>', newStr);
        break;
      }
      case 2: {
        const newStr = `<h2 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h2>', newStr);
        break;
      }
      case 3: {
        const newStr = `<h3 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h3>', newStr);
        break;
      }
      case 4: {
        const newStr = `<h4 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h4>', newStr);
        break;
      }
      case 5: {
        const newStr = `<h5 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h5>', newStr);
        break;
      }
      case 6: {
        const newStr = `<h6 id="${i.slug}">`;
        info.htmlContent = info.htmlContent.replace('<h6>', newStr);
        break;
      }
    }
  }

  return info
}