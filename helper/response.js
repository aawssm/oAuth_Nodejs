/**
 * this class help with standerd Response
 * this help with seting {} and sending resonse back to client
 * with just one statement
 */

class MyResponse {
    setReqMap = (req, mMap = {}) => {
      req.mRes = mMap;
    };
  
    setSuccess = (
      req,
      success = false,
      result = { result: [] },
      previousDoc = { previousDoc: [] }
    ) => (req.mRes = this.retSucMap(success, result, previousDoc));
  
    setError = (
      req,
      message = "",
      sCode = 400,
      result = { result: [] },
      previousDoc = { previousDoc: [] }
    ) => (req.mRes = this.retErrorMap(message, sCode, result, previousDoc));
  
    retSucMap = function (
      success = false,
      result = { result: [] },
      previousDoc = { previousDoc: [] }
    ) {
      return {
        status: "ok",
        message: "",
        success: success,
        sCode: 200,
        ...result,
        ...previousDoc,
      };
    };
  
    retErrorMap = (
      message = "",
      sCode = 400,
      result = { result: [] },
      previousDoc = { previousDoc: [] }
    ) => {
      return {
        status: "ok",
        success: false,
        message: message,
        sCode: sCode,
        ...result,
        ...previousDoc,
      };
    };
  
    sendResponseMap = (
      res,
      result = { result: [] },
      sCode = 500,
      message = "",
      previousDoc = { previousDoc: [] }
    ) => {
      let req = {};
      req.mRes = {
        status: "ok",
        success: sCode < 400,
        message: message,
        sCode: sCode,
        ...result,
        ...previousDoc,
      };
      return this.sendResponse(req, res);
    };
  
    sendResponse = (req, res) => {
      // console.log(req.mRes);
      return res.status(req.mRes.sCode).send({
        status: req.mRes.status || "ok",
        success: req.mRes.success || false,
        message: req.mRes.message.toString(),
        result: req.mRes.result || [],
        previousDoc: req.mRes.previousDoc || [],
      });
    };
  }
  module.exports = new MyResponse();
  