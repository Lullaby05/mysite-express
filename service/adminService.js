// admin模块的业务层
const md5 = require("md5");
const { loginDao, updateAdminDao } = require("../dao/adminDao");
const jwt = require("jsonwebtoken");
const { ValidationError } = require("../utils/errors");
const { formatResponse } = require("../utils/tool");

// 登录
module.exports.loginService = async function (loginInfo) {
  loginInfo.loginPwd = md5(loginInfo.loginPwd);
  // 接下来进行数据的验证，查询数据库中是否存在
  let data = await loginDao(loginInfo);
  if(data && data.dataValues) {
    // 添加token
    const { id, loginId, name } = data.dataValues;
    data = { id, loginId, name }
    // 客户端未指定了remember，则默认一天
    let loginPeriod = parseInt(loginInfo.remember) || 1
    const token = jwt.sign({
      id: data.id,
      loginId: data.loginId,
      name: data.name
    }, md5(process.env.JWT_SECRET), {
      expiresIn: 60 * 60 * 24 * loginPeriod
    })
    return {
      token, 
      data
    }
  }
  return { data };
}

// 更新
module.exports.updateService = async function(accountInfo) {
  // 接下来进行数据的验证，查询数据库中是否存在
  const adminInfo = await loginDao({
    loginId: accountInfo.loginId,
    loginPwd: md5(accountInfo.oldLoginPwd)
  });
  if(adminInfo && adminInfo.dataValues) {
    // 密码正确，开始修改
    const newPassword = md5(accountInfo.loginPwd);
    const param = {
      name: accountInfo.name,
      loginId: accountInfo.loginId,
      loginPwd: newPassword
    }
    await updateAdminDao(param)
    return formatResponse(200, "", {
      "loginId": accountInfo.loginId,
      "name": accountInfo.name,
      "id": adminInfo.dataValues.id
    })
  } else {
    // 密码不正确，找不到用户
    // 抛出错误
    throw new ValidationError("旧密码不正确");
  }
}