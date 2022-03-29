import { Request, Response } from 'express';
import { CommonUtil } from '../utils/CommonUtil';
import { FAQ } from '../models/FAQModel';

export class FAQController {
  /**
   * Get all Questions and Answers
   * @param req
   * @param res
   */
  public async getFAQ(req: Request, res: Response) {
    const faqCollection = await FAQ.find({}, '-_id');

    return CommonUtil.successResponse(res, '', faqCollection);
  }

  /**
   * Create question and answer
   * @param req (params, body)
   * @param res
   */
  public async createQuestionAnswer(req: Request, res: Response) {
    const { username } = req.params;
    const { user } = res.locals;
    const { body } = req;

    if (user.username !== username)
      return CommonUtil.failResponse(res, 'user is not authorized');
    if (!Array.isArray(body))
      return CommonUtil.failResponse(res, 'payload should be an array');
    if (!body.length) return CommonUtil.failResponse(res, 'payload is empty');

    for (let idx = 0; idx < body.length; idx++) {
      body[idx]['idx'] = idx;
      const newFAQ = await new FAQ(body[idx]);
      await newFAQ.save();
    }

    return CommonUtil.successResponse(
      res,
      'Question and answer has been saved successfully',
    );
  }

  /**
   * Edit question and answer
   * @param req (params, body)
   * @param res
   */
  public async editQuestionAnswer(req: Request, res: Response) {
    const { username, idx } = req.params as any;
    const { user } = res.locals;
    const { question, answer } = req.body;

    if (user.username !== username)
      return CommonUtil.failResponse(res, 'user is not authorized');
    const isQuestionAnswerFound = await FAQ.findOne({ idx });

    if (!isQuestionAnswerFound)
      return CommonUtil.failResponse(res, 'requested data is not found');
    if (question) await FAQ.updateOne({ idx }, { question });
    if (answer) await FAQ.updateOne({ idx }, { answer });

    return CommonUtil.successResponse(
      res,
      'requested data has been edited successfully',
    );
  }

  /**
   *
   * @param req
   * @param res
   */
  public async deleteQuestionAnswer(req: Request, res: Response) {
    const { username } = req.params;
    const { user } = res.locals;
    const { idx } = req.body;

    if (user.username !== username)
      return CommonUtil.failResponse(res, 'user is not authorized');
    const isQuestionAnswerFound = await FAQ.findOne({ idx });
    if (!isQuestionAnswerFound)
      return CommonUtil.failResponse(res, 'requested data is not found');

    await FAQ.deleteOne({ idx });
    return CommonUtil.successResponse(
      res,
      'requested data has been deleted successfully',
    );
  }
}
