import { UserController } from '../controller/UserController';
import { SurveyController } from '../controller/SurveyController';
import { AuthUtil } from '../utils/AuthUtil';
import { SettingController } from '../controller/SettingController';
import { ResourceController } from '../controller/ResourceController';
import { FAQController } from '../controller/FAQController';
import SiteController from '../components/Site/SiteController';
import MapPinsController from '../components/MapPins/MapPinsController';
import multer = require('multer');
import { Request } from 'express';
export class Routes {
  public userController: UserController = new UserController();
  public surveyController: SurveyController = new SurveyController();
  public settingController: SettingController = new SettingController();
  public resourceController: ResourceController = new ResourceController();
  public faqController: FAQController = new FAQController();
  public siteController: SiteController = new SiteController();
  public mapPinsController: MapPinsController = new MapPinsController();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public routes(app: any, router: any): void {
    app.use(
      '/api',
      (req: Request, res: any, next: any) => {
        const cookie = req.cookies['elipse-session'];

        if (cookie === undefined) {
          // Generate a new unique ID for the session
          const newSessionId = Math.random().toString(36).substring(2);
          // Set the new session cookie with a 20-minute expiration time
          res.cookie('elipse-session', newSessionId, {
            maxAge: 20 * 60 * 1000, // 20 minutes
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          });
        } else {
          // If the cookie exists, extend its expiration time by 20 minutes
          res.cookie('elipse-session', cookie, {
            maxAge: 20 * 60 * 1000, // 20 minutes
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          });
        }

        next();
      },
      router,
    );

    const storage = multer.diskStorage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      destination: (req: Request, file: any, cb: any) =>
        cb(null, process.env.TMP_FOLDER),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              file.originalname.replaceAll(/[^a-zA-Z0-9-]/g, '').split('.')[0]
            }-${Date.now()}.webp`,
          );
        else cb(null, file.originalname.replaceAll(/[^a-zA-Z0-9-.]/g, ''));
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
    router.get(
      '/login/sso',
      AuthUtil.authenticateUser,
      this.userController.loginOrCreateUser,
    );
    router.post(
      '/forgot-password',
      this.userController.sendEmailForgotPassword,
    );
    router.post(
      '/update-password',
      AuthUtil.verifyCookie,
      this.userController.updateUserPassword,
    );

    router.get(
      '/login/user/info',
      AuthUtil.authenticateUser,
      this.userController.getUserInfo,
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

    // Surveys
    router.get(
      '/site/:siteId/survey/details/',
      this.surveyController.getIndividualSurveysDetails,
    );
    router.get(
      '/site/:siteId/:floorId/survey/minimapSingleSite/',
      this.surveyController.getSingleSiteNodeData,
    );
    router.get(
      '/site/:siteId/survey/details/compact',
      this.surveyController.getSurveyCompactVersion,
    );

    router.post(
      '/site/:siteId/:floorId/addScenes',
      upload.fields([{ name: 'zipFile' }, { name: 'properties' }]),
      this.surveyController.uploadScenes,
    );

    // resources
    router.get(
      '/site/:siteId/resources/:page',
      this.resourceController.getAllResources,
    );

    router.post(
      '/documentation/:siteId',
      upload.fields([{ name: 'zipFile' }]),
      this.resourceController.UploadDocumentation,
    );

    // documentation
    router.get(
      '/site/:siteId/files',
      this.resourceController.getAllDocumentation,
    );
    router.get(
      '/files/details',
      this.resourceController.getIndividualDocumentation,
    );

    // directores
    router.get(
      '/directories/details',
      this.resourceController.getIndividualDirectory,
    );
    router.get(
      '/site/:siteId/directories/root',
      this.resourceController.getRootDirectory,
    );

    // about
    router.get('/site/:siteId/about', this.resourceController.getAboutInfo);

    // hotspot
    router.get(
      '/site/:siteId/hotspot/details',
      this.surveyController.getIndividualHotspotDescription,
    );

    // minimap
    router.get(
      '/site/:siteId/minimap/details',
      this.surveyController.getMinimapImage,
    );

    router.post(
      '/site/:siteId/minimap',
      upload.single('file'),
      this.surveyController.createMinimap,
    );

    router.patch(
      '/site/:siteId/sitemap',
      this.surveyController.updateMinimapFloorDetails,
    );

    // get floor information
    router.get(
      '/site/:siteId/minimap/floors',
      this.surveyController.getMinimapFloors,
    );

    // add empty floor
    router.get(
      '/site/:siteId/minimap/newFloor/:floor',
      this.surveyController.addMinimapFloor,
    );

    // return existence of survey for a site
    router.get(
      '/site/:siteId/exists',
      this.surveyController.getSurveyExistence,
    );

    // get empty floors for a survey
    router.get(
      '/site/:siteId/emptyFloors',
      this.surveyController.getEmptyFloors,
    );

    // get existence of a survey for a floor
    router.get(
      '/site/:siteId/:floorId/exists',
      this.surveyController.getFloorSurveyExistence,
    );

    /**
     * Routes for editing the coordinates and fov of minimap nodes
     */
    router.patch(
      '/node/coords/:nodeId',
      this.surveyController.updateNodeCoordinates,
    );
    router.patch(
      '/node/rotation/:nodeId',
      this.surveyController.updateNodeRotation,
    );

    // settings
    router.get('/site/:siteId/settings', this.siteController.getSettings);

    // sites
    router.get('/sites', this.siteController.getSites);
    router.post('/sites', this.siteController.createSite);
    router.get('/site-map/:name', this.siteController.getSitemap);
    router.post('/create-site-map', this.siteController.createSitemap);

    // Map pins
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

    router.get('/settings', this.settingController.getSettings);

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
