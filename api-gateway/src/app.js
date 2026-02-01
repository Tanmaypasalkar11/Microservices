const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true, credentials: true }));

// Auth Service Proxy
app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader(
        "x-internal-secret",
        process.env.INTERNAL_SERVICE_SECRET,
      );
    },
  }),
);

// Todo Service Proxy
app.use(
  "/todos",
  createProxyMiddleware({
    target: process.env.TODO_SERVICE_URL,
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader(
        "x-internal-secret",
        process.env.INTERNAL_SERVICE_SECRET,
      );
    },
  }),
);

module.exports = app;
