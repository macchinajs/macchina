import bcrypt from 'bcryptjs'
import slugify from 'slugify'
import S3 from "aws-sdk/clients/s3.js"

const s3 = new S3();

const hooks = {
  pre: {
    save: function (next) {
      // only run this if we're messing with the password field, or else bcrypt
      // will on all saves!
      if (!this.isModified('title')) {
        return next()
      }

      this.slug = slugify(this.title)
      return next()
    }
  }
}

export default hooks
