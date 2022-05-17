import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IUser, InvitedUser, User, IUserList } from '../models/UserModel';
import { CommonUtil, IResponse } from '../utils/CommonUtil';
import { MailService } from '../service/MailService';
import * as Mail from 'nodemailer/lib/mailer';
import { UserService } from '../service/UserService';
import { AuthUtil } from '../utils/AuthUtil';

export class UserController {
  /**
   * Create user if user's email is in invited user or user logged in using UQ SSO.
   * If user is not in the invited user table and they logged in using UQ SSO, they will be automatically assigned guest role
   * If user is an external user and not in the invited user table, the api will throw user is not authorized
   * @param req
   * @param res
   */
  public async createNewUser(req: Request, res: Response) {
    const { email } = res.locals.user;
    const invitedUser: IUser | null = await InvitedUser.findOne({
      email: email,
    });
    const isInternalUser = CommonUtil.isInternalUser(email);

    if (isInternalUser) {
      const { firstName, lastName, username, password, role } = res.locals.user;

      //if user is not invited but they are logged in using their uq sso.
      const newUser: IUser | null = await new User({
        firstName,
        lastName,
        email,
        role: role,
        username: username,
        password: bcrypt.hashSync(password, 10),
      });
      const create = await newUser.save();

      if (!create)
        return CommonUtil.failResponse(res, 'User is not authorized');

      await AuthUtil.generateToken(res, newUser.username, newUser._id);
      return CommonUtil.successResponse(res, `${role} user is created`);
    } else {
      if ( !isInternalUser)
        return CommonUtil.failResponse(res, 'User is not authorized');

      const { firstName, lastName, email, role } = <IUser>invitedUser;
      const { user } = res.locals.user;
      // if user is in the invited user table and they login using uq sso.
      if ( isInternalUser) {
        const newUser: IUser = await new User({
          firstName,
          lastName,
          email,
          role,
          username: user,
        });
        await newUser.save();
        await AuthUtil.generateToken(res, newUser.username, newUser._id);
        return CommonUtil.successResponse<IResponse<string>>(
          res,
          'Guest user is created',
        );
      }

      const { username } = res.locals.user || req.body;
      const usernameIsFound = await User.findOne({ username });

      if (usernameIsFound)
        return CommonUtil.failResponse(res, 'username has already exists');

      const password = bcrypt.hashSync(res.locals.user.password, 10) || '';
      const newUser: IUser = await new User({
        firstName,
        lastName,
        email,
        role,
        username,
        password,
      });
      await newUser.save();
      await InvitedUser.deleteOne({ email: email });

      return CommonUtil.successResponse<IResponse<string>>(
        res,
        'User has been created',
      );
    }
  }

  /**
   * Validate token is for invited external user only
   * @param req
   * @param res
   */
  public async decodeToken(req: Request, res: Response) {
    return CommonUtil.successResponse(res, 'token is valid', res.locals.user);
  }

  /**
  * Gets the current logged in user
  * @param req
  * @param res (logged in user details)
  */
  public async getLoggedInUser(req: Request, res: Response) {
      var user = req.header('x-kvd-payload');
      res.send(user);
  }

  /**
   * Get current user details req.body should have email
   * @param req (current user's username)
   * @param res
   */
  public async getCurrentUserDetails(req: Request, res: Response) {
    const { username } = req.params;

    const currentUser: IUser | null = await User.findOne({ username });

    if (!currentUser)
      return CommonUtil.failResponse(
        res,
        'make sure user email address is correct',
      );

    return CommonUtil.successResponse(res, '', <IUser>currentUser);
  }

  /**
   * Update user's role to guest if the user is using UQ SSO. Delete user from database if user is Non-UQ
   * @param req (current user's username, the username of another user which need to be updated or deleted)
   * @param res
   */
  public async updateUserRole(req: Request, res: Response) {
    const { usernameToBeUpdated } = req.params;

    const isUserToBeDeletedFound = await User.findOne({
      username: usernameToBeUpdated,
    });
    if (!isUserToBeDeletedFound)
      return CommonUtil.failResponse(res, 'user to be deleted is not found');

    const isInternalUser = CommonUtil.isInternalUser(
      isUserToBeDeletedFound.email,
    );

    if (!isInternalUser) {
      await User.deleteOne({ username: isUserToBeDeletedFound.username });
    } else {
      await User.updateOne(
        { username: isUserToBeDeletedFound.username },
        { role: 'guest' },
      );
    }

    return CommonUtil.successResponse(res, 'user is successfully deleted');
  }

  /**
   * Get user list only getting all users with project admin role.
   * @query req (size) -- it is to show certain numbers of record in 1 page
   * @param req (username, page)
   * @param res
   */
  public async getUserList(req: Request, res: Response) {
    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;
    const fieldToSearch = { role: 'projectAdmin' };

    const results = await UserService.setUserListPagination(
      maxResult,
      pageNo,
      size,
      fieldToSearch,
      res,
    );

    return CommonUtil.successResponse<IResponse<IUserList>>(
      res,
      '',
      <IUserList>results,
    );
  }

  /**
   *
   * @param req (query and params)
   * @param res
   */
  public async searchUser(req: Request, res: Response) {
    const { query } = req.query;

    const searchRegex = new RegExp(escape(query as string), 'gi');

    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;

    const fieldToSearchCount = {
      firstName: searchRegex,
      lastName: searchRegex,
      role: searchRegex,
      email: searchRegex,
    };

    const results = await UserService.setUserListPagination(
      maxResult,
      pageNo,
      size,
      fieldToSearchCount,
      res,
    );
    return CommonUtil.successResponse(
      res,
      `${(<IUserList>results).users.length} users is found`,
      <IUserList>results,
    );
  }

  /**
   * Get all invited user from database
   * @param req
   * @param res
   */
  public async getInvitedUser(req: Request, res: Response) {
    const allInvitedUser: IUser[] = await InvitedUser.find();
    return CommonUtil.successResponse(res, '', allInvitedUser);
  }

  /**
   * Send email when external users forgot their password. the secure token will expires in 24hrs
   * @param req
   * @param res
   */
  public async sendEmailForgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const userFound = await User.findOne({ email });
    const isInternalUser = email.includes('uq.edu.au');

    if (isInternalUser)
      return CommonUtil.failResponse(
        res,
        'Please change your password from UQ SSO',
      );
    if (!userFound) return;

    const { firstName, lastName, role } = <IUser>userFound;
    let transporter: Mail = req.app.get('transporter');

    const { JWT_Hash } = process.env;

    const secureToken = jwt.sign(
      { firstName, lastName, email: userFound.email, role },
      <string>JWT_Hash,
      {
        algorithm: 'HS256',
        expiresIn: '1d',
      },
    );

    const loginUrl = isInternalUser
      ? 'http://localhost:8000/login'
      : `http://localhost:8000/login/${secureToken}`;

    const mailOption = {
      from: 'admin@uwmt-001.zones.eait.uq.edu.au',
      to: userFound.email,
      subject: 'You are invited to Urban Water',
      html: `You have been invited to Urban Water please login: ${loginUrl}`,
    };

    await MailService.sendMail(mailOption, <Mail>transporter);
    return CommonUtil.successResponse(
      res,
      `We will send the email to reset your password if your email is found`,
    );
  }

  /**
   * Update user password if user is logged in
   * @param req (email, password)
   * @param res
   */
  public async updateUserPassword(req: Request, res: Response) {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (res.locals.user.username !== (<IUser>userFound).username)
      return CommonUtil.failResponse(res, 'user is not authorized');

    if (!userFound) return CommonUtil.failResponse(res, 'User is not found');

    await User.findOneAndUpdate(
      { email },
      { password: bcrypt.hashSync(password, 10) },
    );
    return CommonUtil.successResponse(res, 'Password is updated successfully');
  }

  /**
   * Login check if user is in the user table and the password match
   * @param req
   * @param res
   */
  public async login(req: Request, res: Response) {
    const { password, email } = req.body;
    const loginUser = await User.findOne({ email: email });

    if (!loginUser || !bcrypt.compareSync(password, <string>loginUser.password))
      return CommonUtil.failResponse(res, 'login details is invalid');
    await AuthUtil.generateToken(res, loginUser.username, loginUser._id);

    return CommonUtil.successResponse(res, '', loginUser);
  }

  /**
   * Logout remove user details from cache
   * @param req
   * @param res
   */
  public async logout(req: Request, res: Response) {
    const { user } = res.locals;

    if (!user) {
      res.clearCookie('loginToken');
      delete res.locals.user;
      return CommonUtil.successResponse(res, 'Logout successfully');
    }

    return CommonUtil.failResponse(res, 'You are not login');
  }
}
