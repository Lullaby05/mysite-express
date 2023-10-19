const bannerModel = require("./model/bannerModel");

module.exports.findBannerDao = async function() {
  return await bannerModel.findAll();
}

module.exports.updateBannerDao = async function(bannerArr) {
  // 删除表的记录
  await bannerModel.destroy({
    truncate: true
  });
  await bannerModel.bulkCreate(bannerArr); // 批量写入
  return await bannerModel.findAll();
}