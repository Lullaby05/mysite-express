const demoModel = require("./model/demoModel");

// 查询所有
module.exports.findAllDemoDao = async function() {
  return await demoModel.findAll();
}

// 新增
module.exports.addDemoDao = async function(newDemoInfo) {
  return await demoModel.create(newDemoInfo);
}

// 删除
module.exports.deleteDemoDao = async function(id) {
  return await demoModel.destroy({
    where: {
      id
    }
  })
}

// 修改
module.exports.updateDemoDao = async function(id, newDemoInfo) {
  await demoModel.update(newDemoInfo, {
    where: {
      id
    }
  })
  return await demoModel.findByPk(id);
}