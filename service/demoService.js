const { validate } = require("validate.js");
const { findAllDemoDao, addDemoDao, deleteDemoDao, updateDemoDao } = require("../dao/demoDao");
const { formatResponse, handleDataPattern } = require("../utils/tool");
const { ValidationError } = require("../utils/errors");

module.exports.findAllDemoService = async function() {
  const data = await findAllDemoDao();
  const obj = handleDataPattern(data);
  // 还原description
  obj.forEach(item => {
    item.description = JSON.parse(item.description);
  })
  return formatResponse(200, "", obj);
}

module.exports.addDemoService = async function(newDemoInfo) {
  // 首先处理 description 转换为字符串
  newDemoInfo.description = JSON.stringify(newDemoInfo.description);
  
  // 验证规则
  const demoRule = {
    name: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
    url: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
    github: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
    description: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
    order: {
      presence: {
        allowEmpty: false
      },
      type: "integer"
    },
    thumb: {
      presence: {
        allowEmpty: false
      },
      type: "string"
    },
  }

  // 数据验证
  const validateResult = validate.validate(newDemoInfo, demoRule);
 
  if(!validateResult) {
    const data = await addDemoDao(newDemoInfo);
    return formatResponse(200, "", data)
  } else {
    throw new ValidationError('数据验证失败');
  }
  
}

module.exports.deleteDemoService = async function(id) {
  await deleteDemoDao(id);
  return formatResponse(200, "", true);
}

module.exports.updateDemoService = async function(id, newDemoInfo) {
  if(newDemoInfo.description) {
    newDemoInfo.description = JSON.stringify(newDemoInfo.description);
  }
  const { dataValues } = await updateDemoDao(id, newDemoInfo);
  dataValues.description = JSON.parse(dataValues.description);
  return formatResponse(200, "", dataValues);
}