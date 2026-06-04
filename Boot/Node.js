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
  this.Https = {};
  this.HttpServer = {};
  this.Winston = {};
  this.Bcrypt = {};
  this.Express = {};
  this.Router = {};
  this.Socket = {};
  this.Moment = {};
  this.Jwt = {};
  this.ip = {};
  this.logger = {};

  this.DEVELOPMENT_ENV = "development";
  this.PRODUCTION_ENV = "production";
  this.STAGING_ENV = "staging";

  this.Joi = {};

  this.UNPROTECTED_APIS = [
    "/sign-in",
  ];

}

export default new Node();
