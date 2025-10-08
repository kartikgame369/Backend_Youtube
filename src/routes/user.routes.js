import { Router} from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/register")(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }

    ]),
    registerUser
)
// Router.route("/login").post(registerUser)
router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(verifyJWT, logoutUser)


export default router