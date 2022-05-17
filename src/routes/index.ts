import { UserController } from '../controller/UserController';
import { SurveyController } from '../controller/SurveyController';
import { AuthUtil } from '../utils/AuthUtil';
import { SurveyService } from '../service/SurveyService';
import { SettingController } from '../controller/SettingController';
import { ResourceController } from '../controller/ResourceController';
import { FAQController } from '../controller/FAQController';
import SiteController from '../components/Site/SiteController';
import MapPinsController from '../components/MapPins/MapPinsController';
import multer = require('multer');
import { Request } from 'express';
import path = require('path');
import { cliVersionCheckPrintAndExit } from 'manta';

export class Routes {
  public userController: UserController = new UserController();
  public surveyController: SurveyController = new SurveyController();
  public settingController: SettingController = new SettingController();
  public resourceController: ResourceController = new ResourceController();
  public faqController: FAQController = new FAQController();
  public siteController: SiteController = new SiteController();
  public mapPinsController: MapPinsController = new MapPinsController();

  public routes(app: any, router: any): void {
    app.use('/api', router);

    const storage = multer.diskStorage({
      destination: (req: Request, file: any, cb: any) => cb(null, 'tmp/'),
      filename: (req: Request, file: any, cb: any) => {
        if (
          [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/bmp',
            'image/gif',
            'image/webp',
          ].includes(file.mimetype)
        )
          cb(
            null,
            `${
              file.originalname.replaceAll(' ', '_').split('.')[0]
            }-${Date.now()}.webp`,
          );
        else cb(null, file.originalname);
      },
    });

    const upload = multer({ storage: storage });

    router.post(
      '/user/create',
      AuthUtil.authenticateUser,
      this.userController.createNewUser,
    );
    router.post(
      '/user/validate/token',
      AuthUtil.authenticateUser,
      AuthUtil.validateToken,
      this.userController.decodeToken,
    );

    router.post('/login', this.userController.login);
    router.post(
      '/forgot-password',
      this.userController.sendEmailForgotPassword,
    );
    router.post(
      '/update-password',
      AuthUtil.verifyCookie,
      this.userController.updateUserPassword,
    );

    router.get('/logged-in-user', this.userController.getLoggedInUser);

    router.get(
      '/user/:username',
      AuthUtil.verifyCookie,
      this.userController.getCurrentUserDetails,
    );

    router.get(
      '/users/:username/:page',
      AuthUtil.verifyCookie,
      this.userController.getUserList,
    );
    router.get(
      '/users/:username/search',
      AuthUtil.verifyCookie,
      this.userController.searchUser,
    );

    router.put(
      '/user/:username/:usernameToBeUpdated',
      AuthUtil.verifyCookie,
      this.userController.updateUserRole,
    );

    router.post('/logout', AuthUtil.verifyCookie, this.userController.logout);

    router.get(
      '/:username/surveys/:page',
      AuthUtil.verifyCookie,
      this.surveyController.getAllSurveys,
    );
    router.get(
      '/:username/surveys/search',
      AuthUtil.verifyCookie,
      this.surveyController.searchSurvey,
    );
    router.delete(
      '/:username/survey/:id/delete',
      AuthUtil.verifyCookie,
      this.surveyController.deleteSurvey,
    );

    /**
     * Client side APIs
     */

    //Surveys
    router.get(
      '/site/:siteId/survey/details/',
      this.surveyController.getIndividualSurveysDetails,
    );
    router.get(
      '/site/:siteId/survey/minimapSingleSite/',
      this.surveyController.getSingleSiteNodeData,
    );
    router.get(
      '/site/:siteId/survey/details/compact',
      this.surveyController.getSurveyCompactVersion,
    );

    router.post(
      '/site/:siteId/addScenes',
      upload.fields([{ name: 'zipFile' }, { name: 'properties' }]),
      this.surveyController.uploadScenes,
    );

    //resources
    router.get(
      '/site/:siteId/resources/:page',
      this.resourceController.getAllResources,
    );

    //documentation
    router.get(
      '/site/:siteId/documentation',
      this.resourceController.getAllDocumentation,
    );
    router.get(
      '/documentation/details',
      this.resourceController.getIndividualDocumentation,
    );

    //directores
    router.get(
      '/directories/details',
      this.resourceController.getIndividualDirectory,
    );
    router.get(
      '/site/:siteId/directories/root',
      this.resourceController.getRootDirectory,
    );

    //about
    router.get('/site/:siteId/about', this.resourceController.getAboutInfo);

    //hotspot
    router.get(
      '/site/:siteId/hotspot/details',
      this.surveyController.getIndividualHotspotDescription,
    );

    //minimap
    router.get(
      '/site/:siteId/minimap/details',
      this.surveyController.getMinimapImage,
    );

    router.post(
      '/site/:siteId/sitemap',
      upload.single('file'),
      this.surveyController.createSiteMap,
    );

    //settings
    router.get('/site/:siteId/settings', this.siteController.getSettings);

    //sites
    router.get('/sites', this.siteController.getSites);
    router.post('/sites', this.siteController.createSite);
    router.get('/site-map', this.siteController.getSiteMap);

    //Map pins

    router.post('/map-pins', this.mapPinsController.createPin);
    router.get('/map-pins', this.mapPinsController.getAllPins);
    router.get('/map-pins/:id', this.mapPinsController.getPin);
    router.patch('/map-pins/:id', this.mapPinsController.updatePin);
    router.delete('/map-pins/:id', this.mapPinsController.deletePin);

    /**
     * API to upload site pin preview image
     */
    router.post(
      '/map-pins/preview',
      upload.single('file'),
      this.mapPinsController.uploadPreview,
    );

    /**
     * Admin section APIs
     */
    router.post(
      '/:username/upload/resource',
      AuthUtil.verifyCookie,
      this.resourceController.uploadFile.single('resource'),
      this.resourceController.createNewResource,
    );

    router.put(
      '/:username/resource/:id/update',
      AuthUtil.verifyCookie,
      this.resourceController.updateResource,
    );
    router.post(
      '/:username/area/create',
      AuthUtil.verifyCookie,
      this.resourceController.createNewArea,
    );
    router.post(
      '/:username/type/create',
      AuthUtil.verifyCookie,
      this.resourceController.createNewType,
    );
    router.post(
      '/:username/category/create',
      AuthUtil.verifyCookie,
      this.resourceController.createNewCategory,
    );
    router.post(
      '/:username/subcategory/create',
      AuthUtil.verifyCookie,
      this.resourceController.createNewSubcategory,
    );

    router.get(
      '/:username/resources/search',
      AuthUtil.verifyCookie,
      this.resourceController.searchResources,
    );

    router.get(
      '/:username/areas/get',
      AuthUtil.verifyCookie,
      this.resourceController.getAllResourceAreas,
    );
    router.get(
      '/:username/types/get',
      AuthUtil.verifyCookie,
      this.resourceController.getAllResourceTypes,
    );
    router.get(
      '/:username/categories/get',
      AuthUtil.verifyCookie,
      this.resourceController.getAllCategories,
    );
    router.get(
      '/:username/subcategories/get',
      AuthUtil.verifyCookie,
      this.resourceController.getAllSubcategories,
    );

    router.get(
      '/:username/visibility/settings',
      AuthUtil.verifyCookie,
      this.settingController.getSettings,
    );
    router.put(
      '/:username/visibility/settings',
      AuthUtil.verifyCookie,
      this.settingController.togglePagesVisibility,
    );

    router.get('/faq/get', this.faqController.getFAQ);
    router.post(
      '/:username/faq/post',
      AuthUtil.verifyCookie,
      this.faqController.createQuestionAnswer,
    );
    router.put(
      '/:username/faq/put/:idx',
      AuthUtil.verifyCookie,
      this.faqController.editQuestionAnswer,
    );
    router.delete(
      '/:username/faq/delete',
      AuthUtil.verifyCookie,
      this.faqController.deleteQuestionAnswer,
    );
  }
}
