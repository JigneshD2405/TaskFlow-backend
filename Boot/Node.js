/**
 * Title : Node Boot
 * Desc :  Boot Variable for Memory
 */

function Node() {
  this.Server = {};
  this.App = { Utils: {} };
  this.Mongoose = {};
  this.AggregatePagination = {};
  this.Fs = {};
  this.Os = {};
  this.Https = {};
  this.HttpServer = {};
  this.Winston = {};
  this.Bcrypt = {};
  this.UploadPath = {};
  this.Express = {};
  this.ExpressValidator = {};
  this.Router = {};
  this.Path = {};
  this.Crypto = {};
  this.Socket = {};

  this.Moment = {};
  this.Jwt = {};
  this.UUID = {};
  this.NodeMailer = {};

  this.Memory = {};
  this.TimezoneOffset = {};
  this.ip = {};
  this.logger = {};

  this.DEVELOPMENT_ENV = "development";
  this.PRODUCTION_ENV = "production";
  this.STAGING_ENV = "staging";

  this.Joi = {};


  this.UNPROTECTED_APIS = ["/register", "/sign-in", "/refresh-token"];

  this.FEATURE_LIMIT_API = [];

  this.ROUTES = {};
  this.PATIENT_TITLES = ["Mr", "Ms", "Mrs", "Miss", "Master", "Mx"];
  this.GENDER = ["Male", "Female", "Other"];
}

export default new Node();
