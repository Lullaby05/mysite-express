const { findBannerDao, updateBannerDao } = require('../dao/bannerDao');
const { formatResponse, handleDataPattern } = require('../utils/tool');

module.exports.findBannerService = async function() {
  const data = handleDataPattern(await findBannerDao());
  return formatResponse(200, "", data);
}

module.exports.updateBannerService = async function(bannerArr) {
  const data = handleDataPattern(await updateBannerDao(bannerArr));
  return formatResponse(200, "", data);
}