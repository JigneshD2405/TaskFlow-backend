"use strict";
import Middleware from "#App/Middlewares/Middleware.js";
import Logger from "#App/Utils/Logger.js";

import Node from "#Node";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import express from "express";
import fs from "fs";
import https from "https";
import ip from "ip";
import Joi from "joi";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";
import AggregatePagination from "mongoose-aggregate-paginate-v2";
import morgan from "morgan";
import winston from "winston";

Node.Mongoose = mongoose;
Node.ip = ip;
Node.moment = moment;
Node.Fs = fs;
Node.Https = https;
Node.AggregatePagination = AggregatePagination;
Node.Joi = Joi;
Node.Winston = winston;
Node.Bcrypt = bcrypt;
Node.Jwt = jwt;
Node.Crypto = crypto;
Node.Moment = moment;


Node.Express = express();
Node.Router = express.Router();


Node.Express.use(cors());
Node.Express.use(morgan("dev"));
Node.Express.use(bodyParser.json({ limit: "50mb" }));
Node.Express.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Headers
Node.Express.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

/* ------------------------------
 * Node Initialization
 * ------------------------------ */

Node.initialize = async (port) => {
  try {
    process.env.PORT = port || process.env.PORT || 8080;
    process.env.NODE_ENV ||= Node.DEVELOPMENT_ENV;


    await (await import("#Library/mongodb.js")).load();
    await Node.Router.use(Middleware.authMiddleware);
    await (await import("#Library/http.js")).load();
    await Node.HttpServer.listen(process.env.PORT);
    await Logger.initLogger();

    const dateTime = moment().format("DD-MM-YYYY HH:mm:ss");

    console.log("|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|");
    console.log(` |         Node ${process.env.NODE_ENV} server started.                      |`);
    console.log(` |         Date: ${dateTime}                             |`);
    console.log(` |         http://${ip.address()}:${process.env.PORT}                              |`);
    console.log("|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|");

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
    });

    Node.AppInstance = Node.Express;
  } catch (error) {
    console.error("Error during Node initialization:", error);
  }
};
