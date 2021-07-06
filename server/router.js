const jwt = require('jsonwebtoken')
import passport from 'passport'
import rateLimit   from "express-rate-limit"

import userController from '#fabo/models/methods.js'
import User from '#fabo/models/User'

const auth = passport.authenticate("jwt", { session: false })

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  message: {errors: [{username: 'Too many attempts.'}]},
  max: 20
});

// 3. Routes
const router = (app) => {
  console.log("Setup routes...")
  // 4. Authentication Routes
  app.post("/auth/login", apiLimiter, userController.signinUser)
  app.post("/auth/signup", apiLimiter, userController.signupUser)
  app.post("/auth/refreshtoken", apiLimiter, userController.refreshToken)
  app.post("/auth/verifyEmail/:userid/:token", apiLimiter, userController.verifyEmail)
  app.get("/profile", auth, userController.getCurrentUser)

  // 5. Application Routes
}

export default router
