import { environment } from '../../../environments/environment';

export const APP_TITLE = 'Infinisense';

/* REQUEST */
//export const BASEURL_DEV = 'http://localhost:8080/uaa/api';
export const BASEURL_PROXY = environment.APIEndpoint; //'ebuy-gw';
export const REQUEST_RESET_PASSWORD_PATH = "public/api/users/password/recovery";
export const RESET_PASSWORD_PATH = "public/api/users/password/reset/";
export const VALIDATE_TOKEN_PATH = "public/api/users/password/validationToken";
export const CHANGE_PASSWORD_URL = BASEURL_PROXY + '/uaa/' + RESET_PASSWORD_PATH;
export const PORTAL_CHANGE_PASSWORD_URL = BASEURL_PROXY + '/portal/' + RESET_PASSWORD_PATH;
export const BASEURL_DEV_PRODUCTS = BASEURL_PROXY + '/product/api/';
export const BASEURL_DEV_MASTER_DATA = BASEURL_PROXY + '/masterdata/api/';
export const BASEURL_DEV_CLIENT_DATA = BASEURL_PROXY + '/tenant/public/api/clients/';
export const BASEURL_DEV_LOGIN = BASEURL_PROXY + '/api/user/authenticate';

export const BASEURL_DEV_USER = BASEURL_PROXY + '/api/user';
export const BASEURL_DEV_VISIT = BASEURL_PROXY + '/api/visit';
export const BASEURL_DEV_REASON = BASEURL_PROXY + '/api/reason';
export const BASEURL_DEV_REASON_PROJECT_PARTICIPANT = BASEURL_PROXY + '/api/reasonprojectparticipant';
export const BASEURL_DEV_REASON_PROJECT_TOKEN = BASEURL_PROXY + '/api/reasonprojecttoken';
export const BASEURL_DEV_REASON_PROJECT_EMAIL = BASEURL_PROXY + '/api/reasonprojectemail';
export const BASEURL_DEV_MESSAGE = BASEURL_PROXY + '/api/message';

export const BASEURL_DEV_PLANT = BASEURL_PROXY + '/api/plant';
export const BASEURL_DEV_PLANTCOORDINATES = BASEURL_PROXY + '/api/plantCoordinate';
export const BASEURL_DEV_SENSORTYPE = BASEURL_PROXY + '/api/sensortype';
export const BASEURL_DEV_EPI = BASEURL_PROXY + '/api/epi';
export const BASEURL_DEV_COMPANY = BASEURL_PROXY + '/api/company';
export const BASEURL_API_WEATHER = 'https://api.weatherbit.io/v2.0/current';
export const WEATHER = 'weather';
export const AIRPOLLUTION = 'airquality';



export const NO_PHOTO_URL = "/assets/images/nophoto.jpg";
export const MASTER_DATA_CATEGORY = '/masterdata/api/categories';

export const statusList: any = [
  { value: "Activo", title: "Activo" },
  { value: "Mantenimiento", title: "Mantenimiento" },
  { value: "Fuera de Servicio", title: "Fuera de Servicio" }
];

export const aliroAccess = ["user-external", "visit-external", "visit-reason", "epis"];
export const ergoAccess = ["sensor-type", "plant-sensor"];
export const commonAccess = ["dashboard", "company-customer", "user-management", "plant-management", "plant-plane"];

/* MESSAGES */
export const SUCCESS = 'Success';
export const INFO = 'Info';
export const WARNING = 'Warning';
export const ERROR = 'Error';
export const SUCCESS_NEW = 'Record Created';
export const SUCCESS_UPDATE = 'Record Updated';
export const SUCCESS_REMOVE = 'Record(s) Deleted';
export const ACTION = 'ACTION';
export const ACTION_SAVE_TRANSLATION = "ACTION_SAVE_TRANSLATION";
export const ACTION_DELETE_TRANSLATION = "ACTION_DELETE_TRANSLATION";
export const ACTION_CONFIRM = 'ACTION_CONFIRM';
export const ACTION_ROLE_USER_ASSIGMENT = "ACTION_ROLE_USER_ASSIGMENT";
export const ACTION_ROLE_OVERVIEW = "ACTION_ROLE_OVERVIEW";
export const ACTION_SAVE = 'SAVE';
export const ACTION_DELETE = 'DELETE';
export const ACTION_RESET = 'RESET';
export const ACTION_CLOSE = 'CLOSE';
export const ACTION_DEACTIVATE_PORTAL_ACCOUNT = "DEACTIVATE_PORTAL_ACCOUNT";
export const CONFIRMATION_OK = "OK";
export const CONFIRMATION_NO = "OK";


/** Formats */
export const DATE_FORMAT = "MM/dd/yyyy";
export const DATETIME_FORMAT = "MM/dd/yyyy HH:mm:ss";
export const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";
export const DISPLAY_DATETIME_FORMAT = "dd/MM/yyyy HH:mm:ss a";
