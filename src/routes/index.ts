import { UserController } from '../controller/UserController';
import { SurveyController } from '../controller/SurveyController';
import { AuthUtil } from '../utils/AuthUtil';
import { SurveyService } from '../service/SurveyService';
import { SettingController } from '../controller/SettingController';
import { ResourceController } from '../controller/ResourceController';
import { FAQController } from '../controller/FAQController';
import { SiteSettingsController } from '../components/SiteSettings/SiteSettingsController';

export class Routes {
  public userController: UserController = new UserController();
  public surveyController: SurveyController = new SurveyController();
  public settingController: SettingController = new SettingController();
  public resourceController: ResourceController = new ResourceController();
  public faqController: FAQController = new FAQController();
  public siteSettingsController = new SiteSettingsController();

  public routes(app: any, router: any): void {
    app.use('/api', router);

    router.post('/user/create', AuthUtil.authenticateUser, this.userController.createNewUser);
    router.post(
      '/user/validate/token',
      AuthUtil.authenticateUser,
      AuthUtil.validateToken,
      this.userController.decodeToken
    );

    router.post('/login', this.userController.login);
    router.post('/forgot-password', this.userController.sendEmailForgotPassword);
    router.post('/update-password', AuthUtil.verifyCookie, this.userController.updateUserPassword);

    router.get('/user/:username', AuthUtil.verifyCookie, this.userController.getCurrentUserDetails);
    router.post('/user/:username/invite', AuthUtil.verifyCookie, this.userController.inviteUser);
    router.get('/user/:username/invite/users', AuthUtil.verifyCookie, this.userController.getInvitedUser);
    router.put('/user/:username/invite/update', AuthUtil.verifyCookie, this.userController.updateInvitedUser);
    router.delete('/user/:username/invite/delete', AuthUtil.verifyCookie, this.userController.deleteInvitedUser);

    router.get('/users/:username/:page', AuthUtil.verifyCookie, this.userController.getUserList);
    router.get('/users/:username/search', AuthUtil.verifyCookie, this.userController.searchUser);

    router.put('/user/:username/:usernameToBeUpdated', AuthUtil.verifyCookie, this.userController.updateUserRole);

    router.post('/logout', AuthUtil.verifyCookie, this.userController.logout);

    router.post(
      '/:username/upload/survey',
      AuthUtil.verifyCookie,
      this.surveyController.writeLocally.single('surveys'),
      SurveyService.readZipFile,
      this.surveyController.uploadSurvey
    );

    router.get('/:username/surveys/:page', AuthUtil.verifyCookie, this.surveyController.getAllSurveys);
    router.get('/:username/surveys/search', AuthUtil.verifyCookie, this.surveyController.searchSurvey);
    router.delete('/:username/survey/:id/delete', AuthUtil.verifyCookie, this.surveyController.deleteSurvey);

    /**
     * Client side APIs
     */
    router.get('/site/:siteId/survey/details/', this.surveyController.getIndividualSurveysDetails);
    router.get('/site/:siteId/survey/details/compact', this.surveyController.getSurveyCompactVersion);
    router.get('/resources/:page', this.resourceController.getAllResources);
    router.get('/documentation', this.resourceController.getAllDocumentation);
    router.get('/documentation/details', this.resourceController.getIndividualDocumentation);
    router.get('/directories/details', this.resourceController.getIndividualDirectory);
    router.get('/directories/root', this.resourceController.getRootDirectory);
    router.get('/about', this.resourceController.getAboutInfo);
    router.get('/site/:siteId/hotspot/details', this.surveyController.getIndividualHotspotDescription);
    router.get('/site/:siteId/minimap/details', this.surveyController.getMinimapImage);
    router.get('/settings', this.siteSettingsController.getSettings);
    router.get('/sites', this.siteSettingsController.getSites);
    router.post('/sites', this.siteSettingsController.createSite);

    /**
     * Admin section APIs
     */
    router.post(
      '/:username/upload/resource',
      AuthUtil.verifyCookie,
      this.resourceController.uploadFile.single('resource'),
      this.resourceController.createNewResource
    );

    router.put('/:username/resource/:id/update', AuthUtil.verifyCookie, this.resourceController.updateResource);
    router.post('/:username/area/create', AuthUtil.verifyCookie, this.resourceController.createNewArea);
    router.post('/:username/type/create', AuthUtil.verifyCookie, this.resourceController.createNewType);
    router.post('/:username/category/create', AuthUtil.verifyCookie, this.resourceController.createNewCategory);
    router.post('/:username/subcategory/create', AuthUtil.verifyCookie, this.resourceController.createNewSubcategory);

    router.get('/:username/resources/search', AuthUtil.verifyCookie, this.resourceController.searchResources);

    router.get('/:username/areas/get', AuthUtil.verifyCookie, this.resourceController.getAllResourceAreas);
    router.get('/:username/types/get', AuthUtil.verifyCookie, this.resourceController.getAllResourceTypes);
    router.get('/:username/categories/get', AuthUtil.verifyCookie, this.resourceController.getAllCategories);
    router.get('/:username/subcategories/get', AuthUtil.verifyCookie, this.resourceController.getAllSubcategories);

    router.get('/:username/visibility/settings', AuthUtil.verifyCookie, this.settingController.getSettings);
    router.put('/:username/visibility/settings', AuthUtil.verifyCookie, this.settingController.togglePagesVisibility);

    router.get('/faq/get', this.faqController.getFAQ);
    router.post('/:username/faq/post', AuthUtil.verifyCookie, this.faqController.createQuestionAnswer);
    router.put('/:username/faq/put/:idx', AuthUtil.verifyCookie, this.faqController.editQuestionAnswer);
    router.delete('/:username/faq/delete', AuthUtil.verifyCookie, this.faqController.deleteQuestionAnswer);
  }
}
